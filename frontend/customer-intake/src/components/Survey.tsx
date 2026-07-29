import { useRef, useState, } from "react";
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
import { CheckoutPage } from "./intake-pages/CheckoutPage";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAddonOptions, fetchLocationTimes, fetchSurveyOptions, fetchTotals } from "../Fetch";
import { WaitlistPage } from "./intake-pages/WaitlistPage";
import { AfterPaymentPage } from "./intermediate-pages/AfterPaymentPage";

/* TODO: 
    - ADD ERROR HANDLING for when the webhook isn't actually successful
    - FINISH the scheduling conflict waitlist addition
*/


export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [clientSecret, setClientSecret] = useState('');

    const [location, setLocation] = useState('');
    const [service, setService] = useState('');
    const [addons, setAddons] = useState<string[]>([]);

    const [hasError, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('')
    const [manualIsLoading, setManualIsLoading] = useState(false);

    const [scheduleConflict, setScheduleConflict] = useState(false);

    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    const appearance = { theme: 'stripe' } as const;
    const loader = 'auto';
    
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

    const queryClient = useQueryClient();

    const surveyOptionsQuery = useQuery<SurveyOptions>({
        queryKey : ['surveyOptions'],
        queryFn: fetchSurveyOptions,
        retry: 1,
    }); surveyOptions.current = surveyOptionsQuery.data ?? surveyOptions.current;

    const locationTimesQuery = useQuery({
        queryKey: ['location', location],
        queryFn: () => fetchLocationTimes(location),
        enabled: location != '',
        staleTime: 5*60*1000,
    }); const locationTimeFrame = locationTimesQuery.data ?? {timeStart: '', timeEnd: ''};
    if(locationTimeFrame.timeStart === '') {
        formInformation.current.arriveTime = '';
        formInformation.current.leaveTime = '';
    }
    
    const addonOptionsQuery = useQuery({
        queryKey: ['service', service],
        queryFn: () => fetchAddonOptions(service),
        enabled: service != '',
        staleTime: 5*60*1000,
    }); const addonOptions = addonOptionsQuery.data ?? { undefined: undefined };

    const calculateTotals = async () => {
        try {
            setManualIsLoading(true);
            const data = await queryClient.fetchQuery({
                queryKey: ['totals', service, addons, formInformation.current.carType],
                queryFn: () => fetchTotals(service, addons, formInformation.current.carType),
                staleTime: 5*60*1000,
            });
            totalCost.current = {
                ...totalCost.current, 
                ...data,
        }
        } catch(error) {
            setError(true);
            setErrorMessage("Unable to calculate totals");
        } finally {
            setManualIsLoading(false);
        }
        
    }

    const addToWaitlist = async () => {
        axios.get('')
    }

    const handleLocationChange = (newLocation: string) => {
        setLocation(newLocation);
        handleChange({ location: newLocation });
    }

    const handleServiceChange = (newService: string) => {
        setService(newService);
        handleChange({ service: newService });
    }

    const handleAddonChange = (newAddons : string[]) => {
        setAddons(newAddons);
        handleChange({ addons: newAddons });
    }
    
    const handleChange = (data: Partial<FormInformation>) => {
        formInformation.current = {
            ...formInformation.current,
            ...data,
        };
    };

    const handleBack = () => {
        if(currentPage > 0)
            setCurrentPage(currentPage-1);
    };

    const handleNext = () => {
        if(currentPage < pages.length)
            setCurrentPage(currentPage+1);
    };

    const handleSubmit = async (turnstileToken : string) => {
        try {
            setManualIsLoading(true);
            const res = await axios.post(`http://localhost:3000/survey/booking`, formInformation.current, {
                headers: {
                    "turnstile-token": turnstileToken,
                }
            })
            setClientSecret(res.data.clientSecret);
        } catch(error: unknown) {
            if(axios.isAxiosError(error) && error.response?.status === 403) {
                setError(true);
                setErrorMessage("Booking request not authorized");
            } else if(axios.isAxiosError(error) && error.response?.status === 409) {
                setScheduleConflict(true);
            }
        } finally {
            setManualIsLoading(false);
        }
    };

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
    
    const isLoading = surveyOptionsQuery.isLoading || /*locationTimesQuery.isLoading ||*/  manualIsLoading;
    const activeError = surveyOptionsQuery.isError && "Connection Failed" ||
                        hasError && errorMessage ||
                        addonOptionsQuery.isError && "Unable to find addons" ||
                        locationTimesQuery.isError && "Unable to load location times";

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
        <FourthPage handleChange={handleChange} handleServiceChange={handleServiceChange} handleAddonChange={handleAddonChange}
        calculateTotals={calculateTotals} handleBack={handleBack} handleNext={handleNext} 
        surveyOptions={surveyOptions.current} addonOptions={addonOptions}
        defaultValues={{
            service: formInformation.current.service,
            addons: formInformation.current.addons,
        }} 
        />,
        <FifthPage handleBack={handleBack} handleSubmit={handleSubmit} price={totalCost.current.totalPrice} duration={totalCost.current.totalDuration}/>
    ];

    if(activeError) {        
        return (
            <div><ErrorPage message={activeError}/></div>
        )
    }

    if(scheduleConflict) {
        return (
            <WaitlistPage handleWaitlistAddition={addToWaitlist}/>
        )
    }
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={ <div> {isLoading ? <LoadingPage /> : pages[currentPage] } </div>} />
                <Route path="/after-payment" element={ <AfterPaymentPage />} />
            </Routes>
        </Router>
    );
    
};