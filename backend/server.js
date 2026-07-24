require('dotenv').config(({path: './config/.env' }))

const cors = require('cors');
const express = require('express');
//const adminRoutes = require('./routes/adminRoutes');
const { router: customerRoutes, saveBookingIfNeeded } = require('./routes/surveyRoutes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();

let endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

//app.use('/admin', adminRoutes);
app.use('/survey', customerRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})

app.get("/", (req, res) => {
    res.json({greeting : "hello world"});
})