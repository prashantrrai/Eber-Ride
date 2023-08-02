const cron = require('node-cron');



function myTask() {
    // Your task code here...
    console.log('Task executed at: ', new Date().toLocaleString());
  }


// Schedule the task to run every minute
// const cronJob = cron.schedule('* * * * * *', myTask);


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




module.exports = cronJob;