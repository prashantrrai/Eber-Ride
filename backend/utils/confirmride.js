const { ObjectId } = require('mongodb');
const createRideModel = require('../models/createride');

const bookdriverData = async (cityId, serviceId, res) => {
  let cId = new ObjectId(cityId);
  let sId = new ObjectId(serviceId);

  console.log(cId, sId);

  const aggregationPipeline = [
    {
      $lookup: {
        from: "drivermodels",
        localField: "driverId",
        foreignField: "_id",
        as: "driverDetails",
      },
    },
    {
        $lookup: {
          from: "citymodels",
          localField: "cityId",
          foreignField: "_id",
          as: "cityDetails",
        },
      },
  ];
  try {
    const rides = await createRideModel.aggregate(aggregationPipeline).exec();
    res.send(rides);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

module.exports = bookdriverData;