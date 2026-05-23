const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// fetching all of the availible options such as locations, services, and addons
router.get('/options', async (req, res) => {
    try{
        const { data: locationResponse, error: locationError} = await supabase.from('location').select('location_name');
        const { data: serviceResponse, error: serviceError } = await supabase.from('service').select('service_name');
        
        const locationOptions = locationResponse.map((item) => item.location_name);
        const serviceOptions = serviceResponse.map((item) => item.service_name);
        
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

// localhost:3000/survey/appropriate-addons?serviceType=${service}
router.get('/appropriate-addons', async (req, res) => {
    try {
        const { serviceType } = req.query;
        const { data : selectedId, error : selectedServiceIdError } = await supabase.from('service')
                                                                        .select('service_id')
                                                                        .eq('service_name', serviceType)
        let serviceId = selectedId[0].service_id;

        const allowedServices = {
            1 : [1],
            2 : [2],
            3 : [1,2],
        };

        const { data : availibleAddons, error : availibleAddonsError } = await supabase.from('addon')
                                                                        .select('addon_name')
                                                                        .in('service_req', allowedServices[serviceId])

        if(selectedServiceIdError || availibleAddonsError) {
            res.status(500).json({error : 'could not fetch valid options, try again later'});
            return;
        }

        res.status(200).json(availibleAddons.map(({ addon_name }) => addon_name))

    } catch(err) {
        res.json({error: err.message})
    }
})

// this is what to call on the frontend: localhost:3000/survey/calculate-costs?service=${service}&size=${size}&addons=${addons}
// fetching the duration and price:
router.get('/calculate-costs', async (req, res) => {
    try {
        const {service, size, addons} = req.query;
        const { data : d, error : e } = await supabase.from('addon')
                                        .select('addon_id')
                                        .in('addon_name', addons)
        const addon_ids = d.map(({addon_id}) => addon_id)
        
        

        const { data : addonCostData, error :sdf } = await supabase.from('addon_pricing')
                                        .select('duration_minutes, price')
                                        .eq('car_size', size)
                                        .in('addon_id', addon_ids)
        console.log(addonCostData)

        let pricing = 0;
        let duration = 0;

        addonCostData.map(addonOptions => {
            pricing += addonOptions.price
            duration += addonOptions.duration_minutes
        })

        if(!service || !size) {
            res.status(400).json({error : 'service and size are required'})
        }

        const { data : sd, error: ef } = await supabase.from('service')
                                            .select('*, service_pricing!inner(*)')
                                            .eq('service_name', service)
                                            .eq('service_pricing.car_size', size);
        const serviceRequest = sd[0].service_pricing[0];
        
        console.log(serviceRequest)

        if(!sd || sd.length === 0 || !serviceRequest) {
            res.status(404).json({error: 'no pricing found for that service and size'})
        }

        pricing += serviceRequest.price;
        duration += serviceRequest.duration_minutes;

       /* if(error) {
            res.status(500).json({error : 'something went wrong, try again later'});
        }*/
        
        res.status(200).json({pricing, duration});

    } catch(err) {
        res.json({error: err.message})
    }
})

module.exports = router;