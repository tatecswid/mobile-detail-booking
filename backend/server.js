require('dotenv').config(({path: './config/.env' }))

const express = require('express');
//const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

//app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
})