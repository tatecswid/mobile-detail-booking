const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// fetching locations
router.get('/options', async (req, res) => {
    try{
        const { data: locationResponse, error: locationError} = await supabase.from('location').select('location_name');
        const { data: serviceResponse, error: serviceError } = await supabase.from('service').select('service_name');
        const { data: addonResponse, error: addonError } = await supabase.from('addon').select('addon_name');
        
        const locationOptions = locationResponse.map((item) => item.location_name);
        const serviceOptions = serviceResponse.map((item) => item.service_name);
        const addonOptions = addonResponse.map((item) => item.addon_name);
        
        const options = {
            locations: locationOptions, 
            services: serviceOptions,
            addons: addonOptions,
        };

        if(locationError || serviceError || addonError) {
            res.status(500).json({error : 'could not fetch valid options, try again later'});
            return;
        }

        res.status(200).json(options);

    } catch(err) {
        res.json({error: err.message})
    }
})

// this is what to call on the frontend: localhost:3000/survey/calculate-costs?service=${service}&size={size}
// fetching time it would take and price:
router.get('/calculate-costs', async (req, res) => {
    try {
        const {service, size} = req.query;

        if(!service || !size) {
            res.status(400).json({error : 'service and size are required'})
        }

        const { data, error } = await supabase.from('service')
                                            .select('*, service_pricing!inner(*)')
                                            .eq('service_name', service)
                                            .eq('service_pricing.car_size', size);
        const serviceRequest = data[0].service_pricing[0];
        

        if(!data || data.length === 0 || !serviceRequest) {
            res.status(404).json({error: 'no pricing found for that service and size'})
        }

        const servicePricing = serviceRequest.price;
        const serviceDuration = serviceRequest.duration_minutes;

        if(error) {
            res.status(500).json({error : 'something went wrong, try again later'});
        }
        
        res.status(200).json({pricing: servicePricing, duration: serviceDuration});

    } catch(err) {
        res.json({error: err.message})
    }
})

module.exports = router;