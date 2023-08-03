const express = require("express");
const router = express();
require('dotenv').config();
const bodyparser = require("body-parser");
router.use(bodyparser.json());
const socketIo = require('socket.io');
const driverModel = require("../models/driver");
const { mongoose } = require('mongoose')
const createrideModel = require("../models/createride");
const { from } = require("nodemailer/lib/mime-node/le-windows");
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const settingModel = require("../models/setting");
const userModel = require("../models/user")
const STRIPE_SECRET_KEY="sk_test_51NTisDLigteWfcRny45x5AlKwqwtjLMkZEAdwNkYCVzPuqMzbIJc66gNtYqenVaVdBuiyyCY3u9e2joX9LHSdVpz002bL4TERD"
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const twilio = require('twilio');
async function getTwilioCredentials() {
  const setting = await settingModel.find()
  accountSid = setting[0].assountsid;
  authToken = setting[0].authtoken;
  driverrequest = setting[0].driverrequest;
}

getTwilioCredentials();

async function initializeSocket(server) {
  const io = socketIo(server, { cors: { origin: ['http://localhost:4200'] } });

  io.on('connection', (socket) => {
    console.log('Socket connected');

    // Assuming you have a socket instance available

    socket.on("assigndriverdata", async (data) => {
      // console.log(data);
      try {
        const city_id = new mongoose.Types.ObjectId(data.cityId);
        const assignService = new mongoose.Types.ObjectId(data.assignService);

        let pricingQuery = driverModel.aggregate([
          // {
          //   $match: {
          //     status: true,
          //     city_id: city_id,
          //     assignService: assignService,
          //   },
          // },
          {
            $lookup: {
              from: "countries",
              foreignField: "_id",
              localField: "country_id",
              as: "countrydata",
            },
          },
          {
            $unwind: "$countrydata",
          },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "city_id",
              as: "citydata",
            },
          },
          {
            $unwind: "$citydata",
          },
          {
            $lookup: {
              from: "vehicles",
              foreignField: "_id",
              localField: "assignService",
              as: "vehicledata",
            },
          },
          {
            $unwind: {
              path: "$vehicledata",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              status: true,
              city_id: city_id,
              assignService: assignService,
              assign: "0"
            },
          },
        ]);

        const driver = await pricingQuery.exec();

        // console.log(driver);

        // Emit the 'assigndriverdatadata' event with the driver data to the client
        io.emit("assigndriverdata", { driver });
      } catch (error) {
        console.error(error);
      }
    });

    // change driverstatus 

    socket.on('changedriverstatus', async (data) => {
      const _id = data.id;
      const status = data.status;
      // console.log(data);
      try {
        const updateDriver = await driverModel.findByIdAndUpdate(_id, { status: status }, { new: true });
        await updateDriver.save();
        // console.log(updateDriver);
        // const driver = await driverModel.find({status:true});

        io.emit('driverstatuschanged', { updateDriver, success: true, message: 'update driver successfull' });

        // socket.emit('statuschangeconfirmation', {
        //   success: true,
        //   message: 'Update driver successfull',
        // });
      } catch (error) {
        // console.log(error);
        socket.emit('driverstatuschanged', {
          success: false,
          message: 'Toggle not updated',
        });
      }
    });

    //  change vehicle service in driver data 

    socket.on('changevehicletype', async (data) => {
      // console.log(data);
      const _id = data.id
      const assignService = data.assignServices
      try {
        const updatedrivervehicle = await driverModel.findByIdAndUpdate(_id, { assignService: assignService }, { new: true })
        await updatedrivervehicle.save();
        // console.log(updatedrivervehicle);
        io.emit('changevehicletype', { updatedrivervehicle, success: true, message: 'update driver succesfull' })
      } catch (error) {
        // console.log(error);
        socket.emit('changevehicletype', { success: false, message: 'update driver is not succesfull' })
      }
    })

    // crone 

    const job = cron.schedule('*/30 * * * * *', async () => {

      const ride = await createrideModel.find({ assigned: "assigning", status: 1, nearest: false });
      const ridenearestdata = await createrideModel.find({ $and: [{ $or: [{ status: 1 }, { status: 9 }] }, { nearest: true }] });

      // console.log(ride , "rideeeeeeeeeeeeeeeeeeeeeeeeeeeee");  
      // console.log(ridenearestdata , "nearesttttttttttttttttttttttt");
      if (ride.length > 0) {
        // console.log("hellodfvgbhnjmkmn");
        for (const data of ride) {
          if (data.created) {
            job.start();
            // console.log('Cron job started.');
            const currentTime = new Date();
            // console.log(currentTime.getTime());
            const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
            // console.log(elapsedTimeInSeconds);
            if (elapsedTimeInSeconds >= 30) {
              const result1 = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
              io.emit('cronedata', result1);


              const result = await createrideModel.findByIdAndUpdate(data._id, { driver_id: null, assigned: "pending", status: 0  , notification : true }, { new: true });
              io.emit('riderejected', result);
              io.emit('cronedata', result);

              // console.log('Cron job ended.');

            } else {
              // console.log("hello");
            }
          }
        }
      }
      if (ridenearestdata.length > 0) {
        for (const data of ridenearestdata) {
          const currentTime = new Date();
          const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
          // console.log(elapsedTimeInSeconds);
          if (elapsedTimeInSeconds >= 30) {
            const city_id = new mongoose.Types.ObjectId(data.city_id);
            const vehicle_id = new mongoose.Types.ObjectId(data.vehicle_id);
            const assigneddrivers = [...new Set(data.assigndriverarray)];
            let alldrivers = driverModel.aggregate([
              {
                $match: {
                  status: true,
                  city_id: city_id,
                  assignService: vehicle_id,
                  assign: "0",
                  _id: { $nin: assigneddrivers }
                },
              },
            ]);

            const pendingdriver = await alldrivers.exec();
            // console.log(pendingdriver.length);
            // const array = pendingdriver

            if (pendingdriver.length > 0) {
              const randomIndex = Math.floor(Math.random() * pendingdriver.length);
              const randomObject = pendingdriver[randomIndex];

              // console.log(randomObject._id);
              const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
              const driver = await driverModel.findByIdAndUpdate(randomObject._id, { assign: "1" }, { new: true });

              const result = await createrideModel.findByIdAndUpdate(data._id, { $addToSet: { assigndriverarray: randomObject._id }, created: Date.now(), driver_id: randomObject._id, status: 1, assigned: "assigning"  }, { new: true });
              io.emit('afterselectdriver', driverdata, driver, result)
            }
            else {
              const city_id = new mongoose.Types.ObjectId(data.city_id);
              const vehicle_id = new mongoose.Types.ObjectId(data.vehicle_id);
              
              let assigndriverdata = driverModel.aggregate([
                {
                  $match: {
                    status: true,
                    city_id: city_id,
                    assignService: vehicle_id,
                    assign: "1",
                    _id: { $nin: assigneddrivers }
                  },
                },
              ]);

              const assigndriverdatalist = await assigndriverdata.exec();
              if (assigndriverdatalist.length > 0) {
                const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
                const result = await createrideModel.findByIdAndUpdate(data._id, { created: Date.now(), assigned: "hold", status: 9, driver_id: null }, { new: true });
                io.emit('afternulldriverdata', driverdata ,result)

              } else {
                const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
                const result = await createrideModel.findByIdAndUpdate(data._id, { created: Date.now(), nearest: false, assigned: "pending", status: 0, driver_id: null , assigndriverarray : [] , notification : true }, { new: true });
                io.emit('afternulldriverdata', driverdata, result)
              }
            }
          }


        }
      }
    })


    // const job = cron.schedule('*/30 * * * * *', async () => {
    //   const ride = await createrideModel.find({ assigned: "assigning", status: 1, nearest: false });
    //   const ridenearestdata = await createrideModel.find({ $and: [{ $or: [{ status: 1 }, { status: 9 }] }, { nearest: true }] });
    
    //   if (ride.length > 0) {
    //     for (const data of ride) {
    //       if (data.created) {
    //         const currentTime = new Date();
    //         const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
    //         console.log(elapsedTimeInSeconds);
    
    //         if (elapsedTimeInSeconds >= 30) {
    //           const result1 = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
    //           io.emit('cronedata', result1);
    
    //           const result = await createrideModel.findByIdAndUpdate(data._id, { driver_id: null, assigned: "pending", status: 0 }, { new: true });
    //           io.emit('riderejected', result);
    //           io.emit('cronedata', result);
    //         }
    //       }
    //     }
    //   }
    
    //   if (ridenearestdata.length > 0) {
    //     for (const data of ridenearestdata) {
    //       const currentTime = new Date();
    //       const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
    //       console.log(elapsedTimeInSeconds);
    
    //       if (elapsedTimeInSeconds >= 30) {
    //         const city_id = new mongoose.Types.ObjectId(data.city_id);
    //         const vehicle_id = new mongoose.Types.ObjectId(data.vehicle_id);
    //         const assigneddrivers = [...new Set(data.assigndriverarray)];
    
    //         const filter = {
    //           status: true,
    //           city_id: city_id,
    //           assignService: vehicle_id,
    //           assign: "0",
    //           _id: { $nin: assigneddrivers }
    //         };
    
    //         let alldrivers = driverModel.find(filter);
    
    //         const pendingdriver = await alldrivers.exec();
    
    //         if (pendingdriver.length > 0) {
    //           const randomIndex = Math.floor(Math.random() * pendingdriver.length);
    //           const randomObject = pendingdriver[randomIndex];
    //           const driver = await driverModel.findByIdAndUpdate(randomObject._id, { assign: "1" }, { new: true });
    //           const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
    
    //           const result = await createrideModel.findByIdAndUpdate(data._id, {
    //             $addToSet: { assigndriverarray: randomObject._id },
    //             created: Date.now(),
    //             driver_id: randomObject._id,
    //             status: 1,
    //             assigned: "assigning"
    //           }, { new: true });
    
    //           io.emit('afterselectdriver', driverdata, driver, result);
    //         } else {
    //           const filter2 = {
    //             status: true,
    //             city_id: city_id,
    //             assignService: vehicle_id,
    //             assign: "1",
    //             _id: { $nin: assigneddrivers }
    //           };
    
    //           const assigndriverdata = driverModel.find(filter2);
    //           const assigndriverdatalist = await assigndriverdata.exec();
    
    //           if (assigndriverdatalist.length > 0) {
    //             const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
    //             const result = await createrideModel.findByIdAndUpdate(data._id, {
    //               created: Date.now(),
    //               assigned: "hold",
    //               status: 9,
    //               driver_id: null
    //             }, { new: true });
    //             io.emit('afternulldriverdata', driverdata, result);
    //           } else {
    //             const driverdata = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
    //             const result = await createrideModel.findByIdAndUpdate(data._id, {
    //               created: Date.now(),
    //               nearest: false,
    //               assigned: "pending",
    //               status: 0,
    //               driver_id: null
    //             }, { new: true });
    //             io.emit('afternulldriverdata', driverdata, result);
    //           }
    //         }
    //       }
    //     }
    //   }
    // });
    



    // assign driver in create ride data 

    socket.on('assigndriver', async (data) => {
      // console.log(data);
      const _id = data._id;
      const driver_id = data.driver_id;
      try {
        const driver = await driverModel.findByIdAndUpdate(driver_id, { assign: "1" }, { new: true });
        await driver.save();
        // console.log(driver);
        const ride = await createrideModel.findByIdAndUpdate(_id, { driver_id: driver_id, assigned: "assigning", status: 1, nearest: false, created: Date.now() }, { new: true })
        await ride.save()
        // console.log(ride);
        io.emit('assigndriver', { driver });
        io.emit('assigndriver', { ride });
        // startCronJob(driver_id , _id );
      } catch (error) {
        // console.log(error);
        socket.emit('assigndriver', { success: false })
      }


    })

    // assign nearest driver 

    socket.on("assignnearestdriverdata", async (data) => {
      // console.log(data);
      try {
        const city_id = new mongoose.Types.ObjectId(data.cityId);
        const assignService = new mongoose.Types.ObjectId(data.assignService);

        let assignnearestdriverdata = driverModel.aggregate([
          {
            $match: {
              status: true,
              city_id: city_id,
              assignService: assignService,
              assign: "0"

            },
          },
        ]);

        const driverdata = await assignnearestdriverdata.exec();

        // console.log(driverdata);
        const firstdriver = driverdata[0]
        // console.log(firstdriver._id);

        const driver = await driverModel.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
        await driver.save();
        // console.log(driver);
        const ride = await createrideModel.findByIdAndUpdate(data._id, { driver_id: firstdriver._id, assigned: "assigning", status: 1, nearest: true, assigndriverarray: firstdriver._id, created: Date.now() }, { new: true })
        await ride.save()
        // Emit the 'assigndriverdatadata' event with the driver data to the client
        io.emit("afterassignnearestdriverdata", driverdata);
      } catch (error) {
        console.error(error);
      }
    });


    socket.on("runningrequest", async () => {
      try {
        let runningrequest = createrideModel.aggregate([
          {
            $match: {
              assigned: { $in: ["assigning", "accepted", "arrived", "picked", "started", "hold"] },
              status: { $in: [1, 3, 4, 5, 6, 9] }

            },
          },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "user_id",
              as: "userdata",
            },
          },
          {
            $unwind: "$userdata",
          },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "city_id",
              as: "citydata",
            },
          },
          {
            $unwind: "$citydata",
          },
          {
            $lookup: {
              from: "vehicles",
              foreignField: "_id",
              localField: "vehicle_id",
              as: "vehicledata",
            },
          },
          {
            $unwind: "$vehicledata"
          },
          {
            $lookup: {
              from: "drivers",
              foreignField: "_id",
              localField: "driver_id",
              as: "driverdata",
            },
          },
          {
            $unwind: {
              path: "$driverdata",
              preserveNullAndEmptyArrays: true,
            },
          }
        ]);

        const runningrequestdata = await runningrequest.exec();

        // console.log(runningrequestdata);

        // Emit the 'runningrequest' event with the driver data to the client
        io.emit("runningrequest", { runningrequestdata });
      } catch (error) {
        console.error(error);
      }
    });

    //  when ride is rejected

    socket.on('riderejected', async (data) => {
    
      const ride_id = data.ride_id;
      const driver_id = data.driver_id;
      try {
        const ridedata = await createrideModel.findById(ride_id);
        const driver = await driverModel.findByIdAndUpdate(driver_id, { assign: "0" }, { new: true });
        await driver.save();
        if (ridedata.nearest == false) {
          const ride = await createrideModel.findByIdAndUpdate(ride_id, { driver_id: null, assigned: "rejected", status: 2, assigndriverarray: [] }, { new: true })
          await ride.save()
        } else {
          let alldrivers = await driverModel.aggregate([
            {
              $match: {
                status: true,
                city_id: ridedata.city_id,
                assignService: ridedata.vehicle_id,
                assign: "0",
                _id: { $nin: ridedata.assigndriverarray }
              },
            },
          ]);
          if (alldrivers.length > 0) {
            const result =   await createrideModel.findByIdAndUpdate(ride_id, { driver_id: alldrivers[0]._id, $addToSet: { assigndriverarray: alldrivers[0]._id } }, { new: true })
            io.emit('riderejected' ,result)
          } else {
       
            let assigndriverdata = driverModel.aggregate([
              {
                $match: {
                  status: true,
                  city_id: ridedata.city_id,
                  assignService: ridedata.vehicle_id,
                  assign: "1",
                  _id: { $nin: ridedata.assigndriverarray }
                },
              },
            ]);
            const rejecrtedridedata = await assigndriverdata.exec();
            // console.log(rejecrtedridedata , "data");
            if(rejecrtedridedata.length > 0){
              const driverdata = await driverModel.findByIdAndUpdate(driver_id, { assign: "0" }, { new: true });
              const result = await createrideModel.findByIdAndUpdate(ride_id, { created: Date.now(), assigned: "hold", status: 9, driver_id: null }, { new: true });
              io.emit('riderejected', driverdata ,result)
            }else{
             const driverdata =  await driverModel.findByIdAndUpdate(driver_id, { assign: "0" }, { new: true });
              const result = await createrideModel.findByIdAndUpdate(ride_id, { driver_id: null, assigned: "rejected", status: 2, assigndriverarray: [] }, { new: true })
              io.emit('riderejected', driverdata ,result)
            }

          }

        }
        // console.log(driver);

        // console.log(ride);
        io.emit('riderejected', { driver });
        io.emit('riderejected', { ride });
      } catch (error) {
        // console.log(error);
        socket.emit('riderejected', { success: false })
      }
    })


    socket.on('cancelride', async (data) => {
      // console.log(data);
      const ride_id = data.ride_id;
      // console.log(ride_id);
      try {
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { assigned: "cancel", status: 8 }, { new: true })
        await ride.save();
        // console.log(ride);
        io.emit('cancelride', { ride });
      } catch (error) {
        // console.log(error);
        socket.emit('cancelride', { success: true })
      }
    })

    // ride accepted 
    socket.on('accepted', async (data) => {
      const ride_id = data.ride_id;
      const driver_id = data.driver_id;
      try {
        const driver = await driverModel.findByIdAndUpdate(driver_id, { assign: "2" }, { new: true });
        await driver.save();
        // console.log(driver);
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { driver_id: driver_id, assigned: "accepted", status: 3 }, { new: true })
        await ride.save()
        io.emit('updateride', driver, ride);
        // sendmessage(ride.status);
      } catch (error) {
        // console.log(error);
      }
    })

    // ride arrived
    socket.on('arrived', async (data) => {
      const ride_id = data.ride_id;
      const driver_id = data.driver_id;
      // console.log(data);
      try {
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { assigned: "arrived", status: 4 }, { new: true })
        await ride.save()
        io.emit('updateride', ride);
      } catch (error) {
        console.log(error);
      }
    })

    // ride picked 
    socket.on('picked', async (data) => {
      const ride_id = data.ride_id;
      try {
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { assigned: "picked", status: 5 }, { new: true })
        await ride.save()
        io.emit('updateride', ride);
      } catch (error) {
        // console.log(error);
      }
    })

    // ride started 
    socket.on('started', async (data) => {

      const ride_id = data.ride_id;
      try {
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { assigned: "started", status: 6 }, { new: true })
        await ride.save()
        io.emit('updateride', ride);
        // sendmessage(ride.status);
      } catch (error) {
        // console.log(error);
      }
    })

    // ride complete 

    socket.on('Completed', async (data) => {
      const ride_id = data.ride_id;
      const driver_id = data.driver_id;
      // console.log(data , " complted data ");
      const ridedata = data.ridedata;
     
      try {
        const driver = await driverModel.findByIdAndUpdate(driver_id, { assign: "0" }, { new: true });
        await driver.save();
        // console.log(driver);
        const ride = await createrideModel.findByIdAndUpdate(ride_id, { driver_id: driver_id, assigned: "completed", status: 7 }, { new: true })
        await ride.save();
        const user = await userModel.findById(ride.user_id);
        // console.log(user.customer_id)
        if (!user.customer_id) {
          return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
        }
        if(ride.paymentoption == "card"){
          // console.log("called");
         exchangeRate = 82
        const customer = await stripe.customers.retrieve(user.customer_id);
        // console.log(customer , "customerrrrrrrr");
        const defaultCardId = customer.default_source;
        // console.log(defaultCardId , "defaultcardddddddddddddddd");

        const estimatePriceUSD = ride.estimatefare / exchangeRate;
        const amountInCents = Math.round(estimatePriceUSD * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          customer: user.customer_id,
          payment_method: defaultCardId,
          off_session: true,
          confirm: true
        });
        }
       

        io.emit('updateride', driver, ride);

        sendMail(ridedata);
        // sendmessage(ride.status);
      } catch (error) {
        // console.log(error);
      }
    })


    socket.on('ridehistory', async (data) => {
      // console.log(data);
      const rideHistoryData = data.data;
      const status = rideHistoryData.status;
      // console.log(status);
      // const vehicleId = new mongoose.Types.ObjectId(rideHistoryData.vehicle_id);
      const vehicleId = rideHistoryData.vehicle_id;
      // console.log(vehicleId);
      const paymentOptions = rideHistoryData.cashCard;
      const fromDate = rideHistoryData.fromdate;
      const toDate = rideHistoryData.todate;
      const pickupLocation = rideHistoryData.pickupLocation;
      // console.log(pickupLocation);
      const dropoffLocation = rideHistoryData.dropoffLocation;
      // console.log(dropoffLocation);

      try {
        const pipeline = [
          {
            $match: {
              assigned: { $in: ["cancel", "completed"] }
            }
          },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "user_id",
              as: "userdata"
            }
          },
          {
            $unwind: "$userdata"
          },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "city_id",
              as: "citydata"
            }
          },
          {
            $unwind: "$citydata"
          },
          {
            $lookup: {
              from: "vehicles",
              foreignField: "_id",
              localField: "vehicle_id",
              as: "vehicledata"
            }
          },
          {
            $unwind: "$vehicledata"
          },
          {
            $lookup: {
              from: "drivers",
              foreignField: "_id",
              localField: "driver_id",
              as: "driverdata"
            }
          },
          {
            $unwind: {
              path: "$driverdata",
              preserveNullAndEmptyArrays: true
            }
          }
        ];

        // Construct the $match stages based on provided filter parameters
        if (paymentOptions) {
          pipeline.push({
            $match: { paymentoption: paymentOptions }
          });
        }
        if (fromDate && toDate) {
          pipeline.push({
            $match: { date: { $gte: fromDate, $lte: toDate } }
          });
        }
        if (pickupLocation) {
          pipeline.push({
            $match: { startlocation: { $regex: pickupLocation, $options: "i" } }
          });
        }

        if (dropoffLocation) {
          pipeline.push({
            $match: { destinationlocation: { $regex: dropoffLocation, $options: "i" } }
          });
        }

        if (status) {
          pipeline.push({
            $match: { assigned: status }
          });
        }


        if (vehicleId && vehicleId.trim() !== '') {
          pipeline.push({
            $match: { vehicle_id: new mongoose.Types.ObjectId(vehicleId) }
          });
        }


        const rideHistoryData = await createrideModel.aggregate(pipeline).exec();

        // Emit the filtered ride history data to the client
        io.emit("ridehistory", { ridehistorydata: rideHistoryData });
      } catch (error) {
        console.error(error);
      }
    });



    socket.on('confirmride', async (data) => {
      // console.log(data);
      const rideHistoryData = data.data;
      const vehicleId = rideHistoryData.vehicle_id;
      // console.log(vehicleId);
      const fromDate = rideHistoryData.fromdate;
      const toDate = rideHistoryData.todate;
      const pickupLocation = rideHistoryData.pickupLocation;
      // console.log(pickupLocation);
      const dropoffLocation = rideHistoryData.dropoffLocation;
      // console.log(dropoffLocation);

      try {
        const pipeline = [
          {
            $match: {
              status: { $in: [0, 2, 1] }
            }
          },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "user_id",
              as: "userdata"
            }
          },
          {
            $unwind: "$userdata"
          },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "city_id",
              as: "citydata"
            }
          },
          {
            $unwind: "$citydata"
          },
          {
            $lookup: {
              from: "vehicles",
              foreignField: "_id",
              localField: "vehicle_id",
              as: "vehicledata"
            }
          },
          {
            $unwind: "$vehicledata"
          },
          {
            $lookup: {
              from: "drivers",
              foreignField: "_id",
              localField: "driver_id",
              as: "driverdata"
            }
          },
          {
            $unwind: {
              path: "$driverdata",
              preserveNullAndEmptyArrays: true
            }
          }
        ];


        if (fromDate && toDate) {
          pipeline.push({
            $match: { date: { $gte: fromDate, $lte: toDate } }
          });
        }

        if (pickupLocation) {
          pipeline.push({
            $match: { startlocation: { $regex: pickupLocation, $options: "i" } }
          });
        }

        if (dropoffLocation) {
          pipeline.push({
            $match: { destinationlocation: { $regex: dropoffLocation, $options: "i" } }
          });
        }


        if (vehicleId && vehicleId.trim() !== '') {
          pipeline.push({
            $match: { vehicle_id: new mongoose.Types.ObjectId(vehicleId) }
          });
        }

        const rideHistoryData = await createrideModel.aggregate(pipeline).exec();
        // console.log(rideHistoryData)
        // Emit the filtered ride history data to the client
        io.emit("afterconfirmridedata", { ridehistorydata: rideHistoryData });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

  });
}

// send mail 

const sendMail = async (req, res) => {
  // console.log(req , "sendmaildataaaaaaaaaa");
  const ridedata = req;
  const settingdata = await settingModel.find()
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: settingdata[0].emailusername,
      pass: settingdata[0].emailpassword
    }
  });

  let info = await transporter.sendMail({
    from: 'info@ethereal.email', // sender address
    to: "krishnahothi.elluminatiinc@gmail.com", // list of receivers
    subject: "YOUR INVOICE", // Subject line      
    text: "", // plain text body
    html: `<!DOCTYPE html>
     
       
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <link rel="stylesheet" href="style.css">
    <link rel="license" href="https://www.opensource.org/licenses/mit-license/">
    <script src="script.js"></script>
    <style>/* reset */
  
    *
    {
      border: 0;
      box-sizing: content-box;
      color: inherit;
      margin: 0;
      padding: 0;
      text-decoration: none;
      vertical-align: top;
    }
    
    /* content editable */
    
    *[contenteditable] { border-radius: 0.25em; min-width: 1em; outline: 0; }
    
    *[contenteditable] { cursor: pointer; }
    
    *[contenteditable]:hover, *[contenteditable]:focus, td:hover *[contenteditable], td:focus *[contenteditable], img.hover { background: #DEF; box-shadow: 0 0 1em 0.5em #DEF; }
    
    span[contenteditable] { display: inline-block; }
    
    /* heading */
    
    h1 { font: bold 100% sans-serif; letter-spacing: 0.5em; text-align: center; text-transform: uppercase; }
    
    /* table */
    
    table { font-size: 75%; table-layout: fixed; width: 100%; }
    table { border-collapse: separate; border-spacing: 2px; }
    th, td { border-width: 1px; padding: 0.5em; position: relative; text-align: left; }
    th, td { border-radius: 0.25em; border-style: solid; }
    th { background: #EEE; border-color: #BBB; }
    td { border-color: #DDD; }
    
    /* page */
    
    html { font: 16px/1 'Open Sans', sans-serif; overflow: auto; padding: 0.5in; }
    html { background: #999; cursor: default; }
    
    body { box-sizing: border-box; height: 11in; margin: 0 auto; overflow: hidden; padding: 0.5in; width: 8.5in; }
    body { background: #FFF; border-radius: 1px; box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5); }
    
    /* header */
    
    header { margin: 0 0 3em; }
    header:after { clear: both; content: ""; display: table; }
    
    header h1 { background: #000; border-radius: 0.25em; color: #FFF; margin: 0 0 1em; padding: 0.5em 0; }
    header address { float: left; font-size: 75%; font-style: normal; line-height: 1.25; margin: 0 1em 1em 0; }
    header address p { margin: 0 0 0.25em; }
    header span, header img { display: block; float: right; }
    header span { margin: 0 0 1em 1em; max-height: 25%; max-width: 60%; position: relative; }
    header img { max-height: 100%; max-width: 100%; }
    header input { cursor: pointer; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; height: 100%; left: 0; opacity: 0; position: absolute; top: 0; width: 100%; }
    
    /* article */
    
    article, article address, table.meta, table.inventory { margin: 0 0 3em; }
    article:after { clear: both; content: ""; display: table; }
    article h1 { clip: rect(0 0 0 0); position: absolute; }
    
    article address { float: left; font-size: 125%; font-weight: bold; }
    
    /* table meta & balance */
    
    table.meta, table.balance { float: right; width: 36%; }
    table.meta:after, table.balance:after { clear: both; content: ""; display: table; }
    
    /* table meta */
    
    table.meta th { width: 40%; }
    table.meta td { width: 60%; }
    
    /* table items */
    
    table.inventory { clear: both; width: 100%; }
    table.inventory th { font-weight: bold; text-align: center; }
    
    table.inventory td:nth-child(1) { width: 26%; }
    table.inventory td:nth-child(2) { width: 38%; }
    table.inventory td:nth-child(3) { text-align: right; width: 12%; }
    table.inventory td:nth-child(4) { text-align: right; width: 12%; }
    table.inventory td:nth-child(5) { text-align: right; width: 12%; }
    
    /* table balance */
    
    table.balance th, table.balance td { width: 50%; }
    table.balance td { text-align: right; }
    
    /* aside */
    
    aside h1 { border: none; border-width: 0 0 1px; margin: 0 0 1em; }
    aside h1 { border-color: #999; border-bottom-style: solid; }
    
    /* javascript */
    
    .add, .cut
    {
      border-width: 1px;
      display: block;
      font-size: .8rem;
      padding: 0.25em 0.5em;	
      float: left;
      text-align: center;
      width: 0.6em;
    }
    
    .add, .cut
    {
      background: #9AF;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      background-image: -moz-linear-gradient(#00ADEE 5%, #0078A5 100%);
      background-image: -webkit-linear-gradient(#00ADEE 5%, #0078A5 100%);
      border-radius: 0.5em;
      border-color: #0076A3;
      color: #FFF;
      cursor: pointer;
      font-weight: bold;
      text-shadow: 0 -1px 2px rgba(0,0,0,0.333);
    }
    
    .add { margin: -2.5em 0 0; }
    
    .add:hover { background: #00ADEE; }
    
    .cut { opacity: 0; position: absolute; top: 0; left: -1.5em; }
    .cut { -webkit-transition: opacity 100ms ease-in; }
    
    tr:hover .cut { opacity: 1; }
    
    @media print {
      * { -webkit-print-color-adjust: exact; }
      html { background: none; padding: 0; }
      body { box-shadow: none; margin: 0; }
      span:empty { display: none; }
      .add, .cut { display: none; }
    }
    
    @page { margin: 0; }</style>
  </head>
  <body>
  <header>
  <h1>Invoice</h1>
  <address contenteditable>
    <p>User Name : ${ridedata.userdata.username}</p>
    <p>User Email : ${ridedata.userdata.useremail}</p>
    <p>User Phonenumber : ${ridedata.userdata.userphonenumber}</p>
  </address>

</header>
<article>
  <table class="meta">
    <tr>
      <th><span contenteditable>Invoice</span></th>
      <td><span contenteditable>${ridedata._id}</span></td>
    </tr>
    <tr>
      <th><span contenteditable>Date</span></th>
      <td><span contenteditable>${ridedata.date}</span></td>
    </tr>
  </table>
  <table class="inventory">
    <thead>
      <tr>
        <th>STARTING LOCATION</th>
        <th>DESTINATION LOCATION</th>
        <th>TOTAl TIME </th>
        <th>DISTANCE</th>
        <th>PRICE</th>
        <th>VEHICLE</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${ridedata.startlocation}</td>
        <td>${ridedata.destinationlocation}</td>
        <td>${ridedata.estimatetime}</td>
        <td>${ridedata.totaldistance}</td>
        <td>${ridedata.estimatefare}</td>
        <td>${ridedata.vehicledata.vehiclename || titlecase}</td>
      </tr>
    </tbody>
  </table>

  <table class="balance">
    <tr>
      <th><span contenteditable>Total</span></th>
      <td><span data-prefix>$</span><span>${ridedata.estimatefare}</span></td>
    </tr>
  </table>
</article>
<aside>
  <div contenteditable>
  </div>
</aside>
</body>
      </html>`
    ,
  });

  console.log("Message sent: %s", info.messageId);

};

function sendmessage(ride) {
  // console.log(ride , "ridestatusfff");
  try {
    const client = twilio(accountSid, authToken);
    const message = client.messages.create({
      body: ride == 3 ? "driver accept request" : (ride == 6 ? "ride started" : " complete ride"),
      from: '+14175052749',
      to: '+919484881886'
    });
    console.log(message.sid, 'message');
  } catch (error) {
    console.log('Error sending message:', error);
  }
}


module.exports = initializeSocket;






    // socket.on('ridehistory', async (data) => {
    //   // console.log(data);
    //   const rideHistoryData = data.data;
    //   // console.log(rideHistoryData);

    //   // Accessing individual properties
    //   const vehicleId = rideHistoryData.vehicle_id;
    //   // console.log(vehicleId);
    //   const paymentOptions = rideHistoryData.cashCard;
    //   // console.log(paymentOptions);
    //   const fromDate = rideHistoryData.fromdate;
    //   const toDate = rideHistoryData.todate;
    //   const pickupLocation = rideHistoryData.pickupLocation;
    //   const dropoffLocation = rideHistoryData.dropoffLocation;

    //   // console.log(paymentOptions , fromDate , toDate , pickupLocation , dropoffLocation)

    //   try {
    //     let rideHistoryQuery = createrideModel.aggregate([
    //       {
    //         $match: {
    //           assigned: { $in: ["cancel", "completed"] }
    //         }
    //       },
    //       // Add other stages for filtering based on parameters
    //       {
    //         $lookup: {
    //           from: "users",
    //           foreignField: "_id",
    //           localField: "user_id",
    //           as: "userdata"
    //         }
    //       },
    //       {
    //         $unwind: "$userdata"
    //       },
    //       {
    //         $lookup: {
    //           from: "cities",
    //           foreignField: "_id",
    //           localField: "city_id",
    //           as: "citydata"
    //         }
    //       },
    //       {
    //         $unwind: "$citydata"
    //       },
    //       {
    //         $lookup: {
    //           from: "vehicles",
    //           foreignField: "_id",
    //           localField: "vehicle_id",
    //           as: "vehicledata"
    //         }
    //       },
    //       {
    //         $unwind: "$vehicledata"
    //       },
    //       {
    //         $lookup: {
    //           from: "drivers",
    //           foreignField: "_id",
    //           localField: "driver_id",
    //           as: "driverdata"
    //         }
    //       },
    //       {
    //         $unwind: {
    //           path: "$driverdata",
    //           preserveNullAndEmptyArrays: true
    //         }
    //       }
    //     ]);
    //     // if(vehicleId){
    //     //   rideHistoryQuery = rideHistoryQuery.match({vehicle_id : vehicleId });
    //     // }
    //     // Apply filters based on parameters

    //     if (paymentOptions) {
    //       rideHistoryQuery = rideHistoryQuery.match({ paymentoption: paymentOptions });
    //     }
    //     if (fromDate && toDate) {
    //       rideHistoryQuery = rideHistoryQuery.match({
    //         date: {
    //           $gte: fromDate,
    //           $lte: toDate
    //         }
    //       });
    //     }
    //     if (pickupLocation) {
    //       const regex = new RegExp(pickupLocation, "i");
    //       rideHistoryQuery = rideHistoryQuery.match({ startlocation: regex });
    //     }
    //     if (dropoffLocation) {
    //       const regex = new RegExp(dropoffLocation, "i");
    //       rideHistoryQuery = rideHistoryQuery.match({ destinationlocation: regex });
    //     }

    //     const rideHistoryData = await rideHistoryQuery.exec();

    //     // Emit the filtered ride history data to the client
    //     io.emit("ridehistory", { ridehistorydata: rideHistoryData });
    //     // console.log(rideHistoryData);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });



    // socket.on('ridehistory', async (data) => {
    //   console.log(data);
    //   const rideHistoryData = data.data;
    //   console.log(rideHistoryData);

    //   // Accessing individual properties
    //   const vehicleId = rideHistoryData.vehicle_id;
    //   console.log(vehicleId);
    //   const paymentOptions = rideHistoryData.cashCard;
    //   console.log(paymentOptions);
    //   const fromDate = rideHistoryData.fromdate;
    //   const toDate = rideHistoryData.todate;
    //   const pickupLocation = rideHistoryData.pickupLocation;
    //   const dropoffLocation = rideHistoryData.dropoffLocation;

    //   try {
    //     let rideHistoryQuery = createrideModel.aggregate([
    //       {
    //         $match: {
    //           assigned: { $in: ["cancel", "completed"] },
    //           $or: [
    //             { paymentoption: { $regex: paymentOptions, $options: "i" } },
    //             {
    //               created: {
    //                 $gte: fromDate ? new Date(fromDate) : new Date(0),
    //                 $lte: toDate ? new Date(toDate) : new Date()
    //               }
    //             },
    //             pickupLocation
    //               ? { startlocation: { $regex: pickupLocation, $options: "i" } }
    //               : {},
    //             dropoffLocation
    //               ? { destinationlocation: { $regex: dropoffLocation, $options: "i" } }
    //               : {}
    //           ]
    //         }
    //       },
    //       {
    //         $facet: {
    //           filteredData: [
    //             {
    //               $lookup: {
    //                 from: "users",
    //                 localField: "user_id",
    //                 foreignField: "_id",
    //                 as: "userdata"
    //               }
    //             },
    //             {
    //               $unwind: "$userdata"
    //             },
    //             {
    //               $lookup: {
    //                 from: "cities",
    //                 localField: "city_id",
    //                 foreignField: "_id",
    //                 as: "citydata"
    //               }
    //             },
    //             {
    //               $unwind: "$citydata"
    //             },
    //             {
    //               $lookup: {
    //                 from: "vehicles",
    //                 localField: "vehicle_id",
    //                 foreignField: "_id",
    //                 as: "vehicledata"
    //               }
    //             },
    //             {
    //               $unwind: "$vehicledata"
    //             },
    //             {
    //               $lookup: {
    //                 from: "drivers",
    //                 localField: "driver_id",
    //                 foreignField: "_id",
    //                 as: "driverdata"
    //               }
    //             },
    //             {
    //               $unwind: {
    //                 path: "$driverdata",
    //                 preserveNullAndEmptyArrays: true
    //               }
    //             },
    //             {
    //               $match: {
    //                 $or: [
    //                   { paymentoption: paymentOptions },
    //                   {
    //                     created: {
    //                       $gte: fromDate ? new Date(fromDate) : new Date(0),
    //                       $lte: toDate ? new Date(toDate) : new Date()
    //                     }
    //                   },
    //                   pickupLocation
    //                     ? { startlocation: { $regex: pickupLocation, $options: "i" } }
    //                     : {},
    //                   dropoffLocation
    //                     ? { destinationlocation: { $regex: dropoffLocation, $options: "i" } }
    //                     : {}
    //                 ]
    //               }
    //             }
    //           ],
    //           totalCount: [
    //             {
    //               $match: {
    //                 assigned: { $in: ["cancel", "completed"] }
    //               }
    //             },
    //             {
    //               $count: "count"
    //             }
    //           ]
    //         }
    //       }

    //     ]);

    //     const rideHistoryResult = await rideHistoryQuery.exec();
    //     const filteredData = rideHistoryResult[0].filteredData;
    //     const totalCount = rideHistoryResult[0].totalCount;

    //     io.emit("ridehistory", { ridehistorydata: filteredData, totalCount });
    //     console.log(filteredData);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });


    // socket.on('ridehistory', async (data) => {
    //   console.log(data);
    //   const paymentoptions = data. cashCard;
    //   const fromdate = data.fromdate;
    //   const todate = data.todate;
    //   const pickupLocation = data.pickupLocation;
    //   const dropoffLocation = data.dropoffLocation;

    //   try {
    //     let ridehistory = createrideModel.aggregate([
    //       {
    //         $match: {
    //           assigned: { $in: ["cancel", "completed"] }
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "users",
    //           foreignField: "_id",
    //           localField: "user_id",
    //           as: "userdata",
    //         },
    //       },
    //       {
    //         $unwind: "$userdata",
    //       },
    //       {
    //         $lookup: {
    //           from: "cities",
    //           foreignField: "_id",
    //           localField: "city_id",
    //           as: "citydata",
    //         },
    //       },
    //       {
    //         $unwind: "$citydata",
    //       },
    //       {
    //         $lookup: {
    //           from: "vehicles",
    //           foreignField: "_id",
    //           localField: "vehicle_id",
    //           as: "vehicledata",
    //         },
    //       },
    //       {
    //         $unwind: "$vehicledata"
    //       },
    //       {
    //         $lookup: {
    //           from: "drivers",
    //           foreignField: "_id",
    //           localField: "driver_id",
    //           as: "driverdata",
    //         },
    //       },
    //       {
    //         $unwind: {
    //           path: "$driverdata",
    //           preserveNullAndEmptyArrays: true,
    //         },
    //       }
    //     ]);

    //     const ridehistorydata = await ridehistory.exec();

    //     // console.log(ridehistorydata);

    //     // Emit the 'runningrequest' event with the driver data to the client
    //     io.emit("ridehistory", { ridehistorydata });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });



    // socket.on('ridehistorydata', async (data) => {
    //   const search = data.search;
    //   let skip = (page - 1) * limit;


    //   try {
    //     let query = {};
    //     if (search) {
    //       query = {
    //         $or: [
    //           { startlocation: { $regex: search, $options: "i" } },
    //           { destinationlocation: { $regex: search, $options: "i" } },
    //         ],
    //         assigned: { $in: ["cancel", "completed"] }
    //       };
    //     }


    //     let ridehistory = createrideModel.aggregate([
    //       {
    //         $lookup: {
    //           from: "users",
    //           foreignField: "_id",
    //           localField: "user_id",
    //           as: "userdata",
    //         },
    //       },
    //       {
    //         $unwind: "$userdata",
    //       },
    //       {
    //         $lookup: {
    //           from: "cities",
    //           foreignField: "_id",
    //           localField: "city_id",
    //           as: "citydata",
    //         },
    //       },
    //       {
    //         $unwind: "$citydata",
    //       },
    //       {
    //         $lookup: {
    //           from: "vehicles",
    //           foreignField: "_id",
    //           localField: "vehicle_id",
    //           as: "vehicledata",
    //         },
    //       },
    //       {
    //         $unwind: "$vehicledata"
    //       },
    //       {
    //         $lookup: {
    //           from: "drivers",
    //           foreignField: "_id",
    //           localField: "driver_id",
    //           as: "driverdata",
    //         },
    //       },
    //       {
    //         $unwind: {
    //           path: "$driverdata",
    //           preserveNullAndEmptyArrays: true,
    //         },
    //       },
    //       { $match: query }, // Apply search query

    //     ]);
    //     const ridehistorydata = await ridehistory.exec();
    //     // console.log(ridehistorydata);
    //     io.emit("ridehistory", { ridehistorydata });
    //   } catch (error) {
    //     // console.log(error);
    //     io.emit("ridehistory", error)
    //   }
    // })