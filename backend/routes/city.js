const express = require("express");
const cityRoutes = express.Router()
const cityModel = require('../models/city')




//  API to register country data in database.
cityRoutes.post("/city",async (req, res) => {
  try {
      citydata = await new cityModel({
        city: req.body.city,
       country_id:req.body.countryid,
        coordinates:req.body.coordinates
      });
    await citydata.save();
    console.log(citydata);
    res.send({
      success: true,
      citydata,
      message: "city add succesfully",
    });
  } catch (error) {
    console.log(error);
    if(error.keyPattern){
      if (error.keyPattern.city) {
        return res.status(500).send({
          success: false,
          message: "city already exist!!!!!!!!!!!!!!!!!!!!" 
        })
      } 
    }
  
    res.status(500).send(error)
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

