const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const upload = multer({ dest: 'uploads/' }); // Specify upload directory
const { createChallenge, getAllChallenges, requestToJoinChallenge, joinRequests, requestStatus, getNotificationsForUser } = require('../controllers/chalenges.js');
const isCoach = require('../middleware/iscoach.js');
const authenticateToken = require('../middleware/AuthConfig.js');

// Route for creating a challenge post
router.post('/create-post', authenticateToken, isCoach, upload.array('images', 5), createChallenge);
router.get('/all-challenges', authenticateToken, getAllChallenges);
router.post('/request-to-join', authenticateToken, requestToJoinChallenge);
router.get('/join-requests', authenticateToken, joinRequests);
router.post('/request-status/:joinRequestId', authenticateToken, isCoach, requestStatus);
router.get('/notifications', authenticateToken, getNotificationsForUser);


module.exports = router;
