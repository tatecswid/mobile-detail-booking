import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';

const schema = z.object({
    carType: z.string().min(1, {message: "Enter a valid type"}),
    carMake: z.string().min(1, {message: "Enter a valid make"}),
    carModel: z.string().min(1, {message: "Enter a valid model"}),
    carYear: z.string().refine(val => parseInt(val) > 1920 && /^\d{4}$/.test(val), {message: "Enter a valid year"}),
    licensePlateNumber: z.string().min(5, {message: "Enter a valid license plate"}).max(8, {message: "Enter a valid license plate"}),
})

type ThirdPageFields = z.infer<typeof schema>

type ThirdPageProps = {
    handleChange: (data: ThirdPageFields) => void;
    handleNext: () => void;
    handleBack: () => void;
    defaultValues: Partial<ThirdPageFields>;
}

export const ThirdPage = (props : ThirdPageProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<ThirdPageFields>({defaultValues: {
        carType: props.defaultValues.carType,
        carMake: props.defaultValues.carMake,
        carModel: props.defaultValues.carModel,
        carYear: props.defaultValues.carYear,
        licensePlateNumber: props.defaultValues.licensePlateNumber,
    }, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<ThirdPageFields> = (data) => {
        props.handleChange(data)
        props.handleNext();
    }

    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Please details about your car</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 px-3 '>
                <div className='flex flex-col gap-1'>
                    <label htmlFor="car-type">Car Type:</label>
                    <select id="car-type" defaultValue="" className={inputStyle} {...register("carType")}>
                        <option value="">SELECT ONE</option>
                        <option value="standard">standard</option>
                        <option value="midSize">mid-size</option>
                        <option value="large">large</option>
                    </select>
                    { errors.carType && <div className={errorStyle}>{errors.carType.message}</div> }
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='car-make'>Car Make:</label>
                        <input type='text' id='car-make' className={inputStyle} {...register("carMake")}></input>
                        { errors.carMake && <div className={errorStyle}>{errors.carMake.message}</div> }
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='car-model'>Car Model:</label>
                        <input type='text' id='car-model' className={inputStyle} {...register("carModel")}></input>
                        { errors.carModel && <div className={errorStyle}>{errors.carModel.message}</div> }
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='car-year'>Car Year:</label>
                        <input type='number' id='car-year' min={1921} className={inputStyle} {...register("carYear")}></input>
                        { errors.carYear && <div className={errorStyle}>{errors.carYear.message}</div> }
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='license-plate-number'>License Plate:</label>
                        <input type='text' id='license-plate-number' className={inputStyle} {...register("licensePlateNumber")}></input>
                        { errors.licensePlateNumber && <div className={errorStyle}>{errors.licensePlateNumber.message}</div> }
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4 pt-4'>
                    <button type='button' onClick={props.handleBack} className={buttonStyle}>Last Page</button>
                    <input type="submit" value="Next Page" className={buttonStyle}></input>
                </div>
            </form>
        </div>
    );
};