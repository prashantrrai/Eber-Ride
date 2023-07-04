const express = require("express");
const driverRoutes = express.Router();
const driverModel = require("../models/driver");
const multer = require("multer");
const path = require("path");
const profile_path = path.join(__dirname, "../Public/Profile");
const mongoose = require("mongoose");

//-------------------------------------------------------MULTER CODE----------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file);
    cb(null, profile_path);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // console.log(file);
    // let fileName = file.fieldname + '-' + Date.now() + ext;
    let fileName = file.originalname;
    req.body.profile = fileName;
    // console.log(req.body.profile);
    cb(null, fileName);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WEBP and GIF files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: fileFilter,
});

// -------------------------------------------------ADD NEW DRIVER--------------------------------------------------------
driverRoutes.post(
  "/adddriver",
  async (req, res, next) => {
    upload.single("profile")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the limit (2MB).",
          });
        }
        return res.status(400).json({
          success: false,
          message: "Unexpected error while uploading the file.",
        });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { drivername, driveremail, countrycode, driverphone, city } =
      req.body;
    let newDriver;
    try {
      if (!req.file) {
        newDriver = new driverModel({
          drivername: drivername,
          driveremail: driveremail,
          countrycode: countrycode,
          driverphone: driverphone,
          city: city,
        });
      } else {
        const profile = req.file.filename;
        // console.log(profile);
        newDriver = new driverModel({
          profile: profile,
          drivername: drivername,
          driveremail: driveremail,
          countrycode: countrycode,
          driverphone: driverphone,
          city: city,
        });
      }

      await newDriver.save();
      // console.log(newDriver);
      res.status(201).json({
        success: true,
        message: "Driver Added Successfully",
        newDriver,
      });
    } catch (error) {
      console.log(error);
      if (error.keyPattern) {
        return res
          .status(500)
          .json({ success: false, message: "Driver Already Exists" });
      }
      res.status(500).json({ success: false, message: error });
    }
  }
);

// --------------------------------GET DRIVERS DATA, SEARCH, PAGINATION, SORT-----------------------------------//
driverRoutes.get("/driverdata", async (req, res) => {
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let search = req.query.search;
  let sortBy = req.query.sortBy || "name";
  let sortOrder = req.query.sortOrder || "desc";
  let skip = (page - 1) * limit;
  // console.log("sortBy", sortBy, "sortOrder", sortOrder)
  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { drivername: { $regex: search, $options: "i" } },
          { driveremail: { $regex: search, $options: "i" } },
          { driverphone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const count = await driverModel.find(query).count();
    let totalPage = Math.ceil(count / limit);

    if (page > totalPage) {
      page = totalPage;
      skip = (page - 1) * limit;
    }

    let sortCriteria = {};

    if (sortBy === "name") {
      sortCriteria = { drivername: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "email") {
      sortCriteria = { driveremail: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "phone") {
      sortCriteria = { driverphone: sortOrder === "asc" ? 1 : -1 };
    } else {
      sortCriteria = { drivername: sortOrder === "asc" ? 1 : -1 };

    }

    const aggregatePipeline = [
      { 
        $lookup: {
          from: "citymodels",
          localField: "city",
          foreignField: "_id",
          as: "cityDetails",
        }
      },
      { 
        $lookup: {
          from: "vehiclemodels",
          localField: "servicetype",
          foreignField: "_id",
          as: "serviceDetails",
        }
      },

      { $unwind: "$cityDetails" },
      { $unwind:{path: "$serviceDetails",
        preserveNullAndEmptyArrays: true }},
      { $match: query },
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: limit },
    ];

    const driverdata = await driverModel.aggregate(aggregatePipeline);

    res.json({
      success: true,
      message: "Data Found",
      driverdata,
      page,
      limit,
      totalPage,
      count,
    });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

// ----------------------------------------------------DELETE DRIVER--------------------------------------------------------

driverRoutes.delete("/driverdata/:id", async (req, res) => {
  try {
    const driverId = req.params.id;

    const deletedDriver = await driverModel.findByIdAndDelete(driverId);
    if (!deletedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    return res.json({ success: true, message: "Driver Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
});

// --------------------------------------------------------UPDATE DRIVER--------------------------------------------------------

driverRoutes.put(
  "/updatedriver/:id",
  upload.single("profile"),
  async (req, res) => {
    // console.log(req.body);
    // console.log(req.file);
    const { drivername, driveremail, countrycode, driverphone, city } =
      req.body;

    try {
      const driverId = req.params.id;
      // console.log(driverId);
      let updatedDriver;

      if (!req.file) {
        const data = {
          drivername: drivername,
          driveremail: driveremail,
          countrycode: countrycode,
          driverphone: driverphone,
          city: city,
        };
        updatedDriver = await driverModel.findByIdAndUpdate(driverId, data, {new: true});
      } 
      else {
        // console.log(req.file.filename);
        const driver = {
          profile: req.file.filename,
          drivername: drivername,
          driveremail: driveremail,
          countrycode: countrycode,
          driverphone: driverphone,
          city: city,
        };
        updatedDriver = await driverModel.findByIdAndUpdate(driverId, driver, {new: true});
      }

      res.status(200).json({
        success: true,
        message: "Driver Updated Successfully",
        updatedDriver,
      });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .json({ success: false, message: "Driver Already Exists" });
    }
  }
);

// --------------------------------------------------------UPDATE DRIVER STATUS--------------------------------------------------------

  // driverRoutes.put('/drivers/:id', async (req, res) => {
  //   const { status } = req.body;
  //   // console.log(status)
  //   try {
  //     const { id } = req.params;
  //     // console.log(id)

  //     await driverModel.findByIdAndUpdate(id, { status },  {new: true});

  //     res.status(200).json({success: true, message: 'Driver Status Updated Successfully.' });
  //   } catch (error) {
  //     res.status(500).json({success: false, message: error});
  //   }
  // });

  //---------------------------------------------------------- ADD OR UPDATE SERVICE---------------------------------------------------

  // driverRoutes.post('/service/:id', async (req, res) => {
  //   const { servicetype } = req.body;
  //   // console.log(req.body);
  //   try {
  //     const driverId = req.params.id;
  //     // console.log(driverId)
  //     const data = {servicetype: servicetype}

  //     // Check if service already exists
  //     const existingService = await driverModel.findByIdAndUpdate(driverId, data, {new: true});
  //     // console.log(existingService)
  //     res.json({ success: true, message: 'Service Updated Successfully', existingService });

  //   } catch (error) {
  //     console.log(error.message);
  //     res.status(500).json({ success: false, message: 'Failed to add or update service' });
  //   }
  // });

  
module.exports = driverRoutes;
