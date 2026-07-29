import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';

export const ErrorPage = ( props : {message : string }) => {
    return (
        <div className={formBoxStyle}>
            <h1 className={formTitleStyle}>
                {props.message}
            </h1>
            <h2 className={formDescriptionStyle}>
                Please try again...
            </h2>
            <button className={buttonStyle} onClick={() => window.location.reload()}>Reload webpage</button>
        </div>
    )
};