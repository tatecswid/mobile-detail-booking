import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { formTitleStyle, formDescriptionStyle, errorStyle, inputStyle, buttonStyle, formBoxStyle } from '../style';

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
    defaultValues: Partial<SecondPageFields>;
}

export const SecondPage = (props : SecondPageProps) => {
    const { register, handleSubmit, formState : {errors} } = useForm<SecondPageFields>({defaultValues : { 
        firstName: props.defaultValues.firstName, 
        lastName: props.defaultValues.lastName, 
        email: props.defaultValues.email, 
        phoneNumber: props.defaultValues.phoneNumber
    }, resolver : zodResolver(schema), });

    const onSubmit: SubmitHandler<SecondPageFields> = (data) => {
        props.handleChange(data)
        props.handleNext();
    }

    return (
        <div className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Please fill out the contact information</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2 px-3 '>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor='first-name'>First Name:</label>
                        <input type='text' className={inputStyle} {...register("firstName")}></input>
                        { errors.firstName && <div className={errorStyle}>{errors.firstName.message}</div> }
                    </div>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor='last-name'>Last Name:</label>
                        <input type='text' className={inputStyle} {...register("lastName")}></input>
                        { errors.lastName && <div className={errorStyle}>{errors.lastName.message}</div> }
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor='email'>Email:</label>
                        <input type='text' className={inputStyle} {...register("email")}></input>
                        { errors.email && <div className={errorStyle}>{errors.email.message}</div> }
                    </div>
                    <div className='flex flex-col gap-y-1'>
                        <label htmlFor='phone-number'>Phone Number:</label>
                        <input type='tel' className={inputStyle} {...register("phoneNumber")}></input>
                        { errors.phoneNumber && <div className={errorStyle}>{errors.phoneNumber.message}</div> }
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