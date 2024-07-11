const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({


    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    groundName: {
        type: String,
        required: true
    },
    groundAddress: {
        type: String,
        required: true
    },
    matchStartTime: {
        type: Date,
        required: true
    },
    matchEndTime: {
        type: Date,
        required: true
    },
    numberOfPlayers: {
        type: Number,
        required: true
    },
    images: {
        type: [String], // Array of image paths
        default: []
    },

});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
