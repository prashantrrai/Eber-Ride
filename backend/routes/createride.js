const express = require('express');
const createRideModel = require("../models/createride");
const driverModel = require('../models/driver')
const createRideRouter = new express.Router();

// ------------------------------CREATE RIDE---------------------------------------------//
createRideRouter.post('/addride', async (req, res) => {
  console.log(req.body);
  try {
    const ride = new createRideModel(req.body)
    await ride.save()
    res.send(ride)
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})

//-------------------------------UPDATE RIDE---------------------------------------------//
createRideRouter.patch('/createRide/:id', async (req, res) => {
  let id = req.params.id
  console.log(req.body);
  const { driverId } = req.body
  try {
    const driver = await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
    if (!driver) {
      return res.status(404).send({ message: 'Driver not found...' })
    }
    await driver.save()
    const ride = await createRideModel.findByIdAndUpdate(id, req.body, { new: true })
    // console.log(ride);
    await ride.save()
    res.send(ride)
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})

// On cancelling ride to be confirm updating driver and ride info
createRideRouter.patch('/cancelRideToBeComfirmed', async (req, res) => {
  const id = req.body.id;
  console.log(req.body);
  const driverId = req.body.driverId;
  try {
    await driverModel.findByIdAndUpdate(driverId, { assign: '0' });
    const ride = await createRideModel.findByIdAndUpdate(id, { $unset: { driverId: 1 } }, { new: true });
    await ride.save();
    res.send(ride)
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})





createRideRouter.get('/ridesInfo', async (req, res) => {
  try {
    const aggregationPipeline = [

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cityId',
          foreignField: '_id',
          as: 'city'
        }
      },
      {
        $unwind: "$city"
      },
      {
        $lookup: {
          from: 'newvehiclepricings',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleId'
        }
      },
      {
        $unwind: "$vehicleId"
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId.vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      {
        $unwind: "$vehicle"
      },
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driver"
        }
      },
      {
        $unwind: {
          path: "$driver",
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

module.exports = createRideRouter