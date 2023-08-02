const socketio = require("socket.io");
require("dotenv").config();
const RideTimeOut = process.env.RIDETIMEOUT;
// console.log(RideTimeOut);
const mongoose = require("mongoose");
const driverModel = require("../models/driver");
const createrideModel = require("../models/createride");
const userModel = require('../models/users')
const cron = require("node-cron");
let AssignedDriverData = [];
const transporter = require("./nodemailer");
const client = require('./twilio')
let notificationCounter = 0;
const stripe = require('stripe')(process.env.STRIPE_Secret_key)



async function initializeSocket(server) {

  const io = socketio(server, { cors: { origin: ["http://localhost:4200"] } });

  io.on("connection", (socket) => {
    console.log("Socket is Running.");


    //--------------------------------------------------------DRIVER STATUS UPDATE --------------------------------------------------------//
    socket.on("driverstatus", async (data) => {
      const { driverId, status } = data;
      // console.log(data)

      try {
        const data = await driverModel.findByIdAndUpdate(
          driverId,
          { status },
          { new: true }
        );
        io.emit("statusdata", {
          success: true,
          data,
          message: "Driver Status Updated Successfully.",
        });
      } catch (error) {
        io.emit("statusdata", { success: false, message: error });
      }
    });

    //--------------------------------------------------------DRIVER SERVICE TYPE UPDATE --------------------------------------------------------//
    socket.on("driverService", async (data) => {
      const { driverId, servicetype } = data;
      console.log(data);

      try {
        const existingService = await driverModel.findByIdAndUpdate(
          driverId,
          { servicetype },
          { new: true }
        );
        io.emit("servicedata", {
          success: true,
          message: "Service Updated Successfully",
          existingService,
        });
      } catch (error) {
        io.emit("servicedata", { success: false, message: error });
      }
    });

    //------------------------------------------------SHOW DRIVER DATA OF PARTICULAR CITY AND SERVICE ,STATUS TRUE------------------------------------//
    socket.on("showdriverdata", async (data) => {
      // console.log("70",data);

      try {
        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const serviceId = new mongoose.Types.ObjectId(data.serviceId);
        // console.log(data.cityId, serviceId);

        const aggregationPipeline = [
          {
            $lookup: {
              from: "citymodels",
              localField: "city",
              foreignField: "_id",
              as: "cityDetails",
            },
          },
          {
            $unwind: "$cityDetails",
          },
          {
            $lookup: {
              from: "vehiclemodels",
              localField: "servicetype",
              foreignField: "_id",
              as: "serviceDetails",
            },
          },
          {
            $unwind: {
              path: "$serviceDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              city: cityId,
              servicetype: serviceId,
              status: true,
              assign: "0",
            },
          },
        ];
        const driverdata = await driverModel
          .aggregate(aggregationPipeline)
          .exec();
        // console.log( "driverdataresponse", driverdata);

        io.emit("availabledriverdata", driverdata, {
          success: true,
          message: "Driver Data Patched in Assign Dialog Box",
          driverdata,
        });
      } catch (error) {
        console.log(error);
        io.emit("availabledriverdata", {
          success: false,
          message: "Driver Data Not Patched in Assign Dialog Box",
          error: error.message,
        });
      }
    });

    //------------------------------------------------SHOW DRIVER DATA AFTER ASSIGN-----------------------------------------------//
    socket.on("AssignedData", async (data) => {
      const rideId = data.rideId;
      const driverId = data.driverId;
      // console.log(data);
      try {
        const driver = await driverModel.findByIdAndUpdate(
          driverId,
          { assign: "1" },
          { new: true }
        );
        // await driver.save()
        const updatedRide = await createrideModel.findByIdAndUpdate(
          { _id: rideId },
          {
            $set: { driverId: driverId, ridestatus: 1, assigningTime: Date.now() },
          },
          { new: true }
        );

        const alldata = await createrideModel.aggregate([
          {
            $match: {
              _id: updatedRide._id,
            },
          },
          {
            $lookup: {
              from: "drivermodels",
              localField: "driverId",
              foreignField: "_id",
              as: "driverDetails",
            },
          },
          {
            $unwind: "$driverDetails",
          },
          {
            $lookup: {
              from: "usermodels",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails",
          },
          {
            $lookup: {
              from: "citymodels",
              localField: "cityId",
              foreignField: "_id",
              as: "cityDetails",
            },
          },
          {
            $unwind: "$cityDetails",
          },
          {
            $lookup: {
              from: "countrymodels",
              localField: "cityDetails.country_id",
              foreignField: "_id",
              as: "countryDetails",
            },
          },
          {
            $unwind: "$countryDetails",
          },
          {
            $lookup: {
              from: "vehiclemodels",
              localField: "serviceId",
              foreignField: "_id",
              as: "vehicleDetails",
            },
          },
          {
            $unwind: "$vehicleDetails",
          },
        ]);

        // console.log(alldata);

        // AssignedDriverData.push(alldata);
        // console.log(AssignedDriverData);

        io.emit("newdata", {
          success: true,
          message: "Driver Assigned Successfully.",
          alldata,
        });
      } catch (error) {
        console.log(error);
        io.emit("newdata", {
          success: false,
          message: "Sorry Driver Not Assigned",
          error: error.message,
        });
      }
    });

    // ------------------------------------------------SHOW NEAREST DRIVER ASSIGN-----------------------------------------------//
    socket.on("nearestdata", async (data) => {
      const rideId = data.rideId;
      const cityId = new mongoose.Types.ObjectId(data.cityId);
      const serviceId = new mongoose.Types.ObjectId(data.serviceId);
      // console.log("196", data);

      try {


        const driverdata = await driverModel.find({ status: true, city: data.cityId, servicetype: data.serviceId });
        let driverIdToAdd;
        let updatedRide

        if (driverdata.length > 0) {
          driverIdToAdd = driverdata[0]._id;

          updatedRide = await createrideModel.findByIdAndUpdate(
            { _id: rideId },
            {
              $addToSet: { nearestArray: driverIdToAdd },
              $set: { driverId: driverIdToAdd, ridestatus: 1, assigningTime: Date.now(), nearest: true }
            },
            { new: true }
          );
        

          // console.log("Updated nearestArray:", updatedRide);
        } else {
          console.log("No driver found for the given criteria.");
        }

        const updateddriver =  await driverModel.findByIdAndUpdate(driverdata[0]._id, { assign: "1" }, { new: true });


        const alldata = await createrideModel.aggregate([
          {
            $match: {
              _id: updatedRide._id,
            },
          },
          {
            $lookup: {
              from: "drivermodels",
              localField: "driverId",
              foreignField: "_id",
              as: "driverDetails",
            },
          },
          {
            $unwind: "$driverDetails",
          },
          {
            $lookup: {
              from: "usermodels",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails",
          },
          {
            $lookup: {
              from: "citymodels",
              localField: "cityId",
              foreignField: "_id",
              as: "cityDetails",
            },
          },
          {
            $unwind: "$cityDetails",
          },
          {
            $lookup: {
              from: "countrymodels",
              localField: "cityDetails.country_id",
              foreignField: "_id",
              as: "countryDetails",
            },
          },
          {
            $unwind: "$countryDetails",
          },
          {
            $lookup: {
              from: "vehiclemodels",
              localField: "serviceId",
              foreignField: "_id",
              as: "vehicleDetails",
            },
          },
          {
            $unwind: "$vehicleDetails",
          },
        ]);

  

        io.emit("datanearest", {
          success: true,
          message: "Nearest Driver Assigned Successfully.",
          alldata,
        });
      } catch (error) {
        console.log(error);
        io.emit("datanearest", {
          success: false,
          message: "Sorry Nearest Driver Not Assigned",
          error: error.message,
        });
      }
    });

    // ------------------------------------------------SHOW DRIVER RUNNING-REQUEST TABLE-----------------------------------------------//
    socket.on("runningrequest", async () => {
      try {
        const alldata = await createrideModel.aggregate([
          {
            $match: {
              ridestatus: 1,
            },
          },
          {
            $lookup: {
              from: "drivermodels",
              localField: "driverId",
              foreignField: "_id",
              as: "driverDetails",
            },
          },
          {
            $unwind: "$driverDetails",
          },
          {
            $lookup: {
              from: "usermodels",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails",
          },
          {
            $lookup: {
              from: "citymodels",
              localField: "cityId",
              foreignField: "_id",
              as: "cityDetails",
            },
          },
          {
            $unwind: "$cityDetails",
          },
          {
            $lookup: {
              from: "countrymodels",
              localField: "cityDetails.country_id",
              foreignField: "_id",
              as: "countryDetails",
            },
          },
          {
            $unwind: "$countryDetails",
          },
          {
            $lookup: {
              from: "vehiclemodels",
              localField: "serviceId",
              foreignField: "_id",
              as: "vehicleDetails",
            },
          },
          {
            $unwind: "$vehicleDetails",
          },
        ]);

        // console.log(alldata);

        io.emit("runningdata", {
          success: true,
          message: "Running-Request Data",
          alldata,
        });
      } catch (error) {
        console.error(error);
        io.emit("runningdata", {
          success: false,
          message: "Error retrieving data",
          error: error.message,
        });
      }
    });

    // ------------------------------------------------RIDE REJECTED REQUEST TABLE-----------------------------------------------//
    socket.on("Rejectrunningrequest", async (data) => {
      // const driverId = data.driverId;
      // console.log(data);
      // console.log(data.driverId);

      try {
        const ridedata = await createrideModel.updateMany(
          { driverId: data.driverId },
          { $unset: { driverId: "", assigningTime: "" }, $set: { ridestatus: 0 } }
        );
        const driverdata = await driverModel.updateMany(
          { _id: data.driverId },
          { $set: { assign: "0" } }
        );

        io.emit(
          "runningrequestreject",
          { ridedata, driverdata },
          { success: true, message: "Running Request Rejected" }
        );
      } catch (error) {
        console.error(error);
        io.emit("runningrequestreject", {
          success: false,
          message: "Ride Not Rejected",
          error: error.message,
        });
      }
    });

    // ------------------------------------------------RIDE ACCEPTED REQUEST TABLE-----------------------------------------------//
    socket.on("acceptrunningreuest", async (data) => {
      // console.log(data);
      // const driverId = data.driverId;

      try {
        const ridedata = await createrideModel.findByIdAndUpdate( data.rideId , { $set: { ridestatus: 7 }},{ new: true } );
        const driverdata = await driverModel.findByIdAndUpdate(data.driverId , { $set: { assign: "0" } }, {new: true});
        // console.log(ridedata.userId);
        const userdata = await userModel.findById(ridedata.userId)

        // console.log(userdata);

        const tripDetails = {ridedata, driverdata, userdata};

        // console.log(tripDetails);

        const userEmail = userdata.useremail;
        transporter.sendRideStatus(userEmail, tripDetails);

        transporter.sendInvoiceEmail(userEmail, tripDetails)

        // let toPhoneNumber = `${driverdata.countrycode}${driverdata.driverphone}`
        let toPhoneNumber = `+91 73590 30960`
        let status  = ridedata.ridestatus
        client.sendRideSMS(toPhoneNumber, status)

        //-------------------STRIPE PAYMENT CUT------------------------//
        exchangeRate = 82.28
        const customer = await stripe.customers.retrieve(userdata.customer_id);
        // console.log("485",customer );
        const defaultCardId = customer.default_source;
        // console.log("487",defaultCardId);

        const estimatePriceUSD = ridedata.estimateFare / exchangeRate;
        const amountInCents = Math.round(estimatePriceUSD * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          customer: userdata.customer_id,
          // payment_method: "Card",
          off_session: true,
          confirm: true
        });
        // console.log("487", paymentIntent);

        io.emit("runningrequestaccept",{ ridedata, driverdata }, { success: true, message: "Ride Request Accepted" } );


      } catch (error) {
        console.error(error);
        io.emit("runningrequestaccept", {
          success: false,
          message: "Ride Not Accepted",
          error: error.message,
        });
      }
    });

    // socket.on("acceptrunningreuest", async (data) => {
    //   // console.log(data);
    //   // const driverId = data.driverId;

    //   try {

    //     const statuswaladata = await createrideModel.find({driverId: data.driverId});
    //     const statusval = statuswaladata.map((data) => data.status);

    //     console.log(statusval[0]);

    //     let ridedata;
    //     let driverdata;

    //     if(statusval[0] == 1){
    //        ridedata = await createrideModel.findByIdAndUpdate({ driverId: data.driverId },  { $set: { status: 4 } });
    //     }
    //     else if(data.status == 4){
    //        ridedata = await createrideModel.findByIdAndUpdate({ driverId: data.driverId },  { $set: { status: 5 } });

    //     }
    //     else if(data.status == 5){
    //        ridedata = await createrideModel.findByIdAndUpdate({ driverId: data.driverId },  { $set: { status: 6 } });

    //     }
    //     else if(data.status == 6){
    //        ridedata = await createrideModel.findByIdAndUpdate({ driverId: data.driverId },  { $set: { status: 7 } });
    //        driverdata = await driverModel.findByIdAndUpdate({ _id: data.driverId }, { $set: { assign: "0" } });
    //       // console.log(ridedata, driverdata);

    //     }

    //     io.emit('acceptedrunningrequestdata', { ridedata, driverdata }, { success: true, message: "Ride Request Accepted" });
    //   } catch (error) {
    //     console.error(error);
    //     io.emit('acceptedrunningrequestdata', { success: false, message: "Ride Not Accepted", error: error.message });
    //   }
    // });

    // ------------------------------------------------RIDE CANCEL CONFIRM-RIDE TABLE-----------------------------------------------//
    socket.on("cancelride", async (rideId) => {
      // console.log(rideId);

      try {
        const ridedata = await createrideModel.findByIdAndUpdate(
          { _id: rideId },
          { ridestatus: 3 },
          { new: true }
        );
        // console.log(ridedata);
        io.emit("cancelridedata", {
          success: true,
          message: "Ride Cancelled Successfully",
          ridedata,
        });
      } catch (error) {
        console.error(error);
        io.emit("cancelridedata", {
          success: false,
          message: "Ride Not Cancelled",
          error: error.message,
        });
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
          matchCriteria.push({ ridestatus: { $in: [statusfilter] } });
        } else if (statusfilter === -1) {
          matchCriteria.push({ ridestatus: { $nin: [1, 2, 4, 5, 6] } });
        }

        if (paymentFilter !== "") {
          matchCriteria.push({ paymentOption: paymentFilter });
        }

        if (startLocationSearch || endLocationSearch) {
          const matchStage = {};

          if (startLocationSearch && endLocationSearch) {
            matchStage.$and = [
              { startLocation: { $regex: startLocationSearch, $options: "i" } },
              { endLocation: { $regex: endLocationSearch, $options: "i" } },
            ];
          } else if (startLocationSearch) {
            matchStage.startLocation = {
              $regex: startLocationSearch,
              $options: "i",
            };
          } else if (endLocationSearch) {
            matchStage.endLocation = {
              $regex: endLocationSearch,
              $options: "i",
            };
          }

          matchCriteria.push(matchStage);
        }

        // Date range filter logic
        if (fromdate && todate) {
          matchCriteria.push({
            rideDate: {
              $gte: fromdate,
              $lte: todate,
            },
          });
        }
        // console.log(matchCriteria);

        if (matchCriteria.length === 0) {
          matchCriteria.push({});
        }

        const aggregationPipeline = [
          {
            $lookup: {
              from: "usermodels",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails",
          },
          {
            $lookup: {
              from: "citymodels",
              localField: "cityId",
              foreignField: "_id",
              as: "cityDetails",
            },
          },
          {
            $unwind: "$cityDetails",
          },
          {
            $lookup: {
              from: "countrymodels",
              localField: "cityDetails.country_id",
              foreignField: "_id",
              as: "countryDetails",
            },
          },
          {
            $unwind: "$countryDetails",
          },
          {
            $lookup: {
              from: "vehiclemodels",
              localField: "serviceId",
              foreignField: "_id",
              as: "vehicleDetails",
            },
          },
          {
            $unwind: "$vehicleDetails",
          },
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
          {
            $match: {
              $and: [
                ...matchCriteria,
                // matchStage,
                {
                  ridestatus: { $in: [3, 7] },
                },
              ],
            },
          },

          {
            $facet: {
              ridehistory: [{ $skip: skip }, { $limit: limit }],
              totalCount: [{ $count: "count" }],
            },
          },
        ];

        const ridesdata = await createrideModel
          .aggregate(aggregationPipeline)
          .exec();
        // console.log(ridesdata);
        const myridehistory = ridesdata[0]?.ridehistory || [];
        // console.log(myridehistory);

        const totalCount = ridesdata[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        if (page > totalPages) {
          page = totalPages;
          skip = (page - 1) * limit;
        }

        io.emit("ridehistorydata", {
          success: true,
          message: "Ride History Data Found",
          myridehistory,
          page,
          limit,
          totalPages,
          totalCount,
        });
      } catch (error) {
        console.error(error);
        io.emit("ridehistorydata", {
          success: false,
          message: "Ride History Data Not Found",
          error: error.message,
        });
      }
    });






    async function myTask() {
      try {
        const asigningrides = await createrideModel.find({ ridestatus: 1 , nearest: false});
        const nearestridedata = await createrideModel.find({ridestatus: 1, nearest: true});
        // console.log(nearestridedata);
        const driverdata = await driverModel.find({ status: true, city: nearestridedata[0].cityId, servicetype: nearestridedata[0].serviceId, assign: "0"});

        const nearestArray = driverdata.map((driver) => driver._id);
        // console.log(nearestArray);
        console.log("780", nearestArray.length);


        //----------------For Single Assign Driver----------------------//
        if (asigningrides.length > 0) {
          console.log("Hii");
          for (let data of asigningrides) {

            let currenttime = Date.now();
            let assignedTime = data.assigningTime;
            resulttimeout = currenttime / 1000 - assignedTime / 1000;

            if (resulttimeout >= RideTimeOut) {
              const ridenewdata = await createrideModel.findByIdAndUpdate(
                data._id,
                {
                  $unset: { driverId: "", assigningTime: "" },
                  $set: { ridestatus: 0, nearest: false },
                }
              );
              const drivernewdata = await driverModel.findByIdAndUpdate(
                data.driverId,
                { $set: { assign: "0" } }
              );

              notificationCounter++;


              const notificationMessage = 'Sorry Ride Timeout! Driver Not Found Try Again';
              io.emit("pushnotification", {
                success: true,
                message: notificationMessage,
                notificationCounter 
              });
    
              io.emit("timeoutdata", {
                success: true,
                message: notificationMessage,
                ridenewdata,
                drivernewdata,
                notificationCounter
              });
            }
          }
        }
        else if (nearestArray.length>0){
          console.log("else if Hii");

          
          let rideAssigned = false;


          for (let nearestdata of nearestridedata) {
            
            let currenttime = Date.now()
            let assignedTime = nearestdata.assigningTime
            resulttimeout = currenttime/1000 - assignedTime/1000
            
            if (resulttimeout >= RideTimeOut) {
              


              const randomIndex = Math.floor(Math.random() * nearestArray.length);
              const driverIdToAdd = nearestArray[randomIndex];

              let old_driver_id = nearestdata.driverId;
              console.log("old_driver_id", old_driver_id);


              // Update previously assigned driver's assign field to "0"
              if (nearestdata.driverId) {
                await driverModel.findByIdAndUpdate(nearestdata.driverId, { $set: { assign: "0" } });
              }
          
              const createdata = await createrideModel.findByIdAndUpdate(nearestdata._id, {
                $addToSet: { nearestArray: driverIdToAdd }, $set: {driverId: driverIdToAdd, assigningTime: Date.now()}});


              await driverModel.findByIdAndUpdate(driverIdToAdd, { $set: { assign: "1" } });

              let new_driver_id = createdata.driverId;
              console.log("new_driver_id", new_driver_id);

              rideAssigned = true;
              break;

            }
          }

          if (rideAssigned) {
            notificationCounter++;
            const notificationMessage = 'Sorry Driver Not Free';
            io.emit("pushnotification", {
              success: true,
              message: notificationMessage,
              notificationCounter,
            });
          }
        }
        else{
          console.log("863", nearestridedata[0].driverId);
          const driver_data = await driverModel.findByIdAndUpdate( {}, { $set: { assign: "0" } })
          const ride_data = await createrideModel.findByIdAndUpdate(nearestridedata[0]._id ,  { $unset: { driverId: "" , assigningTime: "", nearestArray: ""}, $set: { ridestatus: 0, nearest: false} })
          io.emit('timeoutdata', { success: true, message: 'Sorry Time Out.', ride_data, driver_data, notificationCounter});
        }
      } catch (error) {
        // console.error("Error in myTask:", error);
      }
    }


    //----------------------------------------HANDLE CRON------------------------------------------//
    cron.schedule("*/10 * * * * *", async () => {
      await myTask();
    });
    

    socket.on("disconnect", () => {
      console.log("client Disconnected");
    });
  });
}

// i want to use findquery inside this cron to check any update if in my db, like if my driver is assigned then its assign field value will change from 0 to 1 and by detecting that change through find query I want to send the request to driver in running request compoennt where driver have option to accept or reject ride if no resposne within a particular time interval by driver then timeout will happen and ride will be again send to confirm ride component by changing the status field value  from 1 to 0 and by also setting the drievrId to null and changing driver collection also setting the assign field value from now 1 to 0 again to make the driver free again

module.exports = initializeSocket;
