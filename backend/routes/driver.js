const express = require("express");
const driverRoutes = express.Router()
const driverModel = require("../models/driver");
const multer = require('multer');
const path = require('path');
const profile_path = path.join(__dirname, "../Public/Upload");
const mongoose = require("mongoose");


  // Multer Code
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(file)
      cb(null, profile_path);
    },
    
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      console.log(file)
      // let fileName = file.fieldname + '-' + Date.now() + ext;
      let fileName = file.originalname;
      req.body.profile = fileName
      console.log(req.body.profile);
      cb(null, fileName);
    
    }
  });

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



  // Add New driver
  driverRoutes.post('/adddriver', async (req, res, next) => {
    upload.single('profile')(req, res, function (err) {
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
    const { drivername, driveremail, countrycode, driverphone, city } = req.body;
    let newDriver;
    try {
      if (!req.file) {
        newDriver = new driverModel({ drivername: drivername, driveremail: driveremail, countrycode: countrycode, driverphone: driverphone, city: city });
      }else{
        const profile = req.file.filename;
        console.log(profile);
        newDriver = new driverModel({ profile: profile, drivername: drivername, driveremail: driveremail, countrycode: countrycode, driverphone: driverphone, city: city });
      }

      await newDriver.save()
      console.log(newDriver)
      res.status(201).json({ success: true, message: 'Driver Added Successfully', newDriver});
    } catch (error) {
      if(error.keyPattern){
        console.log(error)
        return res.status(500).json({success: false, message: "Driver Already Exists"});
      }
    res.status(500).json({ success: false, message: error});
    }
  });


  // Delete a Driver
  driverRoutes.delete('/driverdata/:id', async (req, res) => {
    try {
      const driverId = req.params.id;
      
      const deletedDriver = await driverModel.findByIdAndDelete(driverId);
      if (!deletedDriver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      return res.json({ success: true, message: 'Driver Deleted Successfully' });
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error});
    }
  });



  // Update a Driver
  driverRoutes.put('/updatedriver/:id', upload.single('profile'), async (req, res) => {
    // console.log(req.body)
    // console.log(req.file)
    const { updatedrivername, updatedriveremail, updatedcountrycode, updatedriverphone, updatedcity } = req.body;

    try {
      const driverId = req.params.id;
      console.log(driverId)
      let updatedDriver;

      if (!req.file) {
        const driver = {drivername: updatedrivername, driveremail: updatedriveremail,countrycode: updatedcountrycode, driverphone: updatedriverphone, city: updatedcity}
        updatedDriver =  await driverModel.findByIdAndUpdate(driverId, driver, {new:true})
      }
      else{
        console.log(req.file.filename)
        const driver = {profile: req.file.filename ,drivername: updatedrivername, driveremail: updatedriveremail,countrycode: updatedcountrycode, driverphone: updatedriverphone, city: updatedcity}
        updatedDriver =  await driverModel.findByIdAndUpdate(driverId, driver, {new:true})
      }

      res.json({ success: true, message: "Driver Updated Successfully" ,updatedDriver});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Driver Already Exists" });
    }
  });



  // Search Driver
  driverRoutes.get('/driversearch', async (req, res) => {
    try {
      const query = req.query;
      const currentPage = parseInt(query.currentPage) || 1;
      const limit = parseInt(query.limit) || 5;
      const skip = (currentPage - 1) * limit;
      const { sortColumn, sortOrder } = req.query;
      console.log(query)

      const searchData = {
        $or: [
          { drivername: { $regex: query.query, $options: 'i' } },
          { driverphone: { $regex: query.query, $options: 'i' } },
          { driveremail: { $regex: query.query, $options: 'i' } },
        ],
      };

        // Check if the query is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(query.query)) {
          searchData.$or.push({ _id: query.query });
        }

        const count = await driverModel.countDocuments(searchData);
        const totalPages = Math.ceil(count / limit);
  
        const sortObject = {};
        // sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;
        sortObject['username'] = 1;

        const driverdata = await driverModel.find(searchData).skip(skip).limit(limit).sort(sortObject);

      // console.log(driverdata)
      res.json({ success: true, message: 'Data Found', driverdata, totalPages });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error });
    }
  });


  // Get Driver Data with (pagination)
  driverRoutes.get('/driverdata', async (req, res) => {
    try {
      const { page, limit } = req.query;
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 5;

      const totalDrivers = await driverModel.countDocuments({});
      const totalPages = Math.ceil(totalDrivers / limitNumber);

      const driverdata = await driverModel
        .find({})
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
        
        // console.log(driverdata)
        res.json({
          success: true,
          message: 'Driver Retrieved Successfully',
          page: pageNumber,
          limit: limitNumber,
          totalPages: totalPages,
          driverdata: driverdata
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error });
    }
  });


  driverRoutes.put('/drivers/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      console.log(id)
      console.log(status)
  
      await driverModel.findByIdAndUpdate(id, { status });
  
      res.status(200).json({ message: 'Driver Status Updated Successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update driver status.' });
    }
  });


  // Add or Update Service
  driverRoutes.post('/service', async (req, res) => {
    try {
      const { servicename } = req.body;
  
      // Check if service already exists
      const existingService = await driverModel.findOne({});
      console.log(existingService)
      if (existingService) {
        // Update the existing service
        existingService.servicetype = servicename;
        await existingService.save();
        res.json({ success: true, message: 'Service updated successfully', service: existingService });
      } else {
        // Create a new service
        const newService = new Service({ servicetype: servicename });
        await newService.save();
        res.json({ success: true, message: 'Service added successfully', service: newService });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Failed to add or update service' });
    }
  });



module.exports = driverRoutes;


