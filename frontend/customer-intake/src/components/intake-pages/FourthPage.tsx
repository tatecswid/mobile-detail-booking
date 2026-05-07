import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle, optionStyle } from '../style';

const schema = z.object({
    service: z.string({message: "Select a valid service"}).min(1, {message: "Select a valid service"}),
    addons: z.array(z.string()),
})

type FourthPageFields = z.infer<typeof schema>

type FourthFormProps = {
    handleChange: (data: FourthPageFields) => void;
    fullSubmit: () => void;
    handleBack: () => void;
    defaultValues: Partial<FourthPageFields>;
}

export const FourthPage = (props : FourthFormProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<FourthPageFields>({ defaultValues: {
        service: props.defaultValues.service, 
        addons: props.defaultValues.addons,
    }, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<FourthPageFields> = (data) => {
        props.handleChange(data);
        props.fullSubmit();
    }

    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Please select the services you would like done on your car</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 px-3'>
                <div className='flex flex-col gap-1'>
                    <legend>Select a service:</legend>
                    <div className='grid grid-cols-2 gap-4'>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='radio' value='interior' {...register("service")}/>Interior</label>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='radio' value='exterior' {...register("service")}/>Exterior</label>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='radio' value='full' {...register("service")}/>Full</label>
                    </div>
                    { errors.service && <div className={errorStyle}>{errors.service.message}</div> }
                </div>
                <div className='flex flex-col gap-1'>
                    <legend>Select addons:</legend>
                    <div className='grid grid-cols-2 gap-4'>
                        <label className={`${optionStyle} flex items-center gap-2 py-1`}><input type='checkbox' {...register("addons")} value="minor pet hair removal"/>Minor Pet Hair Removal</label>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='checkbox' {...register("addons")} value="extreme pet hair removal"/>Extreme Pet Hair Removal</label>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='checkbox' {...register("addons")} value="weather & polin protection"/>Weather & Polin Protection</label>
                        <label className={`${optionStyle} flex items-center gap-2`}><input type='checkbox' {...register("addons")} value="tire & trim deep clean"/>Trim & Tire Deep Clean</label>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4 pt-4'>
                    <button type='button' onClick={props.handleBack} className={buttonStyle}>Last Page</button>
                    <input type="submit" value="Submit form" className={buttonStyle}></input>
                </div>
            </form>
        </div>
    );
};