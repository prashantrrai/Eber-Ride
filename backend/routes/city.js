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




// API to find registered city and country Name in Mongodb............
cityRoutes.get("/citydata", async (req, res) => {
  try {
    // const citydata = await City_Schema.find();
    const citydata = await cityModel.aggregate([{
        $lookup: {
          from:'countrymodels',
          foreignField:'_id',
          localField:'country_id',
          as:'countryDetails'
        }
      },
      { $unwind: '$countryDetails' }
    ])
    
    // const citydata = await cityModel.find({});
    // // res.json({ citydata });

    // console.log(citydata);
    res.send(citydata);
    
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error});
  }      
})



  //  API to update data of city in database using Angular form.
  cityRoutes.put('/cityupdate/:id', async (req, res) => {
      try {
        const cityId = req.params.id;
        const updatedCity = {
          city: req.body.city,
          coordinates: req.body.coordinates
        };
        console.log(cityId)
        console.log(updatedCity)
  
        let cityData =  await cityModel.findByIdAndUpdate(cityId, updatedCity, {new:true});
       
      res.json({ success: true, message: "City Updated Successfully" ,cityData});
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "City Update Failed" });
    }
  });



module.exports = cityRoutes;

