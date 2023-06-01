  const express = require("express");
  const VehicleRoutes = express.Router() 
  const vehicle_schema = require('../models/vehicle_model');
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
      const ext = path.extname(file.originalname);
      console.log(file)
      let fileName = file.fieldname + '-' + Date.now() + ext;
      req.body.vehicle = fileName
      console.log(req.body.vehicle);
      cb(null, fileName);           // Define the filename (you can customize it as needed)
    
    }
  });
  // const upload = multer({ storage: storage });

  const fileFilter = function (req, file, cb) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and GIF files are allowed.'));
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: fileFilter
  });


  //  API to register vehicle data in database using Angular form.
  VehicleRoutes.post('/vehicleadd', async (req, res, next) => {
    upload.single('vehicleImage')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: "File size exceeds the limit (2MB)." });
        }
        return res.status(400).json({ success: false, message: "Unexpected error while uploading the file." });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  }, async (req, res) => {
      const { vehicleName } = req.body;
      let vehicle
      try {
        if (!req.file) {
          vehicle = new vehicle_schema({ vehicleName: vehicleName});
        }else{
          const vehicleImage = req.file.filename;
          vehicle = new vehicle_schema({ vehicleName: vehicleName, vehicleImage: vehicleImage });
        }
        await vehicle.save();
        res.json({ success: true, message: "Vehicle Added Successfully", vehicle });

      } catch (err) {
        console.log(err);
        if(err.keyPattern){
          console.log("Vehicle Already Exists")
          return res.status(500).json({success: false, message: "Vehicle Already Exists"});
        }
        res.status(500).json({ success: false, message: err});
      }
    });






    //to fetch data from database of registered vehicle and show in /vehicledata route of frontend.
    VehicleRoutes.get('/vehicledata', async (req, res) => {
    try {
      const data = await vehicle_schema.find({});
      res.json({ data });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  })



  //  API to update data of user in database using Angular form.
  VehicleRoutes.put('/updateVehicle/:id',upload.single('vehicleImage'), async (req, res) => {
  //  console.log(req.file)
    try {
        const vehicleId = req.params.id;
        // console.log(vehicleId)
        let vehicle;

        if (!req.file) {
          vehicle =  await vehicle_schema.findByIdAndUpdate(vehicleId, {
            vehicleName: req.body.vehicleName,
        },{new:true})
     }else{
      vehicle =  await vehicle_schema.findByIdAndUpdate(vehicleId, {
        vehicleName: req.body.vehicleName,
        vehicleImage: req.file.filename
      },{new:true})
     }

    res.json({ success: true, message: "Vehicle Updated Successfully" ,vehicle});
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Vehicle Already Exists" });
  }
});

  module.exports = VehicleRoutes;

  