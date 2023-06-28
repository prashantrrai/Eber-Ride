// https://restcountries.com/v3.1/name/india
const express = require("express");
const countryRoutes = express.Router();
const countryModel = require("../models/country");

//  API to register country data in database.
countryRoutes.post("/countryadd", async (req, res) => {
  try {
    // Create a new instance of the Country model
    const country = new countryModel(req.body);

    await country.save();
    console.log(country);
    res.status(201).json({ message: "Country Added Successfully", country });
  } catch (error) {
    if (error.keyPattern) {
      console.log("Country Already Exists");
      return res
        .status(500)
        .json({ success: false, message: "Country Already Exists" });
    }
    res.status(500).json({ success: false, message: error });
  }
});

countryRoutes.get("/countrydata", async (req, res) => {
  try {
    const countrydata = await countryModel.find({});
    res.json({ countrydata });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// ---------------------------------COUNTRY SEARCH API---------------------------------------------//
countryRoutes.get("/searchcountry", async (req, res) => {
  let search = req.query.search;
  try {
    let query = {};

    if (search) {
      query = {
        $or: [{ countryName: { $regex: search, $options: "i" } }],
      };
    }
    let countrydata = await countryModel.find(query);

    res.json({
      success: true,
      message: "Data Found",
      countrydata,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = countryRoutes;
