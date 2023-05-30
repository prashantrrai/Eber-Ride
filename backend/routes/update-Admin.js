const express = require("express");
const updateRoutes = express.Router() 
const signup_data = require("../models/login_signup"); 
const bcrypt = require('bcryptjs');



//  API to update data of user in database using Angular form.
updateRoutes.put('/update/:id', async (req, res) => {
    try {
        const userId = req.params.id;
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

