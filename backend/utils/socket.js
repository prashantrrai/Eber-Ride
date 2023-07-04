const express = require('express')
const  socketio  = require('socket.io');
const { mongoose } = require('mongoose')
const driverModel = require('../models/driver')


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


    // ------------------------------------------------DRIVERS OF PARTICULAR CITY AND SERVICE ,STATUS TRUE------------------------------------//
    socket.on('assigneddriverdata', async (data) => {

    try {
      const cityId = new mongoose.Types.ObjectId(data.cityId);
      const serviceId = new mongoose.Types.ObjectId(data.serviceId);
    //   console.log(cityId, serviceId);

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
          $unwind: "$serviceDetails"
        },
        {
          $match: {
              city: cityId,
              servicetype: serviceId,
              status: true,
            },
        },
  
      ];
      const driverdata = await driverModel.aggregate(aggregationPipeline).exec()
    //   console.log(driverdata);
      io.emit('driverdata', driverdata , {success: true, message: "Driver Assigned Successfully"});
      
    } catch (error) {
        console.log(error);
        io.emit('driverdata', { success: false, message: error });
    }
  })


    socket.on("disconnect", () => {
        console.log("client Disconnected");
    });
    });



};



module.exports = initializeSocket;