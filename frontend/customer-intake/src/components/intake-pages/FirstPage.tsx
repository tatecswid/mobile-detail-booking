import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    location: z.string().min(1, {message: "Must select a valid location"}),
    arriveTime: z.iso.time({ precision: -1, message:"Select a valid time" }).refine((val) =>  val >= "09:00" && val <= "17:00", {message: "Time must be between 9:00am and 5:00pm"}).min(1, "Must select a valid time"),
    leaveTime: z.iso.time({ precision: -1, message:"Select a valid time" }).refine((val) =>  val >= "09:00" && val <= "17:00", {message: "Time must be between 9:00am and 5:00pm"}).min(1, "Must select a valid time"),
})

type FirstPageFields = z.infer<typeof schema>

type FirstPageProps = {
    handleChange: (data: FirstPageFields) => void;
    handleNext: () => void;
}

export const FirstPage = (props : FirstPageProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<FirstPageFields>({ defaultValues: { location: "" }, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<FirstPageFields> = (data) => {
        props.handleChange(data);
        props.handleNext();
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="location">Location</label>
                <select id="location" {...register("location")}>
                    <option value="" disabled>SELECT ONE</option>
                    <option value="houston">houston</option>
                    <option value="washington">washington</option>
                </select>
                { errors.location && <div>{errors.location.message}</div> }
                <label htmlFor="drop-off-time">Drop off time:</label>
                <input id="drop-off-time" type="time" {...register("arriveTime", { required: "Select a valid time" })}></input>
                { errors.arriveTime && <div>{errors.arriveTime.message}</div> }
                <label htmlFor="pick-up-time">Pickup time:</label>
                <input id="pick-up-time" type="time" {...register("leaveTime", { required: "Select a valid time" })}></input>
                { errors.leaveTime && <div>{errors.leaveTime.message}</div> }
                <br/>
                <input type="submit" value="Next Page"></input>
            </form>
        </div>
    );
};