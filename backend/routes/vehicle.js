  const express = require("express");
  const VehicleRoutes = express.Router() 
  const vehicleModel = require('../models/vehicle');
  const multer = require('multer');
  const path = require('path');
  const pricingModel = require("../models/pricing");
  const img_path = path.join(__dirname, "../Public/Vehicle");





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
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, WEBP and GIF files are allowed.'));
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: fileFilter
  });


  // -------------------------------------------------ADD NEW VEHICLE---------------------------------------------
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
          vehicle = new vehicleModel({ vehicleName: vehicleName});
        }else{
          const vehicleImage = req.file.filename;
          vehicle = new vehicleModel({ vehicleName: vehicleName, vehicleImage: vehicleImage });
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


    // ---------------------------------------CHECKING CITY AND COUNTRY FROM PRICING---------------------------------------------
    VehicleRoutes.post('/vehicledata', async (req, res) => {
      try {
      const usedVehicle = await pricingModel.find({ $and: [{city: req.body.city}, {country: req.body.country}]})
      const newArray = usedVehicle.map(vehicle => vehicle.service);
      // const data = await vehicleModel.find({});
      const data = await vehicleModel.aggregate([
        {
          $match: {
            _id: { $nin: newArray } // Exclude documents with the specified city values
          }
        }
      ])
      // console.log(data)
      res.json({ data });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  })

  // ----------------------------------------------GET VEHICLE DATA-----------------------------------------------------------
  VehicleRoutes.get('/vehicledata', async (req, res) => {
    try {
    const data = await vehicleModel.find({});
    // console.log(data)
    res.json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})
  
  // ----------------------------------------------UPDATE VEHICLE DATA-----------------------------------------------------------
//   VehicleRoutes.put('/updateVehicle/:id',upload.single('vehicleImage'), async (req, res) => {
//   //  console.log(req.file)
//     try {
//         const vehicleId = req.params.id;
//         // console.log(vehicleId)
//         let vehicle;

//         if (!req.file) {
//           vehicle =  await vehicleModel.findByIdAndUpdate(vehicleId, {
//             vehicleName: req.body.vehicleName,
//         },{new:true})
//      }else{
//       vehicle =  await vehicleModel.findByIdAndUpdate(vehicleId, {
//         vehicleName: req.body.vehicleName,
//         vehicleImage: req.file.filename
//       },{new:true})
//      }

//     res.json({ success: true, message: "Vehicle Updated Successfully" ,vehicle});
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Vehicle Already Exists" });
//   }
// }); 
 // ----------------------------------------------UPDATE VEHICLE DATA-----------------------------------------------------------
  VehicleRoutes.put('/updateVehicle/:id',async (req, res, next) => {
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
  //  console.log(req.file)
    try {
        const vehicleId = req.params.id;
        // console.log(vehicleId)
        let vehicle;

        if (!req.file) {
          vehicle =  await vehicleModel.findByIdAndUpdate(vehicleId, {
            vehicleName: req.body.vehicleName,
        },{new:true})
     }else{
      vehicle =  await vehicleModel.findByIdAndUpdate(vehicleId, {
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

  