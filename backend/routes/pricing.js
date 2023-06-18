const express = require('express')
const pricingRoutes = express.Router()
const pricingModel = require('../models/pricing')


// --------------------------------------------POST PRICING DATA API---------------------------------------------
pricingRoutes.post("/addpricing", async (req, res) => {
    const {country, city, service, driverprofit, minfare, distancebaseprice, baseprice, ppudist, pputime, maxspace} = req.body

    try {
        const pricingData = new pricingModel({ 
            country: country, 
            city: city, 
            service: service, 
            driverprofit: driverprofit, 
            minfare: minfare, 
            distancebaseprice: distancebaseprice, 
            baseprice: baseprice,
            ppudist: ppudist,
            pputime: pputime,
            maxspace: maxspace
        });
    
        await pricingData.save()
        console.log(pricingData)
        res.status(200).json({success: true, message: "Pricing Added Successfully", pricingData})

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error});
    }
})


module.exports = pricingRoutes;