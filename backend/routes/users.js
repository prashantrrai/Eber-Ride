const express = require("express");
const userRoutes = express.Router()
const userModel = require("../models/users");
const multer = require('multer');
const path = require('path')
const profile_path = path.join(__dirname, "../Public/Upload");


  // Multer Code
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(file)
      cb(null, img_path);
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


// Get all users
userRoutes.get('/userdata', async (req, res) => {
  try {
    const userdata = await userModel.find({});
    // res.json({ userdata });
    res.send(userdata)
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error});
  }
  });
  

  
  // // Delete a user
  // userRoutes.delete('/userdata/:id', (req, res) => {
  //   userModel.findByIdAndDelete(req.params.id)
  //     .then(() => res.sendStatus(204))
  //     .catch(err => res.status(500).json({ error: err.message }));
  // });

  // // Update a user
  // userRoutes.put('/updateuser/:id', (req, res) => {
  //     userModel.findByIdAndUpdate(req.params.id, req.body)
  //         .then(() => res.sendStatus(204))
  //         .catch(err => res.status(500).json({ error: err.message }));
  // });


module.exports = userRoutes;


