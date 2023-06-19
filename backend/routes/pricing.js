const express = require('express')
const pricingRoutes = express.Router()
const pricingModel = require('../models/pricing')
const mongoose = require("mongoose");


// --------------------------------------------POST PRICING DATA API---------------------------------------------
pricingRoutes.post("/addpricing", async (req, res) => {
    const { country, city, service, driverprofit, minfare, distancebaseprice, baseprice, ppudist, pputime, maxspace } = req.body

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
        res.status(200).json({ success: true, message: "Pricing Data Added Successfully", pricingData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error });
    }
})

// ----------------------------------GET PRICING DATA API & PAGINATION---------------------------------------------
pricingRoutes.get("/pricingdata", async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 5;

        const totalPricesdata = await pricingModel.countDocuments({});
        const totalPages = Math.ceil(totalPricesdata / limitNumber);

        const pricingData = await pricingModel
            .find({})
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        console.log(pricingData)
        res.status(200).json({ 
            success: true, 
            message: "Pricing Data Fetched Successfully", 
            page: pageNumber, 
            limit: limitNumber, 
            totalPages: totalPages, 
            pricingData: pricingData 
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error });
    }
})

// --------------------------------------------DELETE PRICING DATA API---------------------------------------------
pricingRoutes.delete("/deletepricing/:id", async (req, res) => {
    try {
        const id = req.params.id
        const pricingData = await pricingModel.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: "Pricing Data Deleted Successfully", pricingData })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error });
    }
})

// --------------------------------------------UPDATE PRICING DATA API---------------------------------------------
pricingRoutes.put("/updatepricing/:id", async (req, res) => {
    try {

        const id = req.params.id;
        const { country, city, service, driverprofit, minfare, distancebaseprice, baseprice, ppudist, pputime, maxspace } = req.body

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

        await pricingModel.findByIdAndUpdate(id, data, { new: true })
        res.status(200).json({ success: true, message: "Pricing Data Updated Successfully", data })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error });
    }
})

// ---------------------------------SEARCH PRICING DATA API With SORTING AND PAGINATION-------------------------------------
pricingRoutes.get("/searchpricing", async (req, res) => {
    try {
        const query = req.query;
        const currentPage = parseInt(query.currentPage) || 1;
        const limit = parseInt(query.limit) || 5;
        const skip = (currentPage - 1) * limit;
        const { sortColumn, sortOrder } = req.query;
        console.log(query)

        const searchData = {
            $or: [
                { country: { $regex: query.query, $options: 'i' } },
                { city: { $regex: query.query, $options: 'i' } },
                { service: { $regex: query.query, $options: 'i' } },
            ],
        };

        // Check if the query is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(query.query)) {
            searchData.$or.push({ _id: query.query });
        }


        const count = await pricingModel.countDocuments(searchData);
        const totalPages = Math.ceil(count / limit);

        const sortObject = {};
        // if (sortColumn) {
        //     sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;
        //   }
        // sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;
        sortObject['city'] = 1;

        const pricingdata = await pricingModel.find(searchData).skip(skip).limit(limit).sort(sortObject);

        //   console.log(pricingdata)
        res.json({ success: true, message: 'Data Found', pricingdata, totalPages });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error });
    }
})


module.exports = pricingRoutes;