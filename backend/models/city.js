const mongoose = require("mongoose");

const city_Schema = new mongoose.Schema({
    country_id:{
        type: String,
        required:true
    },
    city:{
        type : String,
        unique:true,
        required:true
    },
    coordinates :{
        type: [],
        required:true
    }
});

const cityModel = mongoose.model("cityModel", city_Schema);


module.exports = cityModel;

