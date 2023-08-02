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
    ridestatus: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
      default: 0,
    },
    assigningTime: {
      type: Number
    },
    
    nearest: {
      type: Boolean,
      default: false,
    },    
    restart: {
      type: Boolean,
      default: false,
    },
    nearestArray: {
      type: Array
    }
  },
  {
    timestamps: true,
  },
  
);

const createRideModel = mongoose.model("createRideModel", createRideSchema);

module.exports = createRideModel;
