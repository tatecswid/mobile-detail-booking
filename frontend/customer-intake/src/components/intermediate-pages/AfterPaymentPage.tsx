import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { confirmPayment } from "../../Fetch";
import { ErrorPage } from "./ErrorPage";
import { LoadingPage } from "./LoadingPage";
import { SuccessPage } from "./SuccessPage";

export const AfterPaymentPage = () => {
    const [searchParams] = useSearchParams();

    const paymentIntentID = searchParams.get("payment_intent") ?? "";

    const checkWebhookSuccess = useQuery({
        queryKey: ['payment'],
        queryFn: () => confirmPayment(paymentIntentID),
        retry: 20,
        retryDelay: 1000,
    })

    console.log({ error: checkWebhookSuccess.error, status: checkWebhookSuccess.status, data: checkWebhookSuccess.data });

    const error = checkWebhookSuccess.error;
    const loading = checkWebhookSuccess.isLoading;

    if(checkWebhookSuccess.data) {
        return <SuccessPage />
    }

    return (
        <div>
            { 
                (loading && <LoadingPage />)
            }
            {
                (error && <ErrorPage message="Session Expired, Refund issued"/>)
            }
        </div>
    )
}