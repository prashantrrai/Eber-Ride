const mongoose = require("mongoose");
const { Schema } = mongoose;

const city_Schema = new mongoose.Schema({
    country_id:{
        type: Schema.Types.ObjectId,
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

