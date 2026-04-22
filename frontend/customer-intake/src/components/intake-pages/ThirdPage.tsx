import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    carType: z.string(),
    carMake: z.string(),
    carModel: z.string(),
    carYear: z.string(),
    licensePlateNumber: z.string()
})

type ThirdPageFields = z.infer<typeof schema>

type ThirdPageProps = {
    handleChange: (data: ThirdPageFields) => void;
    handleNext: () => void;
    handleBack: () => void;
}

export const ThirdPage = (props : ThirdPageProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<ThirdPageFields>({resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<ThirdPageFields> = (data) => {
        props.handleChange(data)
        props.handleNext();
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
                { errors.carType && <div>{errors.carType.message}</div> }
                <br/>
                <label htmlFor='car-make'>Car Make:</label>
                <input type='text' id='car-make' {...register("carMake")}></input>
                { errors.carMake && <div>{errors.carMake.message}</div> }
                <br/>
                <label htmlFor='car-model'>Car Model:</label>
                <input type='text' id='car-model' {...register("carModel")}></input>
                { errors.carModel && <div>{errors.carModel.message}</div> }
                <br/>
                <label htmlFor='car-year'>Car Year:</label>
                <input type='text' id='car-year' {...register("carYear")}></input>
                { errors.carYear && <div>{errors.carYear.message}</div> }
                <br/>
                <label htmlFor='license-plate-number'>License Plate Number:</label>
                <input type='text' id='license-plate-number' {...register("licensePlateNumber")}></input>
                { errors.licensePlateNumber && <div>{errors.licensePlateNumber.message}</div> }
                <br/>
                <button onClick={props.handleBack}>Last Page</button> <br/>
                <input type="submit" value="Next Page"></input>
            </form>
        </div>
    );
};