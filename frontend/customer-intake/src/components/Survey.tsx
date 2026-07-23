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
import { CheckoutPage } from "./intake-pages/CheckoutPage";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAddonOptions, fetchLocationTimes, fetchSurveyOptions, fetchTotals } from "../Fetch";

export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [clientSecret, setClientSecret] = useState('');

    const [location, setLocation] = useState('');
    const [service, setService] = useState('');
    const [addons, setAddons] = useState([]);
    const [carType, setCarType] = useState('');

    const [hasError, setError] = useState(false);

    const stripePromise = loadStripe("pk_test_51TjR3YJGGV70rOUMpvlOqjseDg837tLF7sByGQusQA2HL0FFFenEReDm632SaFvd5TB0DwMhKyg92HeFmNW9XrKt00rVP6wvRN");
    
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
    }

    const surveyOptions = useRef<SurveyOptions>({
        locations: [""],
        services: [""],
    })

    type TotalCost = {
        totalPrice: number,
        totalDuration: number
    }

    const totalCost = useRef<TotalCost>({
        totalPrice: 0,
        totalDuration: 0,
    })

    /*
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
    }, []);*/

    const surveyOptionsQuery = useQuery({
        queryKey : ['surveyOptions'],
        queryFn: fetchSurveyOptions,
    }); surveyOptions.current = surveyOptionsQuery.data;

    const locationTimesQuery = useQuery({
        queryKey: ['location', location],
        queryFn: () => fetchLocationTimes(location),
        enabled: location != '',
    }); const locationTimeFrame = locationTimesQuery.data ?? {timeStart: '', timeEnd: ''};
    if(locationTimeFrame.timeStart === '') {
        formInformation.current.arriveTime = '';
        formInformation.current.leaveTime = '';
    }
    
    const addonOptionsQuery = useQuery({
        queryKey: ['service', service],
        queryFn: () => fetchAddonOptions(service),
        enabled: service != '',
    }); const addonOptions = addonOptionsQuery.data ?? { undefined: undefined };

    const totalCostQuery = useQuery({
        queryKey: ['service', formInformation.current.service, 
                   'addons', formInformation.current.addons, 
                   'carType', formInformation.current.carType],
        queryFn: () => fetchTotals(service, addons, carType),
        enabled: false,
    });
    
    totalCost.current = {
        ...totalCost.current, 
        ...totalCostQuery.data,
    }
    
    /*
    const fetchAddonOptions = async (serviceType: string) => {
        try {
            const addonOptionResponse = await axios.get(`http://localhost:3000/survey/appropriate-addons?serviceType=${serviceType}`);
            surveyOptions.current.possibleAddons = addonOptionResponse.data;
            return addonOptionResponse.data
        } catch(error) {
            setError(true);
            return [];
        }
    };


    const fetchLocationTimes = async (location: string) => {
        try {
            const timesResponse = await axios.get(`http://localhost:3000/survey/appropriate-times?location=${location}`);
            return {timeStart: timesResponse.data.timeStart, timeEnd: timesResponse.data.timeEnd};
        } catch(error) {
            setError(true);
            return {};
        }
    };*/

    const handleLocationChange = (newLocation: string) => {
        setLocation(newLocation);
        handleChange({ location: newLocation });
    }

    const handleServiceChange = (newService: string) => {
        setService(newService);
        handleChange({ service: newService });
    }

    /*
    const calculateTotals = async () => {
        try {
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
        }
    };*/
    
    const handleChange = (data: Partial<FormInformation>) => {
        formInformation.current = {
            ...formInformation.current,
            ...data,
        };
        //console.log(formInformation);
    };

    const handleBack = () => {
        if(currentPage > 0)
            setCurrentPage(currentPage-1);
    };

    const handleNext = () => {
        if(currentPage < pages.length)
            setCurrentPage(currentPage+1);
    };

    const handleSubmit = async () => {
        const res = await axios.post(`http://localhost:3000/survey/booking`, formInformation.current)
        setClientSecret(res.data.clientSecret);
    };

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
                <CheckoutPage price={totalCost.current.totalPrice} />
            </Elements>
        )
    }
    
    const isLoading = surveyOptionsQuery.isLoading || locationTimesQuery.isLoading || totalCostQuery.isLoading;

    const pages = [
        <FirstPage 
        handleChange={handleChange} handleNext={handleNext} handleLocationChange={handleLocationChange}
        surveyOptions={surveyOptions.current} timeFrame={locationTimeFrame}
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
        <FourthPage handleChange={handleChange} handleServiceChange={handleServiceChange}
        calculateTotals={totalCostQuery.refetch} handleBack={handleBack} handleNext={handleNext} 
        surveyOptions={surveyOptions.current} addonOptions={addonOptions}
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