const express = require("express");
const pricingRoutes = express.Router();
const pricingModel = require("../models/pricing");
const mongoose = require("mongoose");

// --------------------------------------------POST PRICING DATA API---------------------------------------------
pricingRoutes.post("/addpricing", async (req, res) => {
  const {
    country,
    city,
    service,
    driverprofit,
    minfare,
    distancebaseprice,
    baseprice,
    ppudist,
    pputime,
    maxspace,
  } = req.body;

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
      maxspace: maxspace,
    });

    await pricingData.save();
    console.log(pricingData);
    res
      .status(200)
      .json({
        success: true,
        message: "Pricing Data Added Successfully",
        pricingData,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
});


// --------------------------------------------DELETE PRICING DATA API---------------------------------------------
pricingRoutes.delete("/deletepricing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pricingData = await pricingModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Pricing Data Deleted Successfully",
        pricingData,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
});

// --------------------------------------------UPDATE PRICING DATA API---------------------------------------------
pricingRoutes.put("/updatepricing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      country,
      city,
      service,
      driverprofit,
      minfare,
      distancebaseprice,
      baseprice,
      ppudist,
      pputime,
      maxspace,
    } = req.body;

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
      maxspace: maxspace,
    };

    await pricingModel.findByIdAndUpdate(id, data, { new: true });
    res
      .status(200)
      .json({
        success: true,
        message: "Pricing Data Updated Successfully",
        data,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
});


// ---------------------------GET DATA, SEARCH, PAGINATION, SORT--------------------------------------------------------------------
pricingRoutes.get("/pricingdata", async (req, res) => {
  
  // let page = parseInt(req.query.page) || 1;
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let search = req.query.search;
  let skip = (page - 1) * limit;


  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { country: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { service: { $regex: search, $options: "i" } },
        ],
      };
    }

    let pricingdata = await pricingModel.find(query).limit(limit).skip(skip).sort({ city : -1, _id: 1 })

    const count = await pricingModel.find(query).count();

    let totalPage = Math.ceil(count / limit);

    // If page is greater than totalPage, set it to the last page
    if (page > totalPage) {
      page = totalPage;
      skip = (page - 1) * limit;
    }

    res.json({ success: true, message: "Data Found", pricingdata, page, limit, totalPage, count })
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});


module.exports = pricingRoutes;
