const mongoose = require("mongoose");


const vehicle_Schema = new mongoose.Schema({
  vehicleName: {
    type: String,
    unique: true,
    required: true,
  },
  vehicleImage: {              
    type: String,
    default: "default SUV.webp"
  }
});

const vehicleModel = mongoose.model("vehicleModel", vehicle_Schema);  //mapping vehicle_model data into vehicle_data



module.exports = vehicleModel;

