const express = require("express");
const cityRoutes = express.Router()
const City_Schema = require('../models/city_model')
const Country_schema = require('../models/country_model')




//  API to register country data in database.
// cityRoutes.post('/countryadd', async (req, res) => {
//     try {
//         // Create a new instance of the Country model
//         const country = new Country_schema(req.body);

//         await country.save();
//         console.log(country)
//         res.status(201).json({message: 'Country Added Successfully', country});
//     } catch (error) {

//         if(error.keyPattern){
//             console.log("Country Already Exists")
//             return res.status(500).json({success: false, message: "Country Already Exists"});
//           }
//         res.status(500).json({ success: false, message: error});
//     }
// });


// cityRoutes.get('/citydata', async (req,res) => {
//     try {
//         const citydata = await City_Schema.find({});
//         res.json({ citydata });
//       } catch (err) {
//         console.log(err);
//         res.status(500).send("Internal Server Error");
//       }
// })


// API to find registered Country Name in Mongodb already.
cityRoutes.get('/countrynames', async (req,res) => {
    try {
        const countrynames = await Country_schema.find({});
        let result = countrynames.map(name => name.countryName);
        res.json({ result });
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
})



module.exports = cityRoutes;

