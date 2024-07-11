
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const joinRequestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'usersModel', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;
