import { buttonStyle, formBoxStyle, formDescriptionStyle, formTitleStyle } from "../style";

export const FifthPage = (props: any) => {
    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Here is the estimated cost and duration for your car detailing</h2>
            </div>

            <div className='flex flex-col gap-5 px-3'>
                <div className='flex flex-col gap-y-1'>
                    <label className='text-sm text-white/60 font-medium'>Estimated Cost</label>
                    <div className='text-xl font-semibold'>${props.price}</div>
                </div>
                <div className='flex flex-col gap-y-1'>
                    <label className='text-sm text-white/60 font-medium'>Estimated Duration</label>
                    <div className='text-xl font-semibold'>{props.duration} minutes</div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-2'>
                <button type='button' onClick={props.handleBack} className={buttonStyle}>Last Page</button>
                <input type="submit" value="Submit Booking" className={buttonStyle} />
            </div>
        </div>
    );
};