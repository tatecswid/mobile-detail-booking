const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

// fetching locations
router.get('/locations', async (req, res) => {
    const { data, error } = await supabase.from('location').select('location_name');

    if(error) {
        res.status(500).json({error: error.message});
        return;
    }

    res.status(200).json(data);
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