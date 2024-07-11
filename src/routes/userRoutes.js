const express = require("express");
const router = express.Router();
const { createTeam, signup, getCoachTeam, verifyotp, login, forgetpassword, resetPassword, updateProfile } = require("../controllers/users.js");
const upload = require('../middleware/multer.js')
const authenticateToken = require('../middleware/AuthConfig.js')
const isCoach = require('../middleware/iscoach.js')

router.post("/signup", signup);
router.post("/create-team", authenticateToken, isCoach, createTeam);
router.post("/login", login);
router.post("/forget-password", forgetpassword);
router.post("/verify-otp", verifyotp);
router.post("/reset-password", resetPassword);
router.post("/update-Profile", authenticateToken, upload.single('profile'), updateProfile);
router.get('/team/:userId', authenticateToken, getCoachTeam);


// router.post("/logout", authenticateToken, logout);

module.exports = router