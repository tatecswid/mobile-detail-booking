import { useNavigate } from 'react-router';
import { formTitleStyle, formDescriptionStyle, buttonStyle, formBoxStyle } from '../style';

export const ErrorPage = ( props : {message : string }) => {
    const useNav = useNavigate();

    return (
        <div className={formBoxStyle}>
            <div className="flex justify-center p-5">
                <img src={"failed-icon.png"} width={100} />
            </div>
            <h1 className={formTitleStyle}>
                {props.message}
            </h1>
            <h2 className={formDescriptionStyle}>
                Please try again...
            </h2>
            <button className={buttonStyle} onClick={() => {
                useNav('/');
                window.location.reload();
            }}>Reload webpage</button>
        </div>
    )
};