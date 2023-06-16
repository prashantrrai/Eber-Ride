const mongoose = require("mongoose");


const driver_Schema = new mongoose.Schema({
  profile: {
    type: String,
    default: "default profile.png"
  },
  drivername: {
    type: String,
    required: true,
  },
  driveremail: {
    type: String,
    required: true,
    unique: true,
  },
  countrycode: {
    type: String,
    required: true,
  },
  driverphone: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  }
});

const driverModel = mongoose.model("driverModel", driver_Schema);



module.exports = driverModel;
