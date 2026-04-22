import { useRef, useState } from "react";
import { FirstPage } from "./intake-pages/FirstPage";
import { SecondPage } from "./intake-pages/SecondPage";
import { ThirdPage } from "./intake-pages/ThirdPage";
import { FourthPage } from "./intake-pages/FourthPage";

export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(1);

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
    } )
    
    const handleChange = (data: Partial<FormInformation>) => {

        formInformation.current = {
            ...formInformation.current,
            ...data,
        };

        console.log(formInformation);
    }

    const handleBack = () => {
        if(currentPage > 1)
            setCurrentPage(currentPage-1);
    }

    const handleNext = () => {
        if(currentPage < 4)
            setCurrentPage(currentPage+1);
    }

    const handleSubmit = () => {
        console.log(formInformation);
    }

    return (
        <div>
            {currentPage===1&&<FirstPage handleChange={handleChange} handleNext={handleNext}/>}
            {currentPage===2&&<SecondPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext}></SecondPage>}
            {currentPage===3&&<ThirdPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext}></ThirdPage>}
            {currentPage===4&&<FourthPage handleChange={handleChange} handleBack={handleBack} fullSubmit={handleSubmit}></FourthPage>}
        </div>
    );
};