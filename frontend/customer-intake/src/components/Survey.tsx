import { useRef, useState } from "react";
import { FirstPage } from "./intake-pages/FirstPage";
import { SecondPage } from "./intake-pages/SecondPage";
import { ThirdPage } from "./intake-pages/ThirdPage";

export const Survey = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const formInformation = useRef( {
        location: "",
        dropOff: "",
        pickUp: "",
        
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",

        carType: "",
        carMake: "",
        carModel: "",
        carYear: "",
        lisensePlateNumber: "",
    } )
    
    const handleChange = (e:any) => {

        formInformation.current = {
            ...formInformation.current,
            ...e,
        };

        console.log(formInformation);
    }

    const handleBack = () => {
        if(currentPage > 1)
            setCurrentPage(currentPage-1);
    }

    const handleNext = () => {
        if(currentPage < 3)
            setCurrentPage(currentPage+1);
    }

    return (
        <div>
            {currentPage===1&&<FirstPage handleChange={handleChange} handleNext={handleNext}/>}
            {currentPage===2&&<SecondPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext}></SecondPage>}
            {currentPage===3&&<ThirdPage handleChange={handleChange} handleBack={handleBack} handleNext={handleNext}></ThirdPage>}
        </div>
    );
};