require('dotenv').config(({path: './config/.env' }))

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
let endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//const adminRoutes = require('./routes/adminRoutes');
const { router: customerRoutes, saveBookingIfNeeded } = require('./routes/surveyRoutes');

const app = express();

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
                return res.sendStatus(200);
            } catch(err) {
                return res.status(400).json({ error: err.message });
            }
        }
        else {
            return res.status(500).json({ error: "PAYMENT FAILED" });
        }
        } catch(err) {
            res.status(500).json({ error: err.message });
        }
    }
})

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later'
    })
);
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(helmet());


app.use(express.json());


//app.use('/admin', adminRoutes);
app.use('/survey', customerRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})