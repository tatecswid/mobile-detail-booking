import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { buttonStyle, formBoxStyle, formTitleStyle, formDescriptionStyle } from "../style";

type CheckoutPageProps = {
    price: number,
};

export const CheckoutPage = ({ price } : CheckoutPageProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if(!stripe || !elements) return;

        await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/after-payment`
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className={formBoxStyle}>
            <div className='flex flex-col gap-1'>
                <h1 className={formTitleStyle}>Schedule Car Detailing</h1>
                <h2 className={formDescriptionStyle}>Use the form below to pay</h2>
            </div>
            <div className='flex flex-col gap-y-1'>
                <label className='text-sm text-white/60 font-medium'>Cost</label>
                <div className='text-xl font-semibold'>${price}</div>
            </div>
            <PaymentElement />
            <button className={buttonStyle} type="submit">Pay</button>
        </form>
    )
};