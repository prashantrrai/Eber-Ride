// --------------------------------------------After Adding Object ID---------------------------------------------
const express = require("express");
const pricingRoutes = express.Router();
const pricingModel = require("../models/pricing");

// // --------------------------------------------POST PRICING DATA API---------------------------------------------
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
    res.status(200).json({
      success: true,
      message: "Pricing Data Added Successfully",
      pricingData,
    });
  } catch (error) {
    console.log(error);
    if(error.keyPattern){
      if (error.keyPattern.city && error.keyPattern.service) {
        console.log("Vehicle Already Exists")
            return res.status(500).json({success: false, message: "Vehicle Already Exists"});
      } 
    }
    res.status(500).json({ success: false, message: error });
  }
});

// // --------------------------------------------DELETE PRICING DATA API---------------------------------------------
pricingRoutes.delete("/deletepricing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pricingData = await pricingModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Pricing Data Deleted Successfully",
      pricingData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
});

// // --------------------------------------------UPDATE PRICING DATA API---------------------------------------------
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
    res.status(200).json({
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

  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  // let search = req.query.search;
  let skip = (page - 1) * limit;

  try {
    // let query = {};

    // if (search) {
    //   query = {
    //     $or: [
    //       { country: { $regex: search, $options: "i" } },
    //       { city: { $regex: search, $options: "i" } },
    //       { service: { $regex: search, $options: "i" } },
    //     ],
    //   };
    // }

    const count = await pricingModel.find().count();
    let totalPage = Math.ceil(count / limit);
    
    if (page > totalPage) {
      page = totalPage;
      skip = (page - 1) * limit;
    }
    
    // let pricingdata = await pricingModel.find(query).limit(limit).skip(skip).sort({ city : -1, _id: 1 })
    const aggregatePipeline = [
      { $lookup: {
        from: "countrymodels",
        localField: "country",
        foreignField: "_id",
        as: "countryDetails"
      }}, 
      { $lookup: {
        from: "citymodels",
        localField: "city",
        foreignField: "_id",
        as: "cityDetails"
      }},
      { $lookup: {
        from: "vehiclemodels",
        localField: "service",
        foreignField: "_id",
        as: "serviceDetails"
      }},
    
    { $unwind: "$countryDetails" },{ $unwind: "$cityDetails" },{ $unwind: "$serviceDetails" },
    // { $match: query },
    { $sort: { city: -1, _id: 1 } },
    { $skip: skip },
    { $limit: limit }
    ];

    const pricingdata = await pricingModel.aggregate(aggregatePipeline);

    res.json({ success: true, message: "Data Found", pricingdata, page, limit, totalPage, count })
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

// ----------------Vehicle data with City ID---------------//
pricingRoutes.get("/vehicle/:id", async (req, res) => {
  try {
    const cityId = req.params.id;
    const pricingdata = await pricingModel.find({ city: cityId }).populate("service",'vehicleName');
    res.status(200).json({ success: true, message: "Pricing Data Found based on City ID", pricingdata });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error });
  }
});

module.exports = pricingRoutes;
