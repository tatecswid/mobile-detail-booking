const express = require('express');
const router = express.Router();

const sql = require("../config/supabaseClient")

router.get('/', async (req, res) => {
    const adminAction = await sql`SELECT * from customer_contact`;
    res.send(adminAction);
})

module.exports = router;