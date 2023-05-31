const mongoose = require("mongoose");


const vehicle_model = new mongoose.Schema({
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

const vehicle_schema = mongoose.model("vehicle_schema", vehicle_model);  //mapping vehicle_model data into vehicle_data



//to save data statically from backend only into database .

// const document = new vehicle_data({ vehicleName: 'Auto Rickshaw', vehicleImage: '../../frontend/src/assets/images/auto rk.jpg'});

// document.save()
// .then(() => {
//   console.log("Rickshaw inserted")
// }).catch((err) => {
//   console.log("this is error......"+ err)
// })


module.exports = vehicle_schema;

