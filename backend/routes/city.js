const express = require("express");
const cityRoutes = express.Router()
const cityModel = require('../models/city')


//  API to register city data in database.
cityRoutes.post("/cityadd", async (req, res) => {
  try {
    // const citydata = new cityModel(req.body);

      citydata = new cityModel({
        country_id: req.body.country_id,
        city: req.body.city,
        coordinates: req.body.coordinates
      });

    await citydata.save();
    console.log(citydata);

    res.status(201).send({success: true, citydata, message: "City Added Successfully"});

  } catch (error) {
    console.log(error);

    if(error.keyPattern){
      if (error.keyPattern.city) {
        console.log("Country Already Exists")
            return res.status(500).json({success: false, message: "City Already Exists"});
      } 
    }
  
    res.status(500).json({ success: false, message: error});
  }
});




// API to find registered Country Name in Mongodb already.
cityRoutes.get("/city", async (req, res) => {
  try {
    // const citydata = await City_Schema.find();
    const cities = await cityModel.aggregate([
      {
        $lookup: {
          from:'country_schemas',
          foreignField:'_id',
          localField:'country_id',
          as:'countrydata'
        }
      },
      {
        $unwind: '$countrydata'
      }
    ])
    console.log(cities);
    res.send(cities);
  } catch (error) {
    res.send(error);
  }      
})




module.exports = cityRoutes;

