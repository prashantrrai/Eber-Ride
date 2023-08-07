const express = require('express')
const feedbackRoutes = express.Router()
const createrideModel = require("../models/createride");

feedbackRoutes.post('/feedback', async (req,res) => {
    // const { name, email, phone, message } = req.body;
    // console.log("7",req.body);

    try {
      const rideId = req.body.feedbackdata._id;
      const message = req.body.formData.message;

      console.log("13",rideId, message)

      // Check if service already exists
      const feedback = await createrideModel.findByIdAndUpdate(rideId, {$set: {feedback: message}}, {new: true});
        console.log("17", feedback.feedback);
      res.status(200).json({ success: true, message: 'Feedback Submitted Successfully', feedback });

    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = feedbackRoutes;