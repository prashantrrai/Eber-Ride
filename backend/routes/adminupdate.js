const express = require("express");
const updateRoutes = express.Router() 
const signup_data = require("../models/login"); 
const bcrypt = require('bcryptjs');
const session = require('express-session');


updateRoutes.use(session({
  secret: 'my-session-key',
  resave: false,
  saveUninitialized: true
}));



//  API to update data of user in database using Angular form.
updateRoutes.put('/update/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the user is authenticated using session data
        if (!req.session.token) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        await signup_data.findByIdAndUpdate(userId, {
          adminName: req.body.adminName,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)), // Hashing the password
        })
  
      res.json({ success: true, message: "User Updated Successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "User Not Updated" });
    }
  });


module.exports = updateRoutes;

