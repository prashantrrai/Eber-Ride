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
        res.status(200).json({success: true, message: "Pricing Data Added Successfully", pricingData})

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error});
    }
})

// --------------------------------------------GET PRICING DATA API---------------------------------------------
pricingRoutes.get("/pricingdata", async (req, res) => {
    try {
        const pricingData = await pricingModel.find()
        res.status(200).json({success: true, message: "Pricing Data Fetched Successfully", pricingData})
    } catch (error) {
        res.status(500).json({ success: false, message: error});
    }
})

// --------------------------------------------DELETE PRICING DATA API---------------------------------------------
pricingRoutes.delete("/deletepricing/:id", async (req, res) => {
    try {
        const id = req.params.id
        const pricingData = await pricingModel.findByIdAndDelete(id)
        res.status(200).json({success: true, message: "Pricing Data Deleted Successfully", pricingData})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error});
    }
})

// --------------------------------------------UPDATE PRICING DATA API---------------------------------------------
pricingRoutes.put("/updatepricing/:id", async (req, res) => {
    try {
        
    const id = req.params.id;
    const {country, city, service, driverprofit, minfare, distancebaseprice, baseprice, ppudist, pputime, maxspace} = req.body
    
    const data = {
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
    }

    await pricingModel.findByIdAndUpdate(id, data, {new:true})
    res.status(200).json({success: true, message: "Pricing Data Updated Successfully", data})

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error});
    }
})


module.exports = pricingRoutes;