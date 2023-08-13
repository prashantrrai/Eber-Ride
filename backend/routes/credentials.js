const express = require('express');
const credentials = express.Router();

// credentials.get('/env', (req, res) => {
//   const envData = {
//     EMAIL_USER: process.env.EMAIL_USER,
//     EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
//     accountSid: process.env.accountSid,
//     authToken: process.env.authToken,
//     twilioPhoneNumber: process.env.twilioPhoneNumber,
//     STRIPE_Secret_key: process.env.STRIPE_Secret_key,
//     STRIPE_Publishable_key: process.env.STRIPE_Publishable_key
//   };
//   res.json(envData);
//   // console.log(envData)
// });

module.exports = credentials;
