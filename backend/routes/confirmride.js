const express = require("express");
const confirmRideRouter = new express.Router();
const createRideModel = require("../models/createride");
const driverModel = require("../models/driver");
const mongoose = require("mongoose");

// ------------------------------GET RIDE DATA-----------------------------------------//
// confirmRideRouter.get('/ridedata', async (req, res) => {
//     try {
//       const rides = await createRideModel.find()
//       res.send(rides)
//     } catch (error) {
//       res.status(500).send(error)
//     }
//   })

// --------------------------------------------GET CONFIRM-RIDE DATA---------------------------------------------//
confirmRideRouter.post("/ridesinfo", async (req, res) => {
  try {
    // const { search, sortBy, sortOrder, page, limit } = req.body;
    let page = +req.body.page || 1;
    let limit = +req.body.limit || 5;
    let search = req.body.search;
    let statusfilter = req.body.statusfilter;
    let vehiclefilter = req.body.vehiclefilter;
    // let sortBy = req.body.sortBy || "username";
    // let sortOrder = req.body.sortOrder || "desc";
    let skip = (page - 1) * limit;

    console.log(req.body);

    // const  defaultStatus = { status : 0 }
    const matchStage = {};
    if (search) {
      var searchObjectId;
      // const searchRegex = new RegExp(search, 'i');

      if (search.length == 24) {
        searchObjectId = new mongoose.Types.ObjectId(search);
      }

      matchStage.$or = [
        { "userDetails.username": { $regex: search, $options: "i" } },
        { "userDetails.userphone": { $regex: search, $options: "i" } },
        { startLocation: { $regex: search, $options: "i" } },
        { endLocation: { $regex: search, $options: "i" } },
        { _id: searchObjectId },
        { rideDate: { $regex: search, $options: "i" } },
      ];
    }

    const matchCriteria = [];
    console.log("matchcriteria:", matchCriteria);
    console.log(statusfilter);  
    if (statusfilter !== -1) {
      matchCriteria.push({ status: { $in: [statusfilter] } });
      console.log("in status filtyer");
    }else if (statusfilter === -1) {
      matchCriteria.push({ status: { $nin: [3, 7] } });
      console.log("in else status filtyer");
    }
    
    if (vehiclefilter && vehiclefilter.length > 0) {
      matchCriteria.push({ serviceType: { $in: [vehiclefilter] } });
      console.log("in vehicle filtyer");
    }
    
    if (matchCriteria.length === 0) {
      matchCriteria.push({ });
      console.log("in default");
    }
    
    // const sortField = sortBy || 'username';
    // const sortOrderValue = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    // const sortStage = { [sortField]: sortOrderValue };
    // console.log(sortStage);

    const aggregationPipeline = [
      // {
      //   $match: {
      //     $or: [
      //       {
      //         $and: [
      //           { status: { $in: [statusfilter] } },
      //           { serviceType: { $in: [vehiclefilter] } }
      //         ]
      //       },
      //       {
      //         $and: [
      //           { status: { $exists: false } },
      //           { serviceType: { $exists: false } }
      //         ]
      //       }
      //     ]
      //   }
      // },
      {
        $match: {
          $and: matchCriteria,
        },
      },
      {
        $lookup: {
          from: "usermodels",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "citymodels",
          localField: "cityId",
          foreignField: "_id",
          as: "cityDetails",
        },
      },
      { $unwind: "$cityDetails" },
      {
        $lookup: {
          from: "countrymodels",
          localField: "cityDetails.country_id",
          foreignField: "_id",
          as: "countryDetails",
        },
      },
      { $unwind: "$countryDetails" },
      {
        $lookup: {
          from: "vehiclemodels",
          localField: "serviceId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      { $unwind: "$vehicleDetails" },
      {
        $lookup: {
          from: "drivermodels",
          localField: "driverId",
          foreignField: "_id",
          as: "driverDetails",
        },
      },
      {
        $unwind: {
          path: "$driverDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // { $match: matchStage },

      {
        $facet: {
          rides: [
            // { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            // { $project: { _id: 0 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await createRideModel.aggregate(aggregationPipeline).exec();
    console.log(result);
    const rides = result[0]?.rides || [];

    // let newride = [];
    // for(let i=0;i<rides.length;i++){
    //   if(rides[i].status!=3 || rides[i].status!=7){
    //     newride.push(rides[i]);
    //   }
    // }

    const totalCount = result[0]?.totalCount[0]?.count || 0;
    // const totalCount = newride.length || 0;
    // console.log(totalCount);
    const totalPages = Math.ceil(totalCount / limit);

    if (page > totalPages) {
      page = totalPages;
      skip = (page - 1) * limit;
    }

    // console.log(
    //   "count:",totalCount,
    //   "limit:",limit,
    //   "page:",page,
    //   "totalpages:",totalPages);

    // console.log(rides);

    // console.log(newride)
    res.send({ rides, page, limit, totalPages, totalCount });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

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
// confirmRideRouter.delete('/ridesinfo/:rideid', async(req, res) => {
//   const rideid = req.params.rideid
//   console.log(rideid);
//   try {
//     const deletedRidedata = await createRideModel.findByIdAndDelete(rideid);
//     if (!deletedRidedata) {
//       return res.status(404).json({ message: "Ride not found" });
//     }
//     return res.status(200).json({success: true, message: "Ride Deleted Successfully"})

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({success: false, message: error})
//   }
// })

module.exports = confirmRideRouter;
