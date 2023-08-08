const express = require("express");
const mongoose = require("mongoose");
const userRoutes = express.Router()
const userModel = require("../models/users");
const multer = require('multer');
const path = require('path');
const profile_path = path.join(__dirname, "../Public/Profile");
const transporter = require("../utils/nodemailer");
const client = require('../utils/twilio')
const stripe = require('stripe')('sk_test_51NZeiUANXK9scyulpxLuZ2UL5HvCqJBALzHeOfXQxDljxeroEWHfM9Gz9ZhdOau5mV9tyHQx36q5g6HcVPAvlXiA00iaZTcfFv')


  //---------------------------------------MULTER CODE FOR IMAGE UPLOAD---------------------------------------//
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log(file)
      cb(null, profile_path);
    },
    
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      // console.log(file)
      let fileName = file.fieldname + '-' + Date.now() + ext;
      req.body.profile = fileName
      // console.log(req.body.profile);
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



  //-----------------------------------------------ADD USER----------------------------------------------//
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
        // console.log(profile);
        newUser = new userModel({ profile: profile, username: username, useremail: useremail, countrycode: countrycode, userphone: userphone });
      }

      await newUser.save()
      console.log("newUser============",newUser)

      const userEmail = newUser.useremail;
      transporter.sendWelcomeEmail(userEmail);

      console.log( `${newUser.countrycode}${newUser.userphone}`);

      // let toPhoneNumber = `${newUser.countrycode}${newUser.userphone}`
      let toPhoneNumber = `+91 7359030960`
      client.sendWelcomeSMS(toPhoneNumber)


      res.status(201).json({ success: true, message: 'User Added Successfully', newUser});

    } catch (error) {
      if(error.keyPattern){
        console.log(error)
        return res.status(500).json({success: false, message: "User Already Exists", error: error.message});
      }
    res.status(500).json({ success: false,  error: error.message});
    }
  });


//-----------------------------------------------GET ALL USERS----------------------------------------------//
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
  

  // ---------------------------------------------DELETE USER----------------------------------------------//
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



  // ---------------------------------------------UPDATE USER----------------------------------------------//
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


  // ---------------------------------------------SEARCH USER----------------------------------------------//
  // userRoutes.get('/usersearch', async (req, res) => {
  //   try {
  //     const query = req.query;
  //     const currentPage = parseInt(query.currentPage) || 1;
  //     const limit = parseInt(query.limit) || 5;
  //     const skip = (currentPage - 1) * limit;
  //     const { sortColumn, sortOrder } = req.query;

  //     console.log(query)

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

  //     const count = await userModel.countDocuments(searchData);
  //     const totalPages = Math.ceil(count / limit);

  //     const sortObject = {};
  //     // sortObject[sortColumn] = sortOrder === 'asc' ? 1 : -1;
  //     sortObject['username'] = 1;

  //     const userdata = await userModel.find(searchData).skip(skip).limit(limit).sort(sortObject);

  //     // console.log(userdata)
 
  //     res.json({ success: true, message: 'User Data found from Search', userdata, totalPages });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ success: false, message: error });
  //   }
  // });


  // ---------------------------------------------GET USER DATA PAGINATION----------------------------------------------//
  // userRoutes.get('/userdata', async (req, res) => {
  //   try {
  //     const { page, limit } = req.query;
  //     const pageNumber = parseInt(page) || 1;
  //     const limitNumber = parseInt(limit) || 5;

  //     const totalUsers = await userModel.countDocuments({});
  //     const totalPages = Math.ceil(totalUsers / limitNumber);

  //     const userdata = await userModel
  //       .find({})
  //       .skip((pageNumber - 1) * limitNumber)
  //       .limit(limitNumber);
        
  //       console.log(userdata)
  //       res.json({
  //         success: true,
  //         message: 'Users Retrieved Successfully',
  //         page: pageNumber,
  //         limit: limitNumber,
  //         totalPages: totalPages,
  //         userdata: userdata
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ success: false, message: error });
  //   }
  // });



// --------------------------------GET USER DATA, SEARCH, PAGINATION, SORT-----------------------------------//
userRoutes.get("/userdata", async (req, res) => {
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let search = req.query.search;
  let sortBy = req.query.sortBy || "username";
  let sortOrder = req.query.sortOrder || "desc";
  let skip = (page - 1) * limit;

  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { useremail: { $regex: search, $options: "i" } },
          { userphone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const count = await userModel.find(query).count();
    let totalPage = Math.ceil(count / limit);

    if (page > totalPage) {
      page = totalPage;
      skip = (page - 1) * limit;
    }

    let sortCriteria = {};

    if (sortBy === "name") {
      sortCriteria = { username: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "email") {
      sortCriteria = { useremail: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy === "phone") {
      sortCriteria = { userphone: sortOrder === "asc" ? 1 : -1 };
    }


    // let userdata = await userModel.find(query).limit(limit).skip(skip).sort({ username : -1, _id: 1 })
    let userdata = await userModel.find(query).limit(limit).skip(skip).sort(sortCriteria)

    res.json({
      success: true,
      message: "Data Found",
      userdata,
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

// ---------------------------GET USER DETAILS FROM PHONE NUMBER----------------------------------//
userRoutes.post('/userdata/number', async (req, res) => {
  const {countrycode, userphone} = req.body;
  // console.log(req.body);
  try {
    const user = await userModel.findOne(req.body)
    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }
    console.log(user)
    res.send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})



//------------------------------------------ADD CARD STRIPE-----------------------------------------// 
userRoutes.post('/addcard/:id', async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const user = await userModel.findById(id);
    // console.log(user.username);

    if (!user.customer_id) {
      const customer = await stripe.customers.create({
        name: user.username,
        email: user.useremail,
      });
      
      user.customer_id = customer.id;
      await user.save();
    }
    console.log(user.customer_id);
    console.log("330",req.body.token.id);



    const card = await stripe.customers.createSource(user.customer_id, {
      source: `${req.body.token.id}`
    });


    console.log("334",card);
    res.status(200).json({success: true, message: "Customer ID Generated Successfully", card});

  }catch (error) {
    console.error(error);
    res.status(400).json({success: false, error: error.message});
  }
});


//------------------------------------------GET CARD STRIPE-----------------------------------------// 
userRoutes.get('/getcard/:id', async (req, res) => {
  console.log("hii");
  // console.log(req.params.id);
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (!user.customer_id) {
      console.log("User does not have a Stripe customer ID")
      return res.status(400).json({ success:true , message: 'User does not have a Stripe customer ID'});
    }
    const customer = await stripe.customers.retrieve(user.customer_id);
    console.log("354", customer);
    const  defaultCardId = customer.default_source;

      console.log("363",defaultCardId);

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.customer_id,
        type: 'card',
      });

    const paymentMethodsData = paymentMethods.data.map((card) => ({
      ...card,
      isdefalut : card.id  == defaultCardId  
    }));
    console.log("374",paymentMethodsData);

    res.status(200).json({ success:true , paymentMethodsData});
  } catch (error) {
      console.error(error);
      res.status(400).json({ success:false ,  message: 'Failed to retrieve card details', error: error.message });
    }
});


//------------------------------------------DELETE CARD STRIPE-----------------------------------------// 
  userRoutes.delete('/deletecard/:id', async (req, res) => {
    try {
      const deletedCard = await stripe.paymentMethods.detach(req.params.id);
      res.status(200).json({success:true ,  message: 'Card Deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error });
    }
  });



//------------------------------------------UPDATE CARD STRIPE-----------------------------------------// 
  userRoutes.patch('/setdefaultcard/:customerId', async (req, res) => {

    try {
      const cardId = req.body.cardId;
      const customerId = req.params.customerId;
      console.log(cardId);
      await stripe.customers.update(customerId, {
        default_source: cardId
      });
  
      res.status(200).json({ message: 'Default card set successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to set default card' });
    }
  });

module.exports = userRoutes;


