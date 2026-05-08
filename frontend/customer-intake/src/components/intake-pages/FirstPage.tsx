import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';

const schema = z.object({
    location: z.string().min(1, {message: "Must select a valid location"}),
    arriveTime: z.iso.time({ precision: -1, message:"Select a valid time" })
                     .refine((val) =>  val >= "09:00" && val <= "17:00", {message: "Time must be between 9:00am and 5:00pm"})
                     .min(1, "Must select a valid time"),
    leaveTime: z.iso.time({ precision: -1, message:"Select a valid time" })
                    .refine((val) =>  val >= "09:00" && val <= "17:00", {message: "Time must be between 9:00am and 5:00pm"})
                    .min(1, "Must select a valid time"),
}).refine(
        (data) => data.leaveTime > data.arriveTime, 
        {message: "Leave time must be after arrival time",
        path: ["leaveTime"],
    },
)

type FirstPageFields = z.infer<typeof schema>

type SurveyOptions = {
    locations: string[],
    services: string[],
    addons: string[],
}

type FirstPageProps = {
    handleChange: (data: FirstPageFields) => void;
    handleNext: () => void;
    defaultValues: Partial<FirstPageFields>;
    surveyOptions: SurveyOptions;
}

export const FirstPage = (props : FirstPageProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<FirstPageFields>({ defaultValues: { 
            location: props.defaultValues.location, 
            arriveTime: props.defaultValues.arriveTime, 
            leaveTime:props.defaultValues.leaveTime 
        }, resolver: zodResolver(schema)});

    

   
   /*
   useEffect(() => {
        fetchLocations();
    }, []) 
   
   const [locations, setLocations] = useState([]);

    const fetchLocations = async () => {
        const res = await fetch("http://localhost:3000/customer/locations");
        const data = await res.json();
        setLocations(data);
    }*/

    const onSubmit: SubmitHandler<FirstPageFields> = (data) => {
        props.handleChange(data);
        props.handleNext();
    }

    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Please select your location and your drop off and pickup times</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 px-3'>
                <div className='flex flex-col gap-y-1'>
                    <label htmlFor="location">Location: </label>
                    <select id="location" className={inputStyle}  {...register("location")}>
                        <option value="" disabled>SELECT ONE</option>
                        {props.surveyOptions.locations.map((val : any) => {
                            return <option key={val} value={val}>{val}</option>
                        })}
                        <option value="testing">testing</option>
                    </select>
                    { errors.location && <div className={errorStyle}>{errors.location.message}</div> }
                </div>
                <div className='grid grid-cols-2 gap-5'>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor="drop-off-time">Drop off time: </label>
                        <input id="drop-off-time" type="time" className={inputStyle} {...register("arriveTime", { required: "Select a valid time" })}></input>
                        { errors.arriveTime && <div className={errorStyle}>{errors.arriveTime.message}</div> }
                    </div>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor="pick-up-time">Pickup time: </label>
                        <input id="pick-up-time" type="time" className={inputStyle}  {...register("leaveTime", { required: "Select a valid time" })}></input>
                        { errors.leaveTime && <div className={errorStyle}>{errors.leaveTime.message}</div> }
                    </div>
                </div>
                <input type="submit" value="Next Page" className={buttonStyle}></input>
            </form>
        </div>
    );
};