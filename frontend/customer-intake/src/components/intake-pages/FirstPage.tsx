import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';
import { useEffect, useMemo, useState } from 'react';

const createSchema = (earliestTime = "09:00", latestTime = "17:00") => z.object({
    location: z.string().min(1, {message: "Must select a valid location"})
                    .refine(() => earliestTime !== '', { message: `This location is not availible for detailing at this time.` }),
    arriveTime: z.iso.time({ precision: -1, message:"Select a valid time" })
                    .refine((val) =>  val >= earliestTime && val <= latestTime, {message: `Time must be between ${earliestTime.slice(0,5)} and ${latestTime.slice(0,5)}`})
                    .min(1, "Must select a valid time"),
    leaveTime: z.iso.time({ precision: -1, message:"Select a valid time" })
                    .refine((val) =>  val >= earliestTime && val <= latestTime, {message: `Time must be between ${earliestTime.slice(0,5)} and ${latestTime.slice(0,5)}`})
                    .min(1, "Must select a valid time"),
}).refine(
        (data) => data.leaveTime > data.arriveTime, 
        {message: "Leave time must be after arrival time",
        path: ["leaveTime"],
    },
)

type FirstPageFields = z.infer<ReturnType<typeof createSchema>>

type SurveyOptions = {
    locations: string[],
    services: string[],
}

type TimeFrame = {
    timeStart: string,
    timeEnd: string;
}

type FirstPageProps = {
    handleChange: (data: FirstPageFields) => void,
    handleLocationChange: (location: string) => void,
    handleNext: () => void,
    defaultValues: Partial<FirstPageFields>,
    surveyOptions: SurveyOptions,
    timeFrame: TimeFrame,
}

export const FirstPage = (props : FirstPageProps) => {
    const [location, setLocation] = useState<string>("");
    const earliestTime = props.timeFrame.timeStart ? props.timeFrame.timeStart.slice(0, 5) : '';
    const latestTime = props.timeFrame.timeEnd ? props.timeFrame.timeEnd.slice(0, 5) : '';

    const schema = useMemo(
        () => createSchema(earliestTime, latestTime),
        [earliestTime, latestTime]
    );

    const { register, resetField, clearErrors, handleSubmit, formState: {errors} } = useForm<FirstPageFields>({ defaultValues: { 
        location: props.defaultValues.location, 
        arriveTime: props.defaultValues.arriveTime, 
        leaveTime: props.defaultValues.leaveTime 
    }, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<FirstPageFields> = (data) => {
        props.handleChange(data);
        props.handleNext();
    }

    useEffect(() => {
        if(props.defaultValues.location !== undefined) {
            setLocation(props.defaultValues.location);
        }
    }, []);
    
    useEffect(() => {
        if(location === "") return;

        const fetchTimeInformation = async () => {
            props.handleLocationChange(location);
        }

        fetchTimeInformation();
    }, [location]);

    useEffect(() => {
        if (location === "") return;
        clearErrors(["location"]);
    }, [schema]);

    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Please select your location and your drop off and pickup times</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 px-3'>
                <div className='flex flex-col gap-y-1'>
                    <label htmlFor="location">Location: </label>
                    <select id="location" className={inputStyle}  {...register("location", {
                        onChange: async (e) => {
                            setLocation(e.target.value);

                            resetField("arriveTime", { defaultValue: "" });
                            resetField("leaveTime", { defaultValue: "" });
                        }
                    })}>
                        <option value="" disabled>SELECT ONE</option>
                        {props.surveyOptions?.locations.map((val : any) => {
                            return <option key={val} value={val}>{val}</option>
                        })}
                    </select>
                    { errors.location && <div className={errorStyle}>{errors.location.message}</div> }
                </div>
                { earliestTime &&
                    (
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
                    )
                }
                <input type="submit" value="Next Page" className={buttonStyle}></input>
            </form>
        </div>
    );
};