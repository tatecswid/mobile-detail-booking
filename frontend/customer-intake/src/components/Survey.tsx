import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { FirstPage } from "./intake-pages/FirstPage";
import { SecondPage } from "./intake-pages/SecondPage";
import { ThirdPage } from "./intake-pages/ThirdPage";
import { FourthPage } from "./intake-pages/FourthPage";
import { LoadingPage } from "./intermediate-pages/LoadingPage";

export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
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
        addons: string[],
    }

    const surveyOptions = useRef<SurveyOptions>({
        locations: [""],
        services: [""],
        addons: [""],
    })

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);

            let locationResponse = await axios.get("http://localhost:3000/customer/locations");
            let serviceResponse = await axios.get("http://localhost:3000/customer/services");
            let addonOptions = [""];

            const locationOptions = locationResponse.data.map((item : { location_name: string }) => item.location_name);
            const serviceOptions = serviceResponse.data.map((item : { service_name: string }) => item.service_name);

            surveyOptions.current = {
                locations: locationOptions,
                services: serviceOptions,
                addons: addonOptions,
            }

            setIsLoading(false);
            console.log(surveyOptions.current);
        }

        fetchOptions();
        
        
    }, [])
    
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
        if(currentPage < 3)
            setCurrentPage(currentPage+1);
    }

    const handleSubmit = () => {
        console.log(formInformation);
    }

    const pages = [
        <FirstPage 
        handleChange={handleChange} handleNext={handleNext}  surveyOptions={surveyOptions.current}
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
        <FourthPage handleChange={handleChange} handleBack={handleBack} fullSubmit={handleSubmit}
        defaultValues={{
            service: formInformation.current.service,
            addons: formInformation.current.addons,
        }}/>
    ];

     

    return (
        <div>
            {isLoading?<LoadingPage/>:pages[currentPage]}
        </div>
    );
};