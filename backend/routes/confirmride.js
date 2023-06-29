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


// --------------------------------------------RIDE INFO---------------------------------------------//
confirmRideRouter.get('/ridesinfo', async (req, res) => {
  try {
    const aggregationPipeline = [

      {
        $lookup: {
          from: 'usermodels',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $lookup: {
          from: 'citymodels',
          localField: 'cityId',
          foreignField: '_id',
          as: 'cityDetails'
        }
      },
      {
        $unwind: "$cityDetails"
      },
      {
        $lookup: {
          from: 'countrymodels',
          localField: 'cityDetails.country_id',
          foreignField: '_id',
          as: 'countryDetails'
        }
      },
      {
        $unwind: "$countryDetails"
      },
      {
        $lookup: {
          from: 'pricingmodels',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'pricingDetails'
        }
      },
      {
        $unwind: "$pricingDetails"
      },
      {
        $lookup: {
          from: 'vehiclemodels',
          localField: 'pricingDetails.service',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      {
        $unwind: "$vehicleDetails"
      },
      {
        $lookup: {
          from: "drivermodels",
          localField: "driverId",
          foreignField: "_id",
          as: "driverDetails"
        }
      },
      {
        $unwind: {
          path: "$driverDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    // const rides = await CreateRide.find().populate('userId', ['name', 'profile']).populate('cityId', 'city').populate({ path: 'vehicleId', populate: { path: 'vehicleId', select: 'vehicleType' } }).populate('driverId')
    const rides = await createRideModel.aggregate(aggregationPipeline).exec()
    res.send(rides)
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})

module.exports = confirmRideRouter;