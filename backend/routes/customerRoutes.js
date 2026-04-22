const express = require('express');
const router = express.Router();

const supabase = require("../config/supabaseClient")

router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('customer_contact').select('*');
    res.status(200).json(data)
})

module.exports = router;