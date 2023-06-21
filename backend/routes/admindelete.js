const express = require("express");
const deleteRoutes = express.Router()  
const signup_data = require("../models/login"); 
const session = require('express-session');


deleteRoutes.use(session({
  secret: 'my-session-key',
  resave: false,
  saveUninitialized: true
}));






deleteRoutes.delete('/logindata/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if the user is authenticated using session data
      if (!req.session.token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const deletedUser = await signup_data.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
      console.log("User Deleted")
      
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  module.exports = deleteRoutes;



