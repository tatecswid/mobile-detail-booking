require('dotenv').config(({path: './config/.env' }))


const cors = require('cors');
const express = require('express');
//const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/surveyRoutes');

const app = express();
app.use(cors());

//app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
}) 