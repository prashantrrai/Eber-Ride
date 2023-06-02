const mongoose = require("mongoose");


const country_model = new mongoose.Schema({
  countryName: {
    type: String,
    unique: true,
  },
  countryTimeZone: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  countryCurrency: {
    type: String,
  },
  flagImage: {              
    type: String,
  }
});

const Country_schema = mongoose.model("Country_schema", country_model);  //mapping vehicle_model data into vehicle_data


module.exports = Country_schema;

