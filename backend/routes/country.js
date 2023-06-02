// https://restcountries.com/v3.1/name/india
const express = require("express");
const countryRoutes = express.Router()
const Country_schema = require('../models/country_model')



//  API to register country data in database.
countryRoutes.post('/countryadd', async (req, res) => {
    try {
        // console.log(req.body)
        // const {
        //     countryName,
        //     countryTimeZone,
        //     countryCode,
        //     countryCurrency,
        //     flagImage
        // } = req.body;

        // Create a new instance of the Country model
        const country = new Country_schema(req.body);

        await country.save();
        console.log(country)
        res.status(201).json({message: 'Country Data added Successfully', country});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = countryRoutes;

