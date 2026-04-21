import { useForm, type SubmitHandler } from 'react-hook-form';

type FormFields = {
    location: string,
    dropOff: string,
    pickUp: string,
}

export const FirstPage = (props : any) => {
    const { register, handleSubmit } = useForm<FormFields>();

    const onSubmit: SubmitHandler<FormFields> = (data) => {
        props.handleChange(data);
        props.handleNext();
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="location">Location</label>
                <select id="location" defaultValue="" required {...register("location")}>
                    <option value="">SELECT ONE</option>
                    <option value="houston">houston</option>
                    <option value="washington">washington</option>
                </select>

                <br/>
                <label htmlFor="drop-off-time">Drop off time:</label>
                <input id="drop-off-time" type="time" step="900" min="9:00" max="17:00" required {...register("dropOff")}></input>
                <label htmlFor="pick-up-time">Pickup time:</label>
                <input id="pick-up-time" type="time" step="900" required {...register("pickUp")} ></input>

                <br/>
                <input type="submit" value="Next Page"></input>
            </form>
        </div>
    );
};