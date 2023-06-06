const express = require("express");
const cityRoutes = express.Router()
const cityRoutes = require('../models/country_model')




// //  API to register country data in database.
// countryRoutes.post('/countryadd', async (req, res) => {
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


// countryRoutes.get('/countrydata', async (req,res) => {
//     try {
//         const countrydata = await Country_schema.find({});
//         res.json({ countrydata });
//       } catch (err) {
//         console.log(err);
//         res.status(500).send("Internal Server Error");
//       }
// })


// module.exports = countryRoutes;

