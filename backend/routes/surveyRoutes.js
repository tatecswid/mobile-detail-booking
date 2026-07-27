const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// sends back all of the availible options of locations and services it offers
router.get('/options', async (req, res) => {
    try{
        const locationResponse = await query(
            supabase
                .from('location')
                .select('location_name')
        );
        const serviceResponse = await query(
            supabase
                .from('service')
                .select('service_name')
        );

        if(!locationResponse || !serviceResponse) {
            return res.status(500).json({error : 'could not fetch valid options, try again later'});
        }

        const locationOptions = locationResponse.map((item) => item.location_name);
        const serviceOptions = serviceResponse.map((item) => item.service_name);
        
        const options = {
            locations: locationOptions, 
            services: serviceOptions,
        };        

        res.status(200).json(options);

    } catch(err) {
        res.json({error: err.message})
    }
})

// localhost:3000/survey/appropriate-addons?serviceType=${service}
// sends back the appropriate addons of the selected service type
router.get('/appropriate-addons', async (req, res) => {
    try {
        const { serviceType } = req.query;

        console.log(serviceType);

        let availibleAddons;

        if(serviceType == 'Complete Refresh') {
            availibleAddons = await query(
                supabase
                    .from('addon')
                    .select('*')
            );
        } else {
            const selectedId = await query(
            supabase
                .from('service')
                .select('service_id')
                .eq('service_name', serviceType)
                .single()
            );
            const serviceId = selectedId.service_id;

            availibleAddons = await query(
                supabase
                    .from('addon')
                    .select('addon_name')
                    .eq('service_req', serviceId)
            );
        }

        if(!availibleAddons) {
            return res.status(500).json({error : 'could not fetch valid options, try again later'});
        }

        res.status(200).json(availibleAddons.map(({ addon_name }) => addon_name));

    } catch(err) {
        res.status(500).json({error: err.message});
    }
})

router.get('/appropriate-times', async (req,res) => {
    try {
        const { location } = req.query;
        const { timeStart, timeEnd } = await checkLocationValidity(location);
        res.status(200).json({ timeStart, timeEnd });
    } catch(err) {
        res.json({error: err.message});
    }
})

// this is what to call on the frontend: localhost:3000/survey/cost?service=${service}&size=${size}&addons=${addons}
// sends back the duration and the price of the selected service, size, and addons:
router.get('/cost', async (req, res) => {
    try {
        const {service, size, addons} = req.query;
        const addonList = [].concat(addons || []);

        if(!service || !size) { return res.status(400).json({error : 'service and size are required'}); }

        const { totalPrice, totalDuration } = await calculateCost(service, size, addonList);
        res.status(200).json({totalPrice, totalDuration});
    } catch(err) {
        res.json({error: err.message});
    }
})


router.post('/booking', async (req, res) => {
    try {
        const { 
            location,
            arriveTime,
            leaveTime,
            
            firstName,
            lastName,
            email,
            phoneNumber,

            carType,
            carMake,
            carModel,
            carYear,
            licensePlateNumber,

            service,
            addons,
        } = req.body;

        const addonList = [].concat(addons || []);

        const { totalPrice, totalDuration } = await calculateCost(service, carType, addons)

        const canFit = await checkAvaibility(location, arriveTime, leaveTime, totalDuration)

        if(canFit) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalPrice) * 100,
                currency: "usd",
                metadata: {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: phoneNumber,

                    car_size: carType,
                    car_make: carMake,
                    car_model: carModel,
                    car_year: carYear,
                    license_plate: licensePlateNumber,

                    location,

                    service,
                    addons: JSON.stringify(addonList),
                }
            })

            const addPendingRowData = await query(
                supabase
                    .from('pending_booking')
                    .insert({
                        stripe_payment_intent_id: paymentIntent.id,
                        location: location,
                        arrival_time: arriveTime,
                        departure_time: leaveTime,
                        total_duration_minutes: totalDuration,
                        total_price: totalPrice,
                        expires_at: new Date(Date.now() + 5 * 60 * 1000).toTimeString().slice(0,8),
                })
            );                

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
            })
        } 
        else {
            return res.status(409).json({
                error: "SCHEDULING_CONFLICT",
                message: "Unable to fit request into the schedule.",
            })
        }
    }
    catch(err) {
        res.status(500).json({error: err.message});
    }
})

router.post('/booking-confirmation', async (req, res) => {
    // insert stripe payment validation here
    try {
        const { stripePaymentId } = req.body;
        
            const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);

            if(paymentIntent.status !== 'succeeded') { return res.status(400).json({ error: "Stripe payment did not go through..." }) }
            
            const confirmation = await saveBookingIfNeeded(bookingFields)

            if(confirmation.status === "session expired") {
                const refund = await stripe.refunds.create({
                    payment_intent: paymentIntent.id,
                });

                return res.status(409).json({error: "session expired, refund has been issued."})
            }

            res.status(200).json({message: "booking has been confirmed"})
    } catch(err) {
        res.status(500).json({error: err.message});
    }    
})

// algorithm that checks if a request could be fit into the schedule.
/* returns true if can be fit, returns false if not
*/
const checkAvaibility = async (location, arriveTime, leaveTime, totalDuration) => {
    const {detailDayID, timeStart} = await checkLocationValidity(location);
    const acceptedBookingRows = await query(
        supabase
            .from('booking_info')
            .select('arrival_time, departure_time, total_duration_minutes')
            .eq('detail_day_id', detailDayID)
    );

    const pendingBookingRows = await query(
        supabase
            .from('pending_booking')
            .select('arrival_time, departure_time, total_duration_minutes')
            .eq('location', location)
    );

    let attemptedBookingRows = [
        ...acceptedBookingRows,
        ...pendingBookingRows,
        {
            arrival_time: arriveTime, 
            departure_time: leaveTime, 
            total_duration_minutes: totalDuration
        }
    ];

    let earliestDeadlinePriorityQueue = [];

    let bookingRowsEarliest = [...attemptedBookingRows].sort((a,b) => 
        a.arrival_time.localeCompare(b.arrival_time) || a.departure_time.localeCompare(b.departure_time) 
    )
    
    let currentTime = timeStart;

    while(bookingRowsEarliest.length > 0 || earliestDeadlinePriorityQueue.length > 0) {
        bookingRowsEarliest = bookingRowsEarliest.filter(bookingRow => {
            if(bookingRow.arrival_time <= currentTime) {
                earliestDeadlinePriorityQueue.push(bookingRow)
                return false;
            }
            return true;
        })

        if(earliestDeadlinePriorityQueue.length == 0) {
            currentTime = bookingRowsEarliest[0].arrival_time;
            continue;
        }

        earliestDeadlinePriorityQueue.sort((a,b) => 
            a.departure_time.localeCompare(b.departure_time) || a.arrival_time.localeCompare(b.arrival_time)
        )

        const job = earliestDeadlinePriorityQueue.shift();
        const finishTime = addMinutes(currentTime, job.total_duration_minutes);

        if(finishTime > job.departure_time) {
            return false;
        }

        currentTime = finishTime;
    }    
    return true;

    function addMinutes(time, mins) {
        const d = new Date(`2000-01-01T${time}`);
        d.setMinutes(d.getMinutes() + mins);
        return d.toTimeString().slice(0, 8);
    }
}

/**
 * derives some of the booking information we need in order to fill out the booking_info table
 * 
 * @param { string } location
 * @throws { detailDayError } if the location either doesn't exist or doesn't have an availible detail day
 * @returns { int, string } detailDayID, timeStart
 */
const checkLocationValidity = async (locationName) => {
    const locationRow = await query(
            supabase
                .from('location')
                .select('location_id')
                .eq('location_name', locationName)
                .maybeSingle()
        );
    if(!locationRow) throw new Error(`Location "${locationName}" does not exist.`);
    const locationID = locationRow.location_id;

    const nowUtc = new Date();
    const currentDateTime = nowUtc.toLocaleString('sv-SE', { timeZone: "America/Chicago" }).replace(' ', 'T');

    const detailDayRow = await query(
        supabase
            .from('detail_day')
            .select('detail_day_id, time_start, time_end')
            .eq('location_id', locationID)
            .gt('date', currentDateTime)
            .order('date', { ascending: true })
            .limit(1)
            .maybeSingle()
    )
    if(!detailDayRow) throw new Error("Next detail date not availible for location yet.");

    return { detailDayID : detailDayRow.detail_day_id, timeStart: detailDayRow.time_start, timeEnd: detailDayRow.time_end, date: detailDayRow.date };
}

router.get('/location-request', async (req,res) => {
    const data = await checkLocationValidity('Miami');
    res.status(200).json(data);
});

const saveBookingIfNeeded = async (bookingFields) => {
    const existing = await query(
        supabase
            .from('booking_info')
            .select('*')
            .eq('stripe_payment_intent_id', bookingFields.stripe_payment_id)
            .maybeSingle()
    );
    if(existing) return { status : "already saved" };

    const pending = await query(
        supabase
            .from('pending_booking')
            .select('*')
            .eq('stripe_payment_intent_id', bookingFields.stripe_payment_id)
            .maybeSingle()
    );
    if(!pending) return { status: "session expired" };

    // insert the pending booking into the booking
    const derivedData = await insertDetailData(bookingFields);
    const acceptedBookingRow = await query(
        supabase
            .from('booking_info')
            .insert({
                arrival_time: pending.arrival_time,
                departure_time: pending.departure_time,
                total_duration_minutes: pending.total_duration_minutes,
                stripe_payment_intent_id: pending.stripe_payment_intent_id,
                total_price: pending.total_price,
                ...derivedData,
            })
            .select()
            .single()
    );

    // add addons to the booking
    const addonList = [].concat(bookingFields.addons || []);

    if(addonList.length > 0) {
        const addonIDs = await query(
            supabase
                .from('addon')
                .select('addon_id')
                .in('addon_name', addonList)
        );

         const bookingAddons = addonIDs.map(({ addon_id }) => ({
            booking_id: acceptedBookingRow.booking_id,
            addon_id,
        }));

        await query(
            supabase
                .from('booking_addon')
                .insert(bookingAddons)
        );
    }   

    // delete from pending booking
    await query(
        supabase
            .from('pending_booking')
            .delete()
            .eq('stripe_payment_intent_id', bookingFields.stripe_payment_id)
    );

    return { status: 'booked' };
}

/*
 * Insert all of the customer, vehicle, service, addons, and derive everything so we can insert it into the booking_info table, including
 * detail_day_id
 */
const insertDetailData = async (bookingFields) => {
    // customer ID:
    const customerContact = await query(
        supabase
            .from('customer_contact')
            .insert({
                first_name: bookingFields.first_name,
                last_name: bookingFields.last_name,
                email: bookingFields.email,
                phone_number: bookingFields.phone_number,
            })
            .select('customer_id')
            .maybeSingle()
    );
    const customer_id = customerContact.customer_id;

    // getting detail day ID:
    const { detailDayID } = await checkLocationValidity(bookingFields.location);
    
    // vehicle ID:
    const vehicleInfo = await query(
        supabase
        .from('vehicle')
        .insert({
            license_plate: bookingFields.license_plate,
            car_make: bookingFields.car_make,
            car_model: bookingFields.car_model,
            car_year: Number(bookingFields.car_year),
            car_size: bookingFields.car_size,
        })
        .select('vehicle_id')
        .single()
    );
    const vehicle_id = vehicleInfo.vehicle_id;

    // service ID:
    const selected_service = await query(
            supabase
            .from('service')
            .select('service_id')
            .eq('service_name', bookingFields.service)
            .single()
    );
    const service_id = selected_service.service_id;

    return { 
        customer_id,
        detail_day_id: detailDayID,
        vehicle_id,
        service_id,
    };
}

const calculateCost = async (service, size, addons) => {
    // find addon Costs
    const selectedAddonsCost = await query(
        supabase
            .from('addon')
            .select('*, addon_pricing!inner(*)')
            .eq('addon_pricing.car_size', size)
            .in('addon_name', addons)
    );

    let totalPrice = 0;
    let totalDuration = 0;

    selectedAddonsCost.map(addonOptions => {
        const addonCost = addonOptions.addon_pricing[0];

        totalPrice += addonCost.price;
        totalDuration += addonCost.duration_minutes;
    })
    
    const selectedServiceCost = await query(
        supabase
            .from('service')
            .select('*, service_pricing!inner(*)')
            .eq('service_name', service)
            .eq('service_pricing.car_size', size)
            .single()
    );
    const serviceRequest = selectedServiceCost.service_pricing[0];

    if(!selectedServiceCost || !serviceRequest) {
        throw Error('no pricing found for that service and size');
    }

    totalPrice += serviceRequest.price;
    totalDuration += serviceRequest.duration_minutes;

    return { totalPrice, totalDuration };
}

const query = async ( promise ) => {
    const { data, error } = await promise;
    if(error) throw error;

    return data;
}

module.exports = { 
    router,
    saveBookingIfNeeded,
};