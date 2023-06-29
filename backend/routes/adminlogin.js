const express = require("express");
const loginRoutes = express.Router()      //imported login routes  from login.js file
const signup_data = require("../models/login");     //required signup data model or schema from model.js file
const bcrypt = require('bcryptjs');           //bcrypt module is used to hash the password
const jwt = require('jsonwebtoken');
require("dotenv").config();         
const jwtSecret = process.env.jwtSecret         //jwt secret key used to verify jwt token stored in env varibales
const session = require('express-session');


loginRoutes.use(session({
  secret: 'my-session-key',
  resave: false,
  saveUninitialized: true
}));


// API to login user using the credentials used in signup.
loginRoutes.post('/login', async (req,res) => {   
    // console.log(req.body);
    
    const { email, password } = req.body;       //object destructuring 
  
        try {
          const user = await signup_data.findOne({ email });
  
          if (!user) {
            return res.status(401).json({ success: false, message: "Authentication Failed. User Not Found." });
          }
          // comparing hashed password stored in the database with the user enetered password from Body.
          const decryptedPassword = bcrypt.compareSync(password, user.password);

          if (!decryptedPassword) {
            return res.status(401).json({ success: false, message: 'Authentication failed. Incorrect password.' });
          }
  
          //when User Authentication successful.
          // Generating a JWT token
          const token = jwt.sign({ email: user.email }, jwtSecret);

          // Store token in session
          req.session.token = token;

          // console.log("Login jwt Token :",token)

          res.json({ success: true, message: "Authentication successful", token });

        } catch (err) {
          console.log(err);
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      });
  
 
module.exports = loginRoutes


