import { useRef, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { FirstPage } from "./intake-pages/FirstPage";
import { SecondPage } from "./intake-pages/SecondPage";
import { ThirdPage } from "./intake-pages/ThirdPage";
import { FourthPage } from "./intake-pages/FourthPage";
import { FifthPage } from "./intake-pages/FifthPage";
import { LoadingPage } from "./intermediate-pages/LoadingPage";
import { ErrorPage } from "./intermediate-pages/ErrorPage";
import { SuccessPage } from "./intermediate-pages/SuccessPage";
import { CheckoutForm } from "./intake-pages/CheckoutForm";
import { BrowserRouter as Router, Route, Routes } from "react-router";

export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setError] = useState(false);

    const stripePromise = loadStripe("pk_test_51TjR3YJGGV70rOUMpvlOqjseDg837tLF7sByGQusQA2HL0FFFenEReDm632SaFvd5TB0DwMhKyg92HeFmNW9XrKt00rVP6wvRN");
    const [clientSecret, setClientSecret] = useState('');
    
    type FormInformation = {
        location: string;
        arriveTime: string;
        leaveTime: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        carType: string;
        carMake: string;
        carModel: string;
        carYear: string;
        licensePlateNumber: string;
        service: string;
        addons: string[];
    };

    const formInformation = useRef<FormInformation>( {
        location: "",
        arriveTime: "",
        leaveTime: "",
        
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",

        carType: "",
        carMake: "",
        carModel: "",
        carYear: "",
        licensePlateNumber: "",

        service: "",
        addons: [""],
    });
    
    type SurveyOptions = {
        locations: string[],
        services: string[],
        possibleAddons: string[],
        addons: string[],
    }

    const surveyOptions = useRef<SurveyOptions>({
        locations: [""],
        services: [""],
        possibleAddons: [""],
        addons: [""],
    })

    type TotalCost = {
        totalPrice: number,
        totalDuration: number
    }

    const totalCost = useRef<TotalCost>({
        totalPrice: 0,
        totalDuration: 0,
    })

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                const optionReponse = await axios.get("http://localhost:3000/survey/options");
                surveyOptions.current = optionReponse.data;
            } catch(error) {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }
        fetchOptions();        
    }, [])

    const fetchAddonOptions = async (serviceType: string) => {
        try {
            const addonOptionResponse = await axios.get(`http://localhost:3000/survey/appropriate-addons?serviceType=${serviceType}`);
            surveyOptions.current.possibleAddons = addonOptionResponse.data;
            return addonOptionResponse.data
        } catch(error) {
            setError(true);
            return [];
        }
    }

    const calculateTotals = async () => {
        try {
            setIsLoading(true);
            const addonOptions = formInformation.current.addons
                .map(addon => `addons=${encodeURIComponent(addon)}`)
                .join('&');
            const costResponse = await axios(`http://localhost:3000/survey/cost?service=${formInformation.current.service}&size=${formInformation.current.carType}&${addonOptions}`)
            totalCost.current = {
                ...totalCost.current,
                ...costResponse.data,
            };
        } catch(error) {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleChange = (data: Partial<FormInformation>) => {
        formInformation.current = {
            ...formInformation.current,
            ...data,
        };
        console.log(formInformation);
    }

    const handleBack = () => {
        if(currentPage > 0)
            setCurrentPage(currentPage-1);
    }

    const handleNext = () => {
        if(currentPage < pages.length)
            setCurrentPage(currentPage+1);
    }

    const handleSubmit = async () => {
        const res = await axios.post(`http://localhost:3000/survey/booking`, formInformation.current)
        setClientSecret(res.data.clientSecret);
    }

    /* just a simple little setup right now, fix it later:
    */
    const appearance = {
        theme: 'stripe',
    } as const;
  // Enable the skeleton loader UI for optimal loading.
    const loader = 'auto';
    if(clientSecret) {
        return (
            <Elements 
                stripe={stripePromise}
                options={{clientSecret, appearance, loader}} 
                >
                <CheckoutForm />
            </Elements>
        )
    }
    

    const pages = [
        <FirstPage 
        handleChange={handleChange} handleNext={handleNext} surveyOptions={surveyOptions.current}
        defaultValues={{ 
            location: formInformation.current.location, 
            arriveTime: formInformation.current.arriveTime, 
            leaveTime: formInformation.current.leaveTime 
        }}/>,
        <SecondPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext} 
        defaultValues={{ 
            firstName: formInformation.current.firstName,
            lastName: formInformation.current.lastName, 
            email: formInformation.current.email, 
            phoneNumber: formInformation.current.phoneNumber 
        }}/>,
        <ThirdPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext}
        defaultValues={{
            carType: formInformation.current.carType,
            carMake: formInformation.current.carMake,
            carModel: formInformation.current.carModel,
            carYear: formInformation.current.carYear,
            licensePlateNumber: formInformation.current.licensePlateNumber,
        }}/>,
        <FourthPage handleChange={handleChange} getAppropriateAddons={fetchAddonOptions} calculateTotals={calculateTotals} handleBack={handleBack} handleNext={handleNext} surveyOptions={surveyOptions.current}
        defaultValues={{
            service: formInformation.current.service,
            addons: formInformation.current.addons,
        }} 
        />,
        <FifthPage handleBack={handleBack} handleSubmit={handleSubmit} price={totalCost.current.totalPrice} duration={totalCost.current.totalDuration}/>
    ];

    if(hasError) {
        return (
            <div><ErrorPage/></div>
            )
    }
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={ <div> {isLoading?<LoadingPage />:pages[currentPage]} </div>} />
                <Route path="/success" element={ <SuccessPage />} />
            </Routes>
        </Router>
    );
    
};