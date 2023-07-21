const  socketio  = require('socket.io');
// const { mongoose } = require('mongoose')
const driverModel = require('../models/driver')
const createrideModel = require("../models/createride")
const mongoose = require("mongoose");
const cron = require('node-cron');
let AssignedDriverData = []


async function initializeSocket(server) {
    const io = socketio(server, {cors: {origin: ["http://localhost:4200"]}});

    io.on("connection", (socket) => {
        console.log("Socket is Running.");


      // --------------------------------------------------------DRIVER STATUS UPDATE --------------------------------------------------------//
      socket.on('driverstatus', async (data) => {
          const { driverId, status } = data;
          // console.log(data)

          try {
              const data = await driverModel.findByIdAndUpdate(driverId, { status },  {new: true});
              io.emit('statusdata', { success: true, data, message: 'Driver Status Updated Successfully.' });
          } 
          catch (error) {
              io.emit('statusdata', { success: false, message: error });
            }
          });


      // --------------------------------------------------------DRIVER SERVICE TYPE UPDATE --------------------------------------------------------//
      socket.on('driverService', async (data) => {
          const { driverId, servicetype } = data;
              console.log(data);

          try {
              const existingService = await driverModel.findByIdAndUpdate(driverId, { servicetype },  {new: true});
              io.emit('servicedata', { success: true, message: 'Service Updated Successfully', existingService });
          } 
          catch (error) {
              io.emit('servicedata', { success: false, message: error });
            }
          });



      // ------------------------------------------------SHOW DRIVER DATA OF PARTICULAR CITY AND SERVICE ,STATUS TRUE------------------------------------//
      socket.on('driverdata', async (data) => {
          // console.log(data , "assigndriverdata");

      try {
        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const serviceId = new mongoose.Types.ObjectId(data.serviceId);

        const aggregationPipeline = [
          {
            $lookup: {
              from: 'citymodels',
              localField: 'city',
              foreignField: '_id',
              as: 'cityDetails'
            }
          },
          {
            $unwind: "$cityDetails"
          },
          {
            $lookup: {
              from: 'vehiclemodels',
              localField: 'servicetype',
              foreignField: '_id',
              as: 'serviceDetails'
            }
          },
          {
            $unwind: {path:"$serviceDetails",
            preserveNullAndEmptyArrays: true}
          },
          {
            $match: {
                city: cityId,
                servicetype: serviceId,
                status: true,
                assign: "0"
              },
          },
    
        ];
        const driverdata = await driverModel.aggregate(aggregationPipeline).exec()
        // console.log(driverdata , "driverdataresponse");

        io.emit('driverdata', driverdata , {success: true, message: "Driver Data Patched in Assign Dialog Box", driverdata});
        
      } catch (error) { 
          console.log(error);
          io.emit('driverdata', { success: false,  message: "Driver Data Not Patched in Assign Dialog Box", error: error.message });
      }
      })

      // ------------------------------------------------SHOW DRIVER DATA AFTER ASSIGN-----------------------------------------------//
      socket.on("AssignedData", async(data) => {
        const rideId = data.rideId
        const driverId = data.driverId
        // console.log(data);
        try {
          const driver =  await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
          const updatedRide = await  createrideModel.findByIdAndUpdate({ _id: rideId }, { $set: { driverId: driverId, status: 1, assigningTime: Date.now() } }, { new: true })
          // console.log("ndkfnkjnsjkn",updatedRide);

          const alldata = await createrideModel.aggregate([
            {
              $match: {
                _id: updatedRide._id
              }
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
              $unwind: "$driverDetails"
            },
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
       
          ]); 

          // console.log(alldata);

          AssignedDriverData.push(alldata);
          // console.log(AssignedDriverData);

          io.emit('data', { success: true, message: 'Driver Assigned Successfully.', alldata});

        } catch (error) {
            console.log(error);
            io.emit('data', { success: false, message: 'Sorry Driver Not Assigned', error: error.message });
        }
      })


      
      // ------------------------------------------------SHOW DRIVER RUNNING-REQUEST TABLE-----------------------------------------------//
      socket.on("runningrequest", async() => {

        try {

          const alldata = await createrideModel.aggregate([
            {
              $match: {
                status: 1
              }
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
              $unwind: "$driverDetails"
            },
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
          ]);

          // console.log(alldata);

          io.emit('runningdata', {success: true, message: "Running-Request Data", alldata});

        } catch (error) {
          console.error(error);
          io.emit('runningdata', { success: false, message: "Error retrieving data" , error: error.message});
        }

      })


      // ------------------------------------------------RIDE REJECTED REQUEST TABLE-----------------------------------------------//
        socket.on("Rejectrunningrequest", async (data) => {
          // const driverId = data.driverId;
          // console.log(data);
          // console.log(data.driverId);

          try {

            const ridedata = await createrideModel.updateMany({ driverId: data.driverId },  { $unset: { driverId: "" , assigningTime: ""}, $set: { status: 0 } });
            const driverdata = await driverModel.updateMany({ _id: data.driverId }, { $set: { assign: "0" } });
        
        
            io.emit('notrunningdata', { ridedata, driverdata }, { success: true, message: "Running Request Reject Data" });
          } catch (error) {
            console.error(error);
            io.emit('notrunningdata', { success: false, message: "Ride Not Rejected", error: error.message });
          }
        });

      // ------------------------------------------------RIDE ACCEPTED REQUEST TABLE-----------------------------------------------//
      socket.on("acceptrunningreuest", async (data) => {
        // console.log(data);
        // const driverId = data.driverId;

        try {

          const ridedata = await createrideModel.updateMany({ driverId: data.driverId },  { $set: { status: 7 } });
          const driverdata = await driverModel.updateMany({ _id: data.driverId }, { $set: { assign: "0" } });
          // console.log(ridedata, driverdata);
      
          io.emit('acceptedrunningrequestdata', { ridedata, driverdata }, { success: true, message: "Ride Request Accepted" });
        } catch (error) {
          console.error(error);
          io.emit('acceptedrunningrequestdata', { success: false, message: "Ride Not Accepted", error: error.message });
        }
      });

      
        // ------------------------------------------------RIDE CANCEL CONFIRM-RIDE TABLE-----------------------------------------------//
        socket.on("cancelride", async (rideId) => {
          // console.log(rideId);

          try {

            const ridedata = await createrideModel.findByIdAndUpdate({ _id: rideId }, { status: 3 } , { new: true });
            // console.log(ridedata);
            io.emit('cancelridedata', { success: true, message: "Ride Cancelled Successfully", ridedata });

          } catch (error) {
            console.error(error);
            io.emit('cancelridedata', { success: false, message: "Ride Not Cancelled", error: error.message });
          }
        });


        // ------------------------------------------------GET DATA in RIDE-HISTORY TABLE-----------------------------------------------//
        socket.on("ridehistory", async (filterdata) => {

          try {

            let page = +filterdata.page || 1;
            let limit = +filterdata.limit || 5;
            let paymentFilter = filterdata.payment;
            let fromdate = filterdata.fromdate;
            let todate = filterdata.todate;
            let startLocationSearch = filterdata.startlocationsearch;
            let endLocationSearch = filterdata.endlocationsearch;
            let statusfilter = +filterdata.status;
            let skip = (page - 1) * limit;

            // console.log(filterdata);


            const matchCriteria = [];
            
            if (statusfilter !== -1) {
              matchCriteria.push({ status: { $in: [statusfilter] } });
            }else if (statusfilter === -1) {
              matchCriteria.push({ status: { $nin: [1,2,4,5,6] } });
            }

            if (paymentFilter !== '') {
              matchCriteria.push({ paymentOption: paymentFilter });
            }



            if (startLocationSearch || endLocationSearch) {
              const matchStage = {};
            
              if (startLocationSearch && endLocationSearch) {
                matchStage.$and = [
                  { startLocation: { $regex: startLocationSearch, $options: "i" } },
                  { endLocation: { $regex: endLocationSearch, $options: "i" } }
                ];
              } else if (startLocationSearch) {
                matchStage.startLocation = { $regex: startLocationSearch, $options: "i" };
              } else if (endLocationSearch) {
                matchStage.endLocation = { $regex: endLocationSearch, $options: "i" };
              }
            
              matchCriteria.push(matchStage);
            }

            // Date range filter logic
            if (fromdate && todate) {
            
              matchCriteria.push({
                rideDate: {
                  $gte: fromdate,
                  $lte: todate
                }
              });
            }
            // console.log(matchCriteria);

            if (matchCriteria.length === 0) {
              matchCriteria.push({});
            }
            
 
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
              },
              {
                $match: {
                  $and: [
                    ...matchCriteria,
                    // matchStage,
                    {
                      status: { $in: [3, 7] }
                    }
                  ]
                },
              },
        
              {
                $facet: {
                  ridehistory: [
                    { $skip: skip },
                    { $limit: limit },
                  ],
                  totalCount: [{ $count: "count" }],
                },
              },
            ];

            const ridesdata = await createrideModel.aggregate(aggregationPipeline).exec()
            // console.log(ridesdata);
            const myridehistory = ridesdata[0]?.ridehistory || [];
            // console.log(myridehistory);

            const totalCount = ridesdata[0]?.totalCount[0]?.count || 0;
            const totalPages = Math.ceil(totalCount / limit);
        
            if (page > totalPages) {
              page = totalPages;
              skip = (page - 1) * limit;
            }
        
            io.emit('ridehistorydata', { success: true, message: "Ride History Data Found", myridehistory, page, limit, totalPages, totalCount });

          } catch (error) {
            console.error(error);
            io.emit('ridehistorydata', { success: false, message: "Ride History Data Not Found", error: error.message });
          }
        });

        
        
        socket.on("disconnect", () => {
          console.log("client Disconnected");
        });
        
        
      });

      
      // let previousRideData = null;

      cron.schedule(" * * * * *", async () => {
        await myTask();
      });


      async function myTask() {
        try {

          for (let data of AssignedDriverData) {
            console.log(data);

            let currenttime = Date.now()
            let assignedTime = Date.now()
            let updatedTime = assignedTime - 5000;
            ridetimeout = currenttime - updatedTime


            // if (ridetimeout <= 10000) {
            //   const ridenewdata = await createrideModel.updateMany({},  { $unset: { driverId: "" , assigningTime: ""}, $set: { status: 0 } })
            //   const drivernewdata = await driverModel.updateMany({}, { $set: { assign: "0" } })

            //   console.log("hii");
            // }
          }
        } catch (error) {
          console.error("Error in myTask:", error);
        }
      };

}

// i want to use findquery inside this cron to check any update if in my db, like if my driver is assigned then its assign field value will change from 0 to 1 and by detecting that change through find query I want to send the request to driver in running request compoennt where driver have option to accept or reject ride if no resposne within a particular time interval by driver then timeout will happen and ride will be again send to confirm ride component by changing the status field value  from 1 to 0 and by also setting the drievrId to null and changing driver collection also setting the assign field value from now 1 to 0 again to make the driver free again


module.exports = initializeSocket;