const express = require("express");
const VehicleRoutes = express.Router() 

const vehicle_data = require('../models/vehicle_model');
const multer = require('multer');
const path = require('path')
const img_path = path.join(__dirname, "../Public/Upload");



// multer to store the vehicle images in database.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../Public/Upload');             // Specify the directory to store uploaded files
  },
  
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);           // Define the filename (you can customize it as needed)
  }
});

const upload = multer({ storage: storage });


//  API to register vehicle data in database using Angular form.

VehicleRoutes.post('/vehicleadd', upload.single('vehicleImage'), async (req, res) => {

    const { vehicleName } = req.body;
    const vehicleImage = req.file.img_path;


    try {
      // Insert vehicle name and image path into the database
      const vehicle = new vehicle_data({ vehicleName: vehicleName, vehicleImage: vehicleImage });
      await vehicle.save();
      res.json({ success: true, message: "Vehicle Added Successfully" });
    } catch (error) {
      console.error('Error inserting into the database:', error);
      res.status(500).json({success: false, error: 'An error occurred while uploading the file.' });
    }
  });
   


  //to fetch data from database of registered vehicle and show in /vehicledata route of frontend.

  VehicleRoutes.get('/vehicledata', async (req, res) => {
  try {
    const data = await vehicle_data.find({});
    res.json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})


 

  module.exports = VehicleRoutes;