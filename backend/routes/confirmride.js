const express = require('express');
const confirmRideRouter = new express.Router();
const createRideModel = require('../models/createride');


// ------------------------------GET RIDE DATA-----------------------------------------//
confirmRideRouter.get('/ridedata', async (req, res) => {
    try {
      const rides = await createRideModel.find()
      res.send(rides)
    } catch (error) {
      res.status(500).send(error)
    }
  })

// ------------------------------GET RIDE DATA BY ID-----------------------------------------//

module.exports = confirmRideRouter;