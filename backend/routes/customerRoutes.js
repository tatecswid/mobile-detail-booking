const express = require('express');
const router = express.Router();

const sql = require("../config/supabaseClient")

router.get('/', async (req, res) => {
    const users = await sql`SELECT * from customer_contact`;
    res.status(200).json(users)
})

module.exports = router;