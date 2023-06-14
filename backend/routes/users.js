const express = require("express");
const mongoose = require("mongoose");
const userRoutes = express.Router()
const userModel = require("../models/users");
const multer = require('multer');
const path = require('path');
const profile_path = path.join(__dirname, "../Public/Upload");


  // Multer Code
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(file)
      cb(null, profile_path);
    },
    
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      console.log(file)
      let fileName = file.fieldname + '-' + Date.now() + ext;
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



  // Add New User
  userRoutes.post('/adduser', async (req, res, next) => {
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
    const { username, useremail, countrycode, userphone } = req.body;
    let newUser;
    try {
      if (!req.file) {
        newUser = new userModel({ username: username, useremail: useremail, countrycode: countrycode, userphone: userphone });
      }else{
        const profile = req.file.filename;
        console.log(profile);
        newUser = new userModel({ profile: profile, username: username, useremail: useremail, countrycode: countrycode, userphone: userphone });
      }

      await newUser.save()
      console.log(newUser)
      res.status(201).json({ success: true, message: 'User Added Successfully', newUser});
    } catch (error) {
      if(error.keyPattern){
        console.log(error)
        return res.status(500).json({success: false, message: "User Already Exists"});
      }
    res.status(500).json({ success: false, message: error});
    }
  });


// // Get all users
// userRoutes.get('/userdata', async (req, res) => {
//   try {
//     const userdata = await userModel.find({});
//     // res.json({ userdata });
//     res.send(userdata)
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error});
//   }
//   });
  

  // Delete a USER
  userRoutes.delete('/userdata/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      
      const deletedUser = await userModel.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ success: true, message: 'User Deleted Successfully' });
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error});
    }
  });



  // Update a user
  userRoutes.put('/updateuser/:id',upload.single('profile'), async (req, res) => {
    // console.log(req.body)
    // console.log(req.file)
    const { updateusername, updateuseremail, updatecountrycode, updateuserphone } = req.body;

    try {
      const userId = req.params.id;
      console.log(userId)
      let updatedUser;

      if (!req.file) {
        const user = {username: updateusername, useremail: updateuseremail,countrycode: updatecountrycode, userphone: updateuserphone}
        updatedUser =  await userModel.findByIdAndUpdate(userId, user, {new:true})
      }
      else{
        console.log(req.file.filename)
        const user = {profile: req.file.filename ,username: updateusername, useremail: updateuseremail,countrycode: updatecountrycode, userphone: updateuserphone}
        updatedUser =  await userModel.findByIdAndUpdate(userId, user, {new:true})
      }

      res.json({ success: true, message: "User Updated Successfully" ,updatedUser});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "User Already Exists" });
    }
  });


  // Search users
  userRoutes.get('/usersearch', async (req, res) => {
    try {
      const query = req.query;
      console.log(query)

      const searchData = {
        $or: [
          { username: { $regex: query.query, $options: 'i' } },
          { userphone: { $regex: query.query, $options: 'i' } },
          { useremail: { $regex: query.query, $options: 'i' } },
        ],
      };

      // Check if the query is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(query.query)) {
        searchData.$or.push({ _id: query.query });
      }

      const userdata = await userModel.find(searchData);
      // console.log(userdata)
 
      res.json({ success: true, message: 'Data Found', userdata });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error });
    }
  });


  // Get User Data with (pagination)
  userRoutes.get('/userdata', async (req, res) => {
    try {
      const { page, limit } = req.query;
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 5;

      const totalUsers = await userModel.countDocuments({});
      const totalPages = Math.ceil(totalUsers / limitNumber);

      const userdata = await userModel
        .find({})
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
        
        console.log(userdata)
        res.json({
          success: true,
        message: 'Users Retrieved Successfully',
        page: pageNumber,
        limit: limitNumber,
        totalPages: totalPages,
        userdata: userdata
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error });
    }
  });





//   // Search users with sorting
// userRoutes.get('/usersearch', async (req, res) => {
//   try {
//     const query = req.query;
//     const { sortColumn, sortOrder } = req.query;
//     console.log(query);

//     const searchData = {
//       $or: [
//         { username: { $regex: query.query, $options: 'i' } },
//         { userphone: { $regex: query.query, $options: 'i' } },
//         { useremail: { $regex: query.query, $options: 'i' } },
//       ],
//     };

//     // Check if the query is a valid ObjectId
//     if (mongoose.Types.ObjectId.isValid(query.query)) {
//       searchData.$or.push({ _id: query.query });
//     }

//     const sortObject = {};
//     sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;

//     const userdata = await userModel
//       .find(searchData)
//       .sort(sortObject);

//     res.json({ success: true, message: 'Data Found', userdata });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error });
//   }
// });

// // Get User Data with pagination and sorting
// userRoutes.get('/userdata', async (req, res) => {
//   try {
//     const { page, limit, sortColumn, sortOrder } = req.query;
//     const pageNumber = parseInt(page) || 1;
//     const limitNumber = parseInt(limit) || 5;

//     const totalUsers = await userModel.countDocuments({});
//     const totalPages = Math.ceil(totalUsers / limitNumber);

//     const sortObject = {};
//     sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;

//     const userdata = await userModel
//       .find({})
//       .sort(sortObject)
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     console.log(userdata);
//     res.json({
//       success: true,
//       message: 'Users Retrieved Successfully',
//       page: pageNumber,
//       limit: limitNumber,
//       totalPages: totalPages,
//       userdata: userdata,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error });
//   }
// });


module.exports = userRoutes;


