

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    identify: {
        type: String,
        required: true,

    },
    resetPasswordOTP: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },

});

module.exports = mongoose.model('OTP', otpSchema);
