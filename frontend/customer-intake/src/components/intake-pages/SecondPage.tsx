import { useForm, type SubmitHandler } from 'react-hook-form';

type FormFields = {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
}

export const SecondPage = (props : any) => {
    const { register, handleSubmit } = useForm<FormFields>();

    const onSubmit: SubmitHandler<FormFields> = (data) => {
        props.handleChange(data)
        props.handleNext();
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor='first-name'>First Name:</label>
                <input type='text' {...register("firstName")}></input>
                <br/>
                <label htmlFor='last-name'>Last Name:</label>
                <input type='text' {...register("lastName")}></input>
                <br/>
                <label htmlFor='email'>Email:</label>
                <input type='text' {...register("email")}></input>
                <br/>
                <label htmlFor='phone-number'>Phone Number:</label>
                <input type='text' {...register("phoneNumber")}></input>

                <br/>
                <button onClick={props.handleBack}>Last Page</button> <br/>
                <input type="submit" value="Next Page"></input>
            </form>
        </div>
    );
};