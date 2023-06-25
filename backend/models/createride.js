const mongoose = require("mongoose");

const createRideSchema = mongoose.Schema(
  {
    paymentOption: {},
    rideTime: {},
    serviceType: {},
    rideDate: {},
    time: {},
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "NewVehiclePricings",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Cities",
    },
    startLocation: {},
    endLocation: {},
    wayPoints: {},
    totalDistance: {},
    totalTime: {},
    estimateTime: {},
    estimateFare: {},
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drivers",
    },
    nearest: {
      type: String,
      validate: {
        validator: function (status) {
          const statusRegex = /^[0-1]$/;
          return statusRegex.test(status);
        },
        message: "Invalid status code enter 0 or 1",
      },
      trim: true,
      default: "0",
    },
  },
  {
    timestamps: true,
  }
);

const createRideModel = mongoose.model("createRideModel", createRideSchema);

module.exports = createRideModel;
