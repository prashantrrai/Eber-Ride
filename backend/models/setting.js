const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    ridetimeout: {
        type: Number
     },

    stop: { 
        type: Number
    },
})

const SettingModel = mongoose.model('SettingModel', settingSchema);

module.exports = SettingModel;