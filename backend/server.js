require('dotenv').config(({path: './config/.env' }))


const cors = require('cors');
const express = require('express');
//const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/surveyRoutes');
const stripe = require("stripe")(process.env.STRIPE_SECRET)

const app = express();
app.use(express.json());
app.use(cors());

//app.use('/admin', adminRoutes);
app.use('/survey', customerRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
})

app.get("/", (req, res) => {
    res.json({greeting : "hello world"});
})