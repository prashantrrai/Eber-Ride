const mongoose = require("mongoose");


const city_model = new mongoose.Schema({
    countryid: {
        type: String,
        required: true
    },
    countryName: {
        type: String,
        required: true
    },
    cityName: {
        type: String,
        required: true
    },
    coordinates: {
        type: object,
        required: true
    }
});

const City_Schema = mongoose.model("City_Schema", city_model);  //mapping vehicle_model data into vehicle_data


module.exports = City_Schema;

