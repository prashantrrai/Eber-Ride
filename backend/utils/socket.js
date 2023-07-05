const express = require('express')
const  socketio  = require('socket.io');
const { mongoose } = require('mongoose')
const driverModel = require('../models/driver')
const createrideModel = require("../models/createride")


async function initializeSocket(server) {
    const io = socketio(server, {cors: {origin: ["http://localhost:4200"]}});

    io.on("connection", (socket) => {
        console.log("Socket is Working........");




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
            // console.log(data);

        try {
            const existingService = await driverModel.findByIdAndUpdate(driverId, { servicetype },  {new: true});
            io.emit('servicedata', { success: true, message: 'Service Updated Successfully', existingService });
        } 
        catch (error) {
            io.emit('servicedata', { success: false, message: error });
          }
        });



    // ------------------------------------------------DRIVERS OF PARTICULAR CITY AND SERVICE with STATUS TRUE------------------------------------//
  //   socket.on('assigneddriverdata', async (data) => {

  //   try {
  //     const cityId = new mongoose.Types.ObjectId(data.cityId);
  //     const serviceId = new mongoose.Types.ObjectId(data.serviceId);
  //   //   console.log(cityId, serviceId);

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
  //       {
  //         $match: {
  //             city: cityId,
  //             servicetype: serviceId,
  //             status: true,
  //             assign: 0
  //           },
  //       },
  
  //     ];
  //     const driverdata = await driverModel.aggregate(aggregationPipeline).exec()
  //   //   console.log(driverdata);
  //     io.emit('driverdata', driverdata , {success: true, message: "Driver Assigned Successfully"});
      
  //   } catch (error) {
  //       console.log(error);
  //       io.emit('driverdata', { success: false, message: error });
  //   }
  // })

  socket.on('assigneddriverdata', async(data) => {
    // const {driverId, rideId} = data;  
    
    console.log("This is data..........",data);

    const driver_Id = data.driverId;
    const ride_Id = data.rideId;
    console.log(ride_Id, driver_Id)
    try{
      
      const driverdata = await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
      await driverdata.save();
      console.log(driverdata); 
      const ridedata = await createrideModel.findByIdAndUpdate(ride_Id, {driverId : driver_Id}, { new: true })
      await ridedata.save()
      console.log(ridedata);
      io.emit('assigndriver', { driverdata });
      io.emit('assigndriver', { ridedata });
    }catch(error) {
      console.log(error);
      socket.emit('assigndriver', { success: false })
    }
    

  })






    socket.on("disconnect", () => {
        console.log("client Disconnected");
    });
    });
};



module.exports = initializeSocket;