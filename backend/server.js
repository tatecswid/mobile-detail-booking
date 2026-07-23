require('dotenv').config(({path: './config/.env' }))

const cors = require('cors');
const express = require('express');
//const adminRoutes = require('./routes/adminRoutes');
const { router: customerRoutes, saveBookingIfNeeded } = require('./routes/surveyRoutes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();

let endpointSecret = "whsec_5a5620d3faffab914df96141ca6133f30dce3ada4c1f43cbba4fdd930ab66166";

app.post('/survey/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    let event;

    if(endpointSecret) {
        try {
        const sig = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret,
        );

        if(event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const addons = JSON.parse(paymentIntent.metadata.addons);
            const bookingFields = {stripe_payment_id: paymentIntent.id, ...paymentIntent.metadata, addons};

            console.log(bookingFields);
            try {
                saveBookingIfNeeded(bookingFields);
            } catch(err) {
                return res.status(500).json({ error: err.message });
            }
        }

        res.sendStatus(200);
        } catch(err) {
            res.status(500).json(err.message);
        }
    }
})

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