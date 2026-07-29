import { formBoxStyle, formTitleStyle, formDescriptionStyle, buttonStyle } from "../style";
import { useNavigate } from "react-router";

export const SuccessPage = () => {
    const nav = useNavigate();

    const handleClose = () => {
        nav('/');
    }

    return (
        <div className={formBoxStyle}>
            <div className="flex justify-center p-5">
                <img src={"check-mark.png"} width={100} />
            </div>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Payment Successful</h1>
                <h2 className={formDescriptionStyle}>We look forward to detailing your car</h2>
            </div>
            <div className="grid pt-4">
                <button className={buttonStyle} onClick={handleClose}>Close this form</button>
            </div>
        </div>
    );
}