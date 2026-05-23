const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// sends back all of the availible options of locations and services it offers
router.get('/options', async (req, res) => {
    try{
        const { data: locationResponse, error: locationError} = await supabase.from('location').select('location_name');
        const { data: serviceResponse, error: serviceError } = await supabase.from('service').select('service_name');
        
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
        const { data : selectedId, error : selectedServiceIdError } = await supabase.from('service')
                                                                        .select('service_id')
                                                                        .eq('service_name', serviceType)
        const serviceId = selectedId[0].service_id;

        const allowedServices = {
            1 : [1],
            2 : [2],
            3 : [1,2],
        };

        const { data : availibleAddons, error : availibleAddonsError } = await supabase.from('addon')
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

        if(!service || !size) {
            res.status(400).json({error : 'service and size are required'});
        }


        const { data : addonRows, error : addonError } = await supabase.from('addon')
                                        .select('addon_id')
                                        .in('addon_name', addons);
        if(addonError) throw addonError

        const addon_ids = addonRows.map(({addon_id}) => addon_id)
        const { data : addonPricingRows, error : addonPricingError } = await supabase.from('addon_pricing')
                                        .select('duration_minutes, price')
                                        .eq('car_size', size)
                                        .in('addon_id', addon_ids);
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

module.exports = router;