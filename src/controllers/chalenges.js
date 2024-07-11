const Challenge = require('../models/chalengesModel.js');
const joinRequestSchema = require('../models/requestModel.js');
const usersModel = require('../models/usersModel.js');
exports.createChallenge = async (req, res) => {
    const {

        title,
        description,
        price,
        date,
        organizerName,
        groundName,
        groundAddress,
        matchStartTime,
        matchEndTime,
        numberOfPlayers
    } = req.body;

    try {


        // Parse matchStartTime and matchEndTime to Date objects
        const parsedStartTime = new Date(matchStartTime);
        const parsedEndTime = new Date(matchEndTime);

        const newChallenge = new Challenge({
            title,
            description,
            price,
            date,
            organizerName,
            groundName,
            groundAddress,
            matchStartTime: parsedStartTime,
            matchEndTime: parsedEndTime,
            numberOfPlayers,
        });

        // Handle file uploads if images are included
        if (req.files && req.files.length > 0) {
            newChallenge.images = req.files.map(file => file.path); // Store image paths
        }

        await newChallenge.save();

        res.status(201).json({ message: 'Challenge post created successfully', challenge: newChallenge });
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Error creating challenge', error: error.message });
    }
};

exports.getAllChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find();
        res.status(200).json({ message: 'Challenges fetched successfully', challenges });
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ message: 'Error fetching challenges', error: error.message });
    }
}
exports.requestToJoinChallenge = async (req, res) => {
    const { challengeId } = req.body;
    const userId = req.user.userId;
    console.log("....", challengeId, req.user);
    try {
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const newJoinRequest = new joinRequestSchema({ userId, challengeId });
        await newJoinRequest.save();

        // Notify the organizer (For simplicity, logging to the console)
        const organizer = await usersModel.findOne({ name: challenge.organizerName });
        console.log(`Notification: User ${req.user.userId} requested to join your challenge: ${challenge.title}`);


        res.status(201).json({ message: 'Request to join challenge submitted successfully', joinRequest: newJoinRequest });
    } catch (error) {
        console.error('Error submitting join request:', error);
        res.status(500).json({ message: 'Error submitting join request', error: error.message });
    }
};

exports.joinRequests = async (req, res) => {
    try {
        const coachId = req.user.userId;

        const notifications = await joinRequestSchema.find({}).populate('userId');

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.requestStatus = async (req, res) => {
    try {
        const { status } = req.body; // Status can be 'accepted' or 'rejected'
        const joinRequestId = req.params.joinRequestId;

        console.log('Join request ID:', joinRequestId);

        // Check if join request exists
        const joinRequest = await joinRequestSchema.findById(joinRequestId);
        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        // Ensure the coach is authorized to update this join request
        const coachId = req.user.userId;
        console.log('Coach ID:', coachId);

        const challenge = await Challenge.findById(joinRequest.challengeId);

        console.log('Challenge:', challenge);

        // if (!challenge || challenge.organizerId.toString() !== coachId.toString()) {
        //     return res.status(403).json({ message: 'Unauthorized to update this join request' });
        // }

        // Update join request status
        joinRequest.status = status;
        await joinRequest.save();

        // Notify the user who requested to join
        const user = await usersModel.findById(joinRequest.userId); // Assuming User is another schema/model
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare notification message
        let notificationMessage = '';
        if (status === 'approved') {
            notificationMessage = `Your request to join challenge "${challenge.title}" has been accepted.`;
        } else if (status === 'rejected') {
            notificationMessage = `Your request to join challenge "${challenge.title}" has been rejected.`;
        }

        // For simplicity, you can log the notification or send it via a real notification service (e.g., email, push notification)
        console.log(`Notification sent to user ${user.userId}: ${notificationMessage}`);

        res.status(200).json({ message: 'Join request status updated successfully', joinRequest });
    } catch (error) {
        console.error('Error updating join request status:', error);
        res.status(500).json({ message: 'Error updating join request status', error: error.message });
    }
};

exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming user ID is available in req.user

        console.log('User ID:', userId,);
        // Fetch notifications for the user
        const notifications = await joinRequestSchema.find({ userId }).populate('challengeId');
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

