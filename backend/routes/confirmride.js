const express = require('express');
const confirmRideRouter = new express.Router();
const createRideModel = require('../models/createride');
const driverModel = require('../models/driver')
const { mongoose } = require('mongoose')

// ------------------------------GET RIDE DATA-----------------------------------------//
// confirmRideRouter.get('/ridedata', async (req, res) => {
//     try {
//       const rides = await createRideModel.find()
//       res.send(rides)
//     } catch (error) {
//       res.status(500).send(error)
//     }
//   })


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
          from: 'vehiclemodels',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      {
        $unwind: "$vehicleDetails"
      },
      // {
      //   $lookup: {
      //     from: 'vehiclemodels',
      //     localField: 'pricingDetails.service',
      //     foreignField: '_id',
      //     as: 'vehicleDetails'
      //   }
      // },
      // {
      //   $unwind: "$vehicleDetails"
      // },
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
    // console.log(rides);
    res.send(rides)
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})

// // ------------------------------------------------DRIVERS OF PARTICULAR CITY AND SERVICE + STATUS TRUE------------------------------------//
// confirmRideRouter.post('/assigneddriverdata', async (req, res) => {
//   console.log(req.body);
//   try {
//     // const { cityId, serviceId } = req.body;
//     const cityId = new mongoose.Types.ObjectId(req.body.cityId);
//     const serviceId = new mongoose.Types.ObjectId(req.body.serviceId); //vehicle id 
//     // console.log(req.body);
//     // const driverdatta = await driverModel.find({ city: cityId, servicetype: serviceId })
//     // console.log(driverdatta);

//     const aggregationPipeline = [

//       {
//         $lookup: {
//           from: 'citymodels',
//           localField: 'city',
//           foreignField: '_id',
//           as: 'cityDetails'
//         }
//       },
//       {
//         $unwind: "$cityDetails"
//       },
//       {
//         $lookup: {
//           from: 'vehiclemodels',
//           localField: 'servicetype',
//           foreignField: '_id',
//           as: 'serviceDetails'
//         }
//       },
//       {
//         $unwind: "$serviceDetails"
//       },
//       // {
//       //   $match: { 'cityDetails._id': cityId, 'serviceDetails._id': serviceId}
//       // },
//       {
//         $match: {
//           city: cityId,
//           status: true,
//           servicetype: serviceId,
//         },
//       },

//     ];
//     const driverdata = await driverModel.aggregate(aggregationPipeline).exec()
//     res.send(driverdata)
//     console.log(driverdata);
//   } catch (error) {
//       console.log(error);
//       res.status(500).send(error)
//   }
// })


// -----------------------------------------CANCEL RIDE DELETE API---------------------------------------//
confirmRideRouter.delete('/ridesinfo/:rideid', async(req, res) => {
  const rideid = req.params.rideid
  console.log(rideid);
  try {
    const deletedRidedata = await createRideModel.findByIdAndDelete(rideid);
    if (!deletedRidedata) {
      return res.status(404).json({ message: "Ride not found" });
    }
    return res.status(200).json({success: true, message: "Ride Deleted Successfully"})

  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: error})
  }
})


module.exports = confirmRideRouter;