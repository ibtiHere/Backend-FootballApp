const mongoose = require("mongoose");

const usersModelSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['coach', 'player'],
        required: true,
    },

    // Additional fields specific to each role
    makeTeam: {
        type: {
            teamName: String,
            players: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'usersModel',
                    required: true,
                },

                position: {
                    type: String,
                    required: true,
                },
            }],
        }
    }

});

module.exports = mongoose.model("usersModel", usersModelSchema);
