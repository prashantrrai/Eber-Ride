const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    ridetimeout: {
        type: Number
     },

    stop: { 
        type: Number
    },
    EMAIL_USER: {},
    EMAIL_PASSWORD: {},
    accountSid: {},
    authToken: {},
    twilioPhoneNumber: {},
    STRIPE_Secret_key: {},
    STRIPE_Publishable_key: {}

})

const SettingModel = mongoose.model('SettingModel', settingSchema);

module.exports = SettingModel;