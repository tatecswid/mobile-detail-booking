import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';

export const WaitlistPage = (props : { handleWaitlistAddition: () => void }) => {
    return (
        <div className={formBoxStyle}>
            <div className="flex justify-center p-5">
                <img src={"schedule-conflict.png"} width={100} />
            </div>
            <h1 className={formTitleStyle}>
                Scheduling Conflict
            </h1>
            <h2>
                We were unable to fit your car into the schedule... Would you like to be placed on the waitlist?
            </h2>
            <div className='grid grid-cols-2 gap-4 pt-2'>
                <button className={buttonStyle} onClick={() => window.location.reload()}>
                    No
                </button>
                <button className={buttonStyle} onClick={props.handleWaitlistAddition}>
                    Yes
                </button>
            </div>
        </div>
    )
}