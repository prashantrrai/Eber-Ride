const express = require("express");
const Routes = express.Router() 
const signup_data = require("../models/login_signup");       //required signup data model or schema from model.js file
const authenticateToken = require("../middleware/auth");      //required authentication middleware from auth.js file which is a custom middleware file





// To show API is Working in backend on http://localhost:4000.

Routes.get('/', async (req, res) => {
  res.json({Message: 'Hello, API is Working', Switch:`http:localhost:4000/logindata`})
  // res.send("API is working")
})





//to fetch data from database of registered user and show in /admin route of frontend after middleware authentication.

Routes.get('/logindata', authenticateToken, async (req, res) => {
  try {
    const data = await signup_data.find({});
    res.json({ token: req.user, data });
    console.log("data is fetched")
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = Routes
