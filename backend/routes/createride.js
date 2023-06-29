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
// createRideRouter.patch('/createRide/:id', async (req, res) => {
//   let id = req.params.id
//   console.log(req.body);
//   const { driverId } = req.body
//   try {
//     const driver = await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
//     if (!driver) {
//       return res.status(404).send({ message: 'Driver not found...' })
//     }
//     await driver.save()
//     const ride = await createRideModel.findByIdAndUpdate(id, req.body, { new: true })
//     // console.log(ride);
//     await ride.save()
//     res.send(ride)
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error)
//   }
// })

//------------------ON CANCELLING RIDE TO BE CONFIRMED | UPDATING DRIVER AND RIDE INFO-----------------------------//
// createRideRouter.patch('/cancelRideToBeComfirmed', async (req, res) => {
//   const id = req.body.id;
//   console.log(req.body);
//   const driverId = req.body.driverId;
//   try {
//     await driverModel.findByIdAndUpdate(driverId, { assign: '0' });
//     const ride = await createRideModel.findByIdAndUpdate(id, { $unset: { driverId: 1 } }, { new: true });
//     await ride.save();
//     res.send(ride)
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error)
//   }
// })



module.exports = createRideRouter