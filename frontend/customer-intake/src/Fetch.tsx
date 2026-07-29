import axios from "axios";

export const fetchLocationTimes = async (location: string) => {
    const timesResponse = await axios.get(`http://localhost:3000/survey/appropriate-times?location=${location}`);
    return { timeStart: timesResponse.data.timeStart, timeEnd: timesResponse.data.timeEnd };
};

export const fetchAddonOptions = async (serviceType: string) => {
    const addonOptionResponse = await axios.get(`http://localhost:3000/survey/appropriate-addons?serviceType=${encodeURI(serviceType)}`);
    return addonOptionResponse.data;
    
};

export const fetchSurveyOptions = async () => {
    const optionReponse = await axios.get("http://localhost:3000/survey/options");
    return optionReponse.data;
};

export const fetchTotals = async (serviceType: string, addonsList: string[], carType: string) => {
    const addonOptions = addonsList
        .map(addon => `addons=${encodeURIComponent(addon)}`)
        .join('&');
    const costResponse = await axios.get(`http://localhost:3000/survey/cost?service=${encodeURI(serviceType)}&size=${carType}&${addonOptions}`)
    return costResponse.data;
};

export const confirmPayment = async ( paymentID : string ) => {
    const confirmationResponse = await axios.get(`http://localhost:3000/survey/confirm-booking?paymentID=${paymentID}`);
    return confirmationResponse.data;
}