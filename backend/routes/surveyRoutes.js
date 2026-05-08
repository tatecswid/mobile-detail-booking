const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// fetching locations
router.get('/options', async (req, res) => {
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
        res.status(500).json({error: "something went wrong, try again later"});
        return;
    }

    res.status(200).json(options);
})

router.get('/services', async (req, res) => {
    const { data, error } = await supabase.from('service').select('service_name');

    if(error) {
        res.status(500).json({error: error.message});
        return;
    }

    res.status(200).json(data);
})

module.exports = router;