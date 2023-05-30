const express = require("express");
const VehicleRoutes = express.Router() 
const vehicle_data = require('../models/vehicle_model');
const multer = require('multer');
const path = require('path')
const img_path = path.join(__dirname, "../Public/Upload");





// multer to store the vehicle images in database.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file)
    cb(null, img_path);     // Specify the directory to store uploaded files
  },
  
  filename: function (req, file, cb) {
    console.log(file)
    let fileName = file.originalname + '-' + Date.now()
    req.body.vehicle = fileName
    console.log(req.body.vehicle);
    cb(null, fileName);           // Define the filename (you can customize it as needed)
  
  }
});
const upload = multer({ storage: storage });



//  API to register vehicle data in database using Angular form.
VehicleRoutes.post('/vehicleadd', upload.single('vehicleImage'), async (req, res) => {
    const { vehicleName } = req.body;

    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      
      //image is now getting properly uploaded using multer, getting proper path using img_path and req.file.filename
    const vehicleImage = req.file.filename;

      // Insert vehicle name and image path into the database
      const vehicle = new vehicle_data({ vehicleName: vehicleName, vehicleImage: vehicleImage });
      await vehicle.save();
      res.json({ success: true, message: "Vehicle Added Successfully", vehicle });
    // console.log("vehicle data is added from backend")

    } catch (error) {
      console.error('Error While Inserting vehicle into the database..........', error);
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



//  API to update data of user in database using Angular form.
VehicleRoutes.put('/updateVehicle/:id',upload.single('vehicleImage'), async (req, res) => {
 console.log(req.file)
  try {
      const vehicleId = req.params.id;
      console.log(vehicleId)
    const vehicle =  await vehicle_data.findByIdAndUpdate(vehicleId, {
        vehicleName: req.body.vehicleName,
        vehicleImage: req.file.filename
      },{new:true})

    res.json({ success: true, message: "Vehicle Updated Successfully" ,vehicle});
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Vehicle Not Updated" });
  }
});

  module.exports = VehicleRoutes;