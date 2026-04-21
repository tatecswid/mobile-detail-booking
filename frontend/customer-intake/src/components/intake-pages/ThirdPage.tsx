import { useForm, type SubmitHandler } from 'react-hook-form';

type FormFields = {
    carType: string,
    carMake: string,
    carModel: string,
    carYear: string,
    licensePlate: string,
}

export const ThirdPage = (props : any) => {
    const { register, handleSubmit } = useForm<FormFields>();

    const onSubmit: SubmitHandler<FormFields> = (data) => {
        props.handleChange(data)
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="car-type">Car Type:</label>
                <select id="car-type" defaultValue="" {...register("carType")}>
                    <option value="">SELECT ONE</option>
                    <option value="standard">standard</option>
                    <option value="midSize">mid-size</option>
                    <option value="large">large</option>
                </select>

                <br/>
                <label htmlFor='car-make'>Car Make:</label>
                <input type='text' id='car-make' {...register("carMake")}></input>
                <br/>
                <label htmlFor='car-model'>Car Model:</label>
                <input type='text' id='car-model' {...register("carModel")}></input>
                <br/>
                <label htmlFor='car-year'>Car Year:</label>
                <input type='text' id='car-year' {...register("carYear")}></input>
                <br/>
                <label htmlFor='license-plate-number'>License Plate Number:</label>
                <input type='text' id='license-plate-number' {...register("licensePlate")}></input>

                <br/>
                <button onClick={props.handleBack}>Last Page</button> <br/>
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
};