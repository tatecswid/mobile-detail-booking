const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// sends back all of the availible options of locations and services it offers
router.get('/options', async (req, res) => {
    try{
        const { data: locationResponse, error: locationError} = await supabase
            .from('location')
            .select('location_name');
        const { data: serviceResponse, error: serviceError } = await supabase
            .from('service')
            .select('service_name');
        
        const locationOptions = locationResponse.map((item) => item.location_name);
        const serviceOptions = serviceResponse.map((item) => item.service_name);
        
        const options = {
            locations: locationOptions, 
            services: serviceOptions,
        };

        if(locationError || serviceError) {
            return res.status(500).json({error : 'could not fetch valid options, try again later'});
        }

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
        const { data : selectedId, error : selectedServiceIdError } = await supabase
            .from('service')
            .select('service_id')
            .eq('service_name', serviceType)
            .maybeSingle();
        const serviceId = selectedId.service_id;

        const allowedServices = {
            1 : [1],
            2 : [2],
            3 : [1,2],
        };

        const { data : availibleAddons, error : availibleAddonsError } = await supabase
            .from('addon')
            .select('addon_name')
            .in('service_req', allowedServices[serviceId])

        if(selectedServiceIdError || availibleAddonsError) {
            return res.status(500).json({error : 'could not fetch valid options, try again later'});
        }

        res.status(200).json(availibleAddons.map(({ addon_name }) => addon_name));

    } catch(err) {
        res.json({error: err.message});
    }
})

// this is what to call on the frontend: localhost:3000/survey/calculate-costs?service=${service}&size=${size}&addons=${addons}
// sends back the duration and the price of the selected service, size, and addons:
router.get('/calculate-costs', async (req, res) => {
    try {
        const {service, size, addons} = req.query;

        const addonList = [].concat(addons || []);

        if(!service || !size) {
            return res.status(400).json({error : 'service and size are required'});
        }

        const { serviceID, addonIDs } = await findIDFromNames(service, addonList)

        const { data : addonPricingRows, error : addonPricingError } = await supabase
            .from('addon_pricing')
            .select('duration_minutes, price')
            .eq('car_size', size)
            .in('addon_id', addonIDs);
        
        if(addonPricingError) throw addonPricingError;

        let totalPrice = 0;
        let totalDuration = 0;

        addonPricingRows.map(addonOptions => {
            totalPrice += addonOptions.price;
            totalDuration += addonOptions.duration_minutes;
        })
        
        const { data : selectedServiceCost, error: serviceCostError } = await supabase.from('service')
                                            .select('*, service_pricing!inner(*)')
                                            .eq('service_name', service)
                                            .eq('service_pricing.car_size', size);
        
        if(serviceCostError) throw serviceCostError;
        
        const serviceRequest = selectedServiceCost[0].service_pricing[0];

        if(!selectedServiceCost || selectedServiceCost.length === 0 || !serviceRequest) {
            return res.status(404).json({error: 'no pricing found for that service and size'});
        }

        totalPrice += serviceRequest.price;
        totalDuration += serviceRequest.duration_minutes;
        
        res.status(200).json({totalPrice, totalDuration});

    } catch(err) {
        res.json({error: err.message});
    }
})

/* TODO -- In need of two more HTTP methods: (WILL LIKELY ADD MORE AS WELL)
    - a GET for getting the min and max time for departure.
    - a POST for taking in requested booking, running scheduling algorithm 
      to see if times would work and then either putting it into the database
      or sending back a failure.
*/
router.post('/book', async (req, res) => {
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

            total,
        } = req.body;
    }
    catch(err) {
        res.json({error: err.message});
    }
})

router.get('/this', async (req, res) => {
    const { location } = req.query;
    console.log(location);
    const check = await checkLocationValidity(location);
    return res.status(200).json(check);
})


const checkAvaibility = async (location, arriveTime, leaveTime, duration) => {
    const detailDayID = await checkLocationValidity(location);
    const { data : bookingInfoRows , error : bookingRowsError } = await supabase
        .from('booking_info')
        .select('arrival_time, departure_time, total_duration_minutes')
        .eq('detail_day_id', detailDayID);

    if(bookingRowsError) throw bookingRowsError;

    let attemptedBookingRows = [
        ...bookingInfoRows.map(e, index => ({ ...e, id: index++})),
        {
            arrival_time: arriveTime, 
            departure_time: leaveTime, 
            total_duration_minutes: duration
        }
    ];

    earliestDeadlinePriorityQueue = [];

    bookingRowsEarliest = [...attemptedBookingRows].sort((a,b) => 
        a.arrival_time.localeCompare(b.arrival_time) || a.departure_time.localeCompare(b.departure_time) 
    )
    
    let currentTime = timeStart // need to get the detail day start.

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

        earliestDeadlinePriorityQueue.sort(a,b => a.departure_time - b.departure_time)

        const job = earliestDeadlinePriorityQueue.shift();
        const finishTime = currentTime + job.total_duration_minutes;

        if(finishTime > currentAppointment.departure_time) {
            return false;
        }

        currentTime = finishTime;
    }    
    return true;
}

/**
 * derives some of the booking information we need in order to fill out the booking_info table
 * 
 * @param { string } location
 * @throws { detailDayError } if the location either doesn't exist or doesn't have an availible detail day
 * @returns { int } detailDayID
 */
const checkLocationValidity = async (locationName) => {
    const { data : locationRow, error : locationError } = await supabase
        .from('location')
        .select('location_id')
        .eq('location_name', locationName)
        .maybeSingle();

    if(locationError) throw locationError;
    if(!locationRow) throw new Error(`Location "${locationName}" does not exist.`);

    const locationID = locationRow.location_id;

    const {data : detailDayRow, error : detailDayError} = await supabase
        .from('detail_day')
        .select('detail_day_id')
        .eq('location_id', locationID)
        .gt('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(1)
        .maybeSingle();
    if(detailDayError) throw detailDayError;
    if(!detailDayRow) throw new Error("Next detail date not availible for location yet.");

    return detailDayRow.detail_day_id;
}

/**
 * finds the service id and addon id based only on the names
 * 
 * @param {string} serviceName
 * @param {Array<string>} addonName
 * @param {string} locationName
 * @returns {{serviceID: int, addonIDs: Array<int>, locationID: int }}
 */
const findIDFromNames = async (serviceName, addonName) => {
    const { data : serviceRow, error : serviceError} = await supabase
        .from('service')
        .select('service_id')
        .eq('service_name', serviceName)
    const serviceID = serviceRow[0].service_id;
    if(serviceError) throw serviceError;

    const { data : addonRows, error : addonError } = await supabase
        .from('addon')
        .select('addon_id')
        .in('addon_name', addonName);
    const addonIDs = addonRows.map(({addon_id}) => addon_id)
    if(addonError) throw addonError;
    
    return { serviceID, addonIDs };
}

module.exports = router;