import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

const schema = z.object({
    firstName: z.string().min(1, {message:"Enter a valid first name"}),
    lastName: z.string().min(1, {message: "Enter a valid valid last name"}),
    email: z.email({message:"Enter a valid email"}),
    phoneNumber: z.string().refine((val) => isValidPhoneNumber(val, 'US'), {message: "Invalid phone number"}),
})

type SecondPageFields = z.infer<typeof schema>

type SecondPageProps = {
    handleChange: (data : SecondPageFields) => void;
    handleNext: () => void;
    handleBack: () => void;
}

export const SecondPage = (props : SecondPageProps) => {
    const { register, handleSubmit, formState : {errors} } = useForm<SecondPageFields>({ resolver : zodResolver(schema)});

    const onSubmit: SubmitHandler<SecondPageFields> = (data) => {
        props.handleChange(data)
        props.handleNext();
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor='first-name'>First Name:</label>
                <input type='text' {...register("firstName")}></input>
                { errors.firstName && <div>{errors.firstName.message}</div> }
                <br/>
                <label htmlFor='last-name'>Last Name:</label>
                <input type='text' {...register("lastName")}></input>
                { errors.lastName && <div>{errors.lastName.message}</div> }
                <br/>
                <label htmlFor='email'>Email:</label>
                <input type='text' {...register("email")}></input>
                { errors.email && <div>{errors.email.message}</div> }
                <br/>
                <label htmlFor='phone-number'>Phone Number:</label>
                <input type='tel' {...register("phoneNumber")}></input>
                { errors.phoneNumber && <div>{errors.phoneNumber.message}</div> }
                <br/>
                <button onClick={props.handleBack}>Last Page</button> <br/>
                <input type="submit" value="Next Page"></input>
            </form>
        </div>
    );
};