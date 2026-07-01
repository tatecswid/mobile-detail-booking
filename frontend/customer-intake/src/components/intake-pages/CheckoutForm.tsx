import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if(!stripe || !elements) return;

        await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:5173/success"
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button type="submit">Pay</button>
        </form>
    )
};