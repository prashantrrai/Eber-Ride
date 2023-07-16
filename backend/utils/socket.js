const  socketio  = require('socket.io');
const { mongoose } = require('mongoose')
const driverModel = require('../models/driver')
const createrideModel = require("../models/createride")

async function initializeSocket(server) {
    const io = socketio(server, {cors: {origin: ["http://localhost:4200"]}});

    io.on("connection", (socket) => {
        console.log("Socket is Running.");


      // --------------------------------------------------------UPDATE DRIVER STATUS--------------------------------------------------------//
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

      // --------------------------------------------------------UPDATE DRIVER SERVICE TYPE--------------------------------------------------------//
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
        console.log(driverdata , "driverdataresponse");

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
        console.log(data);
        
        try {
          const driver =  await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
          const updatedRide = await  createrideModel.updateMany({ _id: rideId }, { $set: { driverId: driverId, status: 1 } }, { new: true })

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
        

          console.log(alldata);

          io.emit('data', { success: true, message: 'Driver Assigned Successfully.', alldata});
          
        } catch (error) {
            console.log(error);
            io.emit('data', { success: false, message: 'Sorry Driver Not Assigned', error: error.message });
        }
      })


      
      // ------------------------------------------------DRIVER RUNNING REQUEST TABLE-----------------------------------------------//
      socket.on("runningrequest", async() => {

        try {
          // const driverdata = await driverModel.find({ assign: "1" });
          // const ridedata = await createrideModel.find({  driverId: { $exists: true } });

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

            const ridedata = await createrideModel.updateMany({ driverId: data.driverId },  { $unset: { driverId: "" }, $set: { status: 0 } });
            const driverdata = await driverModel.updateMany({ _id: data.driverId }, { $set: { assign: "0" } });
        
        
            io.emit('notrunningdata', { ridedata, driverdata }, { success: true, message: "Running Request Reject Data" });
          } catch (error) {
            console.error(error);
            io.emit('notrunningdata', { success: false, message: "Ride Not Rejected", error: error.message });
          }
        });

      // ------------------------------------------------RIDE ACCEPTED REQUEST TABLE-----------------------------------------------//
      socket.on("acceptrunningreuest", async (data) => {
        console.log(data);
        const driverId = data.driverId;

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
          console.log(rideId);

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
        socket.on("ridehistory", async () => {

          try {

            const aggregationPipeline = [
              {
                $match: {
                  status: { $in: [3, 7] } // Filter by status field values 3 and 7
                } 
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

            const ridesdata = await createrideModel.aggregate(aggregationPipeline).exec()
            console.log(ridesdata);
            io.emit('ridehistorydata', { success: true, message: "Ride History Data Found", ridesdata });

          } catch (error) {
            console.error(error);
            io.emit('ridehistorydata', { success: false, message: "Ride History Data Not Found", error: error.message });
          }
        });



      socket.on("disconnect", () => {
          console.log("client Disconnected");
      });

    
    });
};



module.exports = initializeSocket;