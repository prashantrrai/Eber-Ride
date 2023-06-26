//-----------------------------After adding country, city and service as object id-------------------------
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const priceSchema = new mongoose.Schema({
    country: {
        type: Schema.Types.ObjectId,
        required: true
    },
    city: {
        type: Schema.Types.ObjectId,
        required: true
    },
    service: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'vehicleModel'
    },
    driverprofit: {
        type: Number,
        required: true
    },
    minfare: {
        type: Number,
        required: true
    },
    distancebaseprice: {
        type: Number,
    },
    baseprice: {
        type: Number,
        required: true
    },
    ppudist: {
        type: Number,
        required: true
    },
    pputime: {
        type: Number,
        required: true
    },
    maxspace: {
        type: Number,
        required: true
    },
})

priceSchema.index({ city: 1, service: 1 }, { unique: true });
const pricingModel = mongoose.model("pricingModel", priceSchema)


module.exports = pricingModel;