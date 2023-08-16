const express = require("express");
const registerRoutes = express.Router()
const adminModel = require("../models/login");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const jwtSecret = process.env.jwtSecret         //jwt secret key used to verify jwt token stored in env varibales
const session = require('express-session');


registerRoutes.use(session({
  secret: 'my-session-key',
  resave: false,
  saveUninitialized: true
}));


//  API to register data of user in database using Angular form.
registerRoutes.post('/register', async (req, res) => {
  console.log(req.body);

  // const { adminName, email, password, cnfpassword } = req.body;

  const user = new adminModel({
    adminName: req.body.adminName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)), // Hashing the password
    cnfpassword: req.body.cnfpassword,
  })
  await user.save()
    .then(() => {
      // Generate a JWT token
      const token = jwt.sign({ email: user.email }, jwtSecret);

      // Store token in session
      req.session.token = token;

      console.log("Registration jwt Token :", token)
      res.json({ success: true, message: "Account has been created", token })

    })
    .catch((err) => {
      console.log(err);
      if (err.keyPattern) {
        console.log("User Already Exists")
        return res.status(500).json({ success: false, message: "User Already Exists" });
      }
      res.status(500).json({ success: false, message: err });
    })

})

module.exports = registerRoutes;


