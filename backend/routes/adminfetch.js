const express = require("express");
const fetchAdmin = express.Router() 
const signup_data = require("../models/login");       //required signup data model or schema from model.js file
const authenticateToken = require("../middleware/auth");      //required authentication middleware from auth.js file which is a custom middleware file











//to fetch data from database of registered user and show in /admin route of frontend after middleware authentication.

fetchAdmin.get('/logindata', authenticateToken, async (req, res) => {
  try {
    const data = await signup_data.find({});
    res.json({ token: req.user, data });

  } 
  catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = fetchAdmin;
