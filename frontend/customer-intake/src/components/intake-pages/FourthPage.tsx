import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formTitleStyle, formDescriptionStyle, errorStyle, buttonStyle, formBoxStyle, optionStyle } from '../style';

const schema = z.object({
    service: z.string({message: "Select a valid service"}).min(1, {message: "Select a valid service"}),
    addons: z.array(z.string()),
})

type FourthPageFields = z.infer<typeof schema>

type SurveyOptions = {
    locations: string[],
    services: string[],
    possibleAddons: string[],
    addons: string[],
}

type FourthFormProps = {
    handleChange: (data: FourthPageFields) => void;
    handleNext: () => void;
    handleBack: () => void;
    calculateTotals: () => void;
    getAppropriateAddons: (serviceName : string) => Promise<Array<string>>
    defaultValues: Partial<FourthPageFields>;
    surveyOptions: SurveyOptions;
}

export const FourthPage = (props : FourthFormProps) => {
    const [addons, setAddons] = useState<string[]>([]);

    useEffect(() => {
        if(props.surveyOptions.possibleAddons !== null) {
            setAddons(props.surveyOptions.possibleAddons);
        }
    }, [])

    const { register, resetField, handleSubmit, formState: {errors} } = useForm<FourthPageFields>({ defaultValues: {
        service: props.defaultValues.service,
        addons: props.defaultValues.addons,
    }, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<FourthPageFields> = (data) => {
        props.handleChange(data);
        props.calculateTotals();
        props.handleNext();
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
                        { props.surveyOptions.services.map(serviceOption => {
                            return (
                            <label className={`${optionStyle} flex items-center gap-2`}>
                                <input type='radio' value={serviceOption} {...register("service", {
                                    onChange: async (e) => {
                                        const appropriateAddons = await props.getAppropriateAddons(e.target.value);
                                        setAddons(appropriateAddons);
                                        resetField("addons", { defaultValue: [] });
                                    }
                                })}/>
                                {serviceOption}
                            </label>
                            )
                        })}
                    </div>
                    { errors.service && <div className={errorStyle}>{errors.service.message}</div> }
                </div>
                {addons && 
                (<div className='flex flex-col gap-1'>
                    <legend>Select addons:</legend>
                    <div className='grid grid-cols-2 gap-4'>
                        { addons.map(addonOption => {
                            return (
                            <label className={`${optionStyle} flex items-center gap-2 py-1`}>
                                <input type='checkbox' {...register("addons")} value={addonOption} defaultChecked={false}/>
                                {addonOption}
                            </label> )
                        })}
                    </div>
                </div>)}
                <div className='grid grid-cols-2 gap-4 pt-4'>
                    <button type='button' onClick={props.handleBack} className={buttonStyle}>Last Page</button>
                    <input type="submit" value="Submit form" className={buttonStyle}></input>
                </div>
            </form>
        </div>
    );
};