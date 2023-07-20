const mongoose = require("mongoose");

const Status = {
  PENDING: 0,
  ASSIGNING: 1,
  REJECTED: 2,
  CANCELLED: 3,
  ACCEPTED: 4,
  ARRIVED: 5,
  STARTED: 6,
  COMPLETED: 7,
};

const createRideSchema = mongoose.Schema(
  {
    paymentOption: {},
    rideTime: {},
    serviceType: {},
    rideDate: {},
    time: {},
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "driverModel",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "userModel",
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "cityModel",
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
      ref: "driverModel",
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
      default: 0,
    },
    assigningTime: {
      type: Date
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
  },
  
);

const createRideModel = mongoose.model("createRideModel", createRideSchema);

module.exports = createRideModel;
