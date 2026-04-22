import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    service: z.string().min(1, {message: "please pick a valid service"}),
    addons: z.array(z.string()),
})

type FourthPageFields = z.infer<typeof schema>

type FourthFormProps = {
    handleChange: (data: FourthPageFields) => void;
    fullSubmit: () => void;
    handleBack: () => void;
}

export const FourthPage = (props : FourthFormProps) => {
    const { register, handleSubmit, formState: {errors} } = useForm<FourthPageFields>({ defaultValues:{service:""}, resolver: zodResolver(schema)});

    const onSubmit: SubmitHandler<FourthPageFields> = (data) => {
        props.handleChange(data);
        props.fullSubmit();
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <legend>Select a service:</legend>
                <label><input type='radio' value='interior' {...register("service")}/>Interior</label>
                <label><input type='radio' value='exterior' {...register("service")}/>Exterior</label>
                <label><input type='radio' value='full' {...register("service")}/>Full</label>
                { errors.service && <div>{errors.service.message}</div> }
                <br/>
                <legend>Select addons:</legend>
                <label><input type='checkbox' {...register("addons")} value="minor pet hair removal"/>Minor Pet Hair Removal</label>
                <label><input type='checkbox' {...register("addons")} value="extreme pet hair removal"/>Extreme Pet Hair Removal</label>
                <label><input type='checkbox' {...register("addons")} value="weather & polin protection"/>Weather & Polin Protection</label>
                <label><input type='checkbox' {...register("addons")} value="tire & trim deep clean"/>Trim & Tire Deep Clean</label>
                <br/>
                <input type="submit" value="full-submit"></input>
            </form>
        </div>
    );
};