const socketio = require("socket.io");
require("dotenv").config();
const RideTimeOut = process.env.RIDETIMEOUT;
// const RideTimeOut = 5;
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

  // const io = socketio(server, { cors: { origin: ["http://localhost:4200"] } });
  const io = socketio(server, { cors: { origin: "*" } });

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
      const driverId = data.driverId;
      const rideId = data.rideId;
      console.log("137",data);
      try {
        const driver = await driverModel.findByIdAndUpdate(
          driverId,
          { assign: "1" },
          { new: true }
        );

        const updatedRide = await createrideModel.findByIdAndUpdate(
          { _id: rideId },
          {
            $set: { driverId: driverId, ridestatus: 1, assigningTime: Date.now(), nearest: false },
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
      console.log("241", data);

      try { 


        const driverdata = await driverModel.find({ status: true, city: data.cityId, servicetype: data.serviceId, assign: "0" });
        const firstdriver = driverdata[0]
        console.log("247 firstdriver",firstdriver.drivername);

        const driver = await driverModel.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
        const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: firstdriver._id, ridestatus: 1, nearest: true, nearestArray: firstdriver._id, assigningTime: Date.now() }, { new: true })

        const alldata = await createrideModel.aggregate([
          {
            $match: {
              _id: rideId,
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
              ridestatus: { $in: [1, 4, 5, 9, 6, 7, 8] },
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

    //--------------------------------------------RIDE ACCEPTED----------------------------------------------------//
    socket.on('rideaccepted', async (data) => {
      console.log("612",data);
      const driverId = data.driverId
      const rideId = data.rideId;
      try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: driverId, ridestatus: 4 }, { new: true })
        const userdata = await userModel.findById(ride.userId)
        io.emit('rideupdates', ride);

        // notificationCounter--;
        // io.emit("pushnotification", {
        //   notificationCounter 
        // });

      } catch (error) {
        console.log(error);
      }
    })

    //--------------------------------------------RIDE ARRIVED----------------------------------------------------//
    socket.on('ridearrived', async (data) => {
      console.log("626",data);
      const rideId = data.rideId;
      try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 5 }, { new: true })
        io.emit('rideupdates', ride);
      } catch (error) {
        console.log(error);
      }
    })

    //--------------------------------------------RIDE PICKED----------------------------------------------------//
    socket.on('ridepicked', async (data) => {
      console.log("639",data);

      const rideId = data.rideId;
      try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, {ridestatus: 9 }, { new: true })
        io.emit('rideupdates', ride);
      } catch (error) {
        console.log(error);
      }
    })

    //--------------------------------------------RIDE STARTED----------------------------------------------------//
    socket.on('ridestarted', async (data) => {
      console.log("653",data);

      const rideId = data.rideId;
      try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 6 }, { new: true })
        io.emit('rideupdates', ride);
        // sendmessage(ride.status);
      } catch (error) {
        console.log(error);
      }
    })

    //--------------------------------------------RIDE COMPLETED----------------------------------------------------//
    socket.on('ridecompleted', async (data) => {
      const rideId = data.rideId;
      const driverId = data.driverId
      console.log("474",data);
      
      try {
        const driverdata = await driverModel.findById(driverId)
        const ridedata = await createrideModel.findByIdAndUpdate(rideId, { $set: { ridestatus: 7 }},{ new: true } );
        const userdata = await userModel.findById(ridedata.userId)


        if (!userdata.customer_id) {
          // return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
          console.log("User does not have a Stripe customer ID");
          console.log("CASH Payment is Selected");
        }
        if(ridedata.paymentOption == "card"){

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
  
        }
        
        io.emit("rideupdates", ridedata, driverdata );

        const tripDetails = {ridedata, driverdata, userdata};
        const userEmail = userdata.useremail;
        transporter.sendRideStatus(userEmail, tripDetails);
        transporter.sendInvoiceEmail(userEmail, tripDetails)

        // let toPhoneNumber = `${driverdata.countrycode}${driverdata.driverphone}`
        let toPhoneNumber = `+91 73590 30960`
        let status  = ridedata.ridestatus
        client.sendRideSMS(toPhoneNumber, status)

      } catch (error) {
        console.log(error);
      }
    })

    //--------------------------------------------FREE DRIVER AFTER RIDE COMPLETE----------------------------------------------------//
    socket.on('driverfree', async (data) => {
      console.log("526",data);
      const driverId = data.driverId
      const rideId = data.rideId;
      try {
        const driverdata = await driverModel.findByIdAndUpdate(driverId, { $set: { assign: "0" } }, {new: true});
        const ride = await createrideModel.findByIdAndUpdate(rideId, { $unset: {driverId: "", assigningTime: ""}}, { new: true })
        io.emit('rideupdates', ride, driverdata);
      } catch (error) {
        console.log(error);
      }
    })

    // ------------------------------------------------RIDE REJECTED REQUEST TABLE-----------------------------------------------//
    socket.on("Rejectrunningrequest", async (data) => {
      // console.log("441",data);
      const driverId = data.driverId
      const rideId = data.rideId

      try {
        const fetchridedata = await createrideModel.findById(rideId);
        // console.log("422",fetchridedata);

        const nearestfalsedriver = await driverModel.findByIdAndUpdate(
          { _id: driverId },
          { $set: { assign: "0" } },  { new: true }
        );

        let nearestfalseride;
          // console.log(fetchridedata.nearest);

        if (fetchridedata.nearest == false) {
          // console.log("435" , "If");
          nearestfalseride = await createrideModel.findByIdAndUpdate( rideId,
            { $unset: { driverId: "", assigningTime: "", nearestArray: "" }, $set: { ridestatus: 2 } },  { new: true }
            );
            io.emit('assignrejected', nearestfalseride, nearestfalsedriver)
            // console.log("440" , nearestfalseride);
        }else{
          // console.log("458" , "Else");
          // let newdata = await driverModel.find({assign: "0", status: true, city: fetchridedata.cityId, servicetype: fetchridedata.serviceId, _id: { $nin: fetchridedata.nearestArray }})
          // console.log("459", newdata);
          let newdata = await driverModel.aggregate([
            {
              $match: {
                status: true,
                city:  fetchridedata.cityId,
                servicetype: fetchridedata.serviceId,
                assign: "0",
                _id: { $nin: fetchridedata.nearestArray}
              },
            },
          ]);

          if(newdata.length > 0){
          // console.log("473" , "If", fetchridedata.driverId);


          // const randomIndex = Math.floor(Math.random() * newdata.length);
          // const randomdriver = newdata[randomIndex];
          // console.log("447", randomdriver);

          // const olddriver = await driverModel.findByIdAndUpdate(fetchridedata.driverId, {$set: { assign: "0" }}, { new: true });
          // console.log("olddriver", olddriver);
          const newdriver = await driverModel.findByIdAndUpdate(newdata[0]._id, {$set: { assign: "1" }}, { new: true });
          // console.log("465", newdriver);


          const result = await createrideModel.findByIdAndUpdate(data.rideId, { $set: { assigningTime: Date.now(), driverId: newdata[0]._id}, $addToSet: { nearestArray: newdata[0]._id } }, { new: true });
          io.emit('runningrequestreject',result)

          // notificationCounter--;
          // io.emit("pushnotification", {
          //   notificationCounter 
          // });

          }else{
            // console.log("479" , "Else");
              //hold condition
            let assigneddriverdata = await driverModel.aggregate([
              {
                $match: {
                  status: true,
                  city:  fetchridedata.cityId,
                  servicetype: fetchridedata.serviceId,
                  assign: "1",
                  _id: { $nin: fetchridedata.nearestArray}
                },
              },
            ]);

            // const rejectdata = await assigneddriverdata.exec();
            // console.log("485",assigneddriverdata);
            // if(assigneddriverdata.length > 0){
            //   const driverdata = await driverModel.findByIdAndUpdate(data.driverId, { $set: { assign: "0" } }, { new: true });
              const result = await createrideModel.findByIdAndUpdate(data.rideId, {$set: { assigningTime: Date.now(), ridestatus: 8},  $unset: {driverId: ""}}, { new: true });
              io.emit('runningrequestreject' ,result)
            // }
            // else{
            //   console.log("492");
            //  const driverdata =  await driverModel.findByIdAndUpdate(data.driverId,  { $set: { assign: "0" } }, { new: true });
            //   const result = await createrideModel.findByIdAndUpdate(data.rideId, {$set: {ridestatus: 2},  $unset: {driverId: "", nearestArray: ""}}, { new: true })
            //   io.emit('runningrequestreject', driverdata ,result)
            // }

            //  const driverdata =  await driverModel.findByIdAndUpdate(fetchridedata.driverId, { $set: { assign: "0" } }, { new: true });
            //   const ridedata = await createrideModel.findByIdAndUpdate(fetchridedata._id, {$set: {nearest: false, ridestatus: 0 }, $unset: {driverId: "" , assigningTime: "", nearestArray: ""}}, { new: true })
            //   io.emit('runningrequestreject', driverdata ,ridedata)
          }

        }
        // io.emit('runningrequestreject', nearestfalsedriver );
        // io.emit('runningrequestreject', nearestfalseride );
      } catch (error) {
        console.error(error);
        // socket.emit("runningrequestreject", {success: false,});
      }
    });

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
        const nearestridedata = await createrideModel.find({ $and: [{ $or: [{ ridestatus: 1 }, { ridestatus: 2 }, { ridestatus: 8 }] }, { nearest: true }] });
        // console.log(nearestridedata);

        //----------------For Single Assign Driver----------------------//
        if (asigningrides.length > 0) {
          // console.log("Hi if 940");
          for (const data of asigningrides) {
            // console.log("942",data);
            if (data.assigningTime) {
              // job.start()
              // console.log("945",data.assigningTime);
              
              let currenttime = Date.now();
              let assignedTime = data.assigningTime;
              resulttimeout = Math.floor((currenttime - assignedTime) / 1000);
              console.log(`${resulttimeout} >= ${RideTimeOut}`, resulttimeout >= RideTimeOut);
              if (resulttimeout >= RideTimeOut) {
                console.log("success");
                const drivernewdata = await driverModel.findByIdAndUpdate(
                  data.driverId,
                  { $set: { assign: "0" } }, { new: true }
                );

                const ridenewdata = await createrideModel.findByIdAndUpdate(
                  data._id,
                  {
                    $unset: { driverId: ""},
                    $set: { ridestatus: 0},
                  }, { new: true }
                );
                io.emit('runningrequestreject', drivernewdata, ridenewdata);


                
                io.emit("timeoutdata", {
                  success: true,
                  message: "timeoutdata",
                  ridenewdata,
                  drivernewdata
                });
                
              }else{
                console.log("failed to get inside single if");
              }
            }

          }
        }
        
        if (nearestridedata.length>0){
          // console.log("988", "after rejected status");
          for (const data of nearestridedata) {
            
            let currenttime = Date.now()
            let assignedTime = data.assigningTime
            resulttimeout = Math.floor((currenttime - assignedTime)/1000)
            console.log(`${resulttimeout} >= ${RideTimeOut}`, resulttimeout >= RideTimeOut);
            
            if (resulttimeout >= RideTimeOut) {
              // console.log("848", "If");
              const city_id = new mongoose.Types.ObjectId(data.cityId);
              const vehicle_id = new mongoose.Types.ObjectId(data.serviceId);
              const nearestdriversArray = [...new Set(data.nearestArray)];
              console.log("846",nearestdriversArray);
              const olddriver = await driverModel.findByIdAndUpdate(data.driverId, {$set: { assign: "0" }}, { new: true });
              // console.log("olddriver", olddriver);
              
              let nonassigndriverdata = driverModel.aggregate([
                {
                  $match: {
                    status: true,
                    city: city_id,
                    servicetype: vehicle_id,
                    assign: "0",
                    _id: { $nin: nearestdriversArray }
                  },
                },
              ]);

              const pendingdrivertoassign = await nonassigndriverdata.exec();
              // console.log("865",pendingdrivertoassign);

              if (pendingdrivertoassign.length > 0) {
                // console.log("870", "If");

                const randomIndex = Math.floor(Math.random() * pendingdrivertoassign.length);
                const randomdriver = pendingdrivertoassign[randomIndex];
                // console.log("870",randomdriver);

                const newdriver = await driverModel.findByIdAndUpdate(pendingdrivertoassign[0]._id, {$set: { assign: "1" }}, { new: true });
                // console.log("newdriver", newdriver);


                const finalresult = await createrideModel.findByIdAndUpdate(data._id , {
                  $addToSet: { nearestArray: pendingdrivertoassign[0]._id },
                  $set: {
                    assigningTime: Date.now(),
                    driverId: pendingdrivertoassign[0]._id,
                    ridestatus: 1
                  }
                }, { new: true });

                notificationCounter++;
                io.emit("pushnotification", {
                  notificationCounter 
                });
                
                io.emit("whendriverisnearest", { success: true, olddriver, newdriver, finalresult});
                //kaam baaki che add krvanu
              }
              else{
                // console.log("894", "Else");
                const city_id = new mongoose.Types.ObjectId(data.cityId);
                const vehicle_id = new mongoose.Types.ObjectId(data.serviceId);
                
                let assigndriverdata = driverModel.aggregate([
                  {
                    $match: {
                      status: true,
                      city: city_id,
                      servicetype: vehicle_id,
                      assign: "1",
                      _id: { $nin: nearestdriversArray }
                    },
                  },
                ]);
      
                const assignedList = await assigndriverdata.exec();

                if (assignedList.length > 0) {
                  // console.log("910", assignedList);
                  // const driverdata = await driverModel.findByIdAndUpdate(data.driverId, {$set: { assign: "0" }}, { new: true });
                  const finalresult = await createrideModel.findByIdAndUpdate(data._id, { $set: { assigningTime: Date.now(), ridestatus: 8}, $unset: {driverId: ""} }, { new: true });


                  io.emit('crontimeoutdata',finalresult)
                //kaam baaki che add krvanu
      
                } else {
                  console.log("912 END");
                  // const driverdata = await driverModel.findByIdAndUpdate(data.driverId, { $set: { assign: "0" }}, { new: true });
                  const finalresult = await createrideModel.findByIdAndUpdate(data._id, { $set: {nearest: false, ridestatus: 0}, $unset: {driverId: "" , nearestArray : "", assigningTime: ""} }, { new: true });
                  // io.emit('timeoutdata', finalresult)
                  io.emit('crontimeoutdata', finalresult)

                  notificationCounter++;

                  const notificationMessage = 'Sorry Ride Timeout! Driver Not Found Try Again';
                  io.emit("pushnotification", {
                    success: true,
                    message: notificationMessage,
                    notificationCounter 
                  });
                  
                }
                
              }

            }else{
              console.log("failed to get inside nearest if");
            }
          }

        }

      } catch (error) {
        console.error("Error in myTask:", error);
      }
    }


    //----------------------------------------HANDLE CRON------------------------------------------//
    const job = cron.schedule("*/30 * * * * *", async () => {
      await myTask();
    });
    

    socket.on("disconnect", () => {
      console.log("client Disconnected");
    });
  });
}

// i want to use findquery inside this cron to check any update if in my db, like if my driver is assigned then its assign field value will change from 0 to 1 and by detecting that change through find query I want to send the request to driver in running request compoennt where driver have option to accept or reject ride if no resposne within a particular time interval by driver then timeout will happen and ride will be again send to confirm ride component by changing the status field value  from 1 to 0 and by also setting the drievrId to null and changing driver collection also setting the assign field value from now 1 to 0 again to make the driver free again

module.exports = initializeSocket;
