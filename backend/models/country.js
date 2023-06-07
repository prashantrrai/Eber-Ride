const mongoose = require("mongoose");


const country_Schema = new mongoose.Schema({
  countryName: {
    type: String,
    required:true,
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

const countryModel = mongoose.model("countryModel", country_Schema);  //mapping vehicle_model data into vehicle_data


module.exports = countryModel;

