

const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OTPModel = require("../models/OTPmodel.js");
const usersModel = require("../models/usersModel.js");






// Signup endpoint
exports.signup = async (req, res) => {
    const { email, password, role } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Passwords Required" });
    }

    // Validate other required fields
    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const userData = {
            email,
            password: hashedPassword,
            role,
        };

        // Add role-specific details
        if (role === 'coach') {
            // No need to create `makeTeam` here, it will be created separately
        } else if (role === 'player') {
            // Handle player-specific details if needed
        }

        const user = new usersModel(userData);

        // Save the user to the database
        await user.save();

        // Optionally, generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d"
        });

        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: "Error creating user", error });
    }
};

// make team for coaches
exports.createTeam = async (req, res) => {
    const { email, teamName, players } = req.body;

    try {
        // Find the coach by email
        const coach = await usersModel.findOne({ email, role: 'coach' });
        if (!coach) {
            return res.status(404).json({ message: "Coach not found" });
        }

        // Create team for the coach
        coach.makeTeam = {
            teamName,
            players: [], // Initialize players array
        };

        // Add players to the team
        if (players && players.length > 0) {
            for (let player of players) {
                const { user, position } = player;
                coach.makeTeam.players.push({ user, position });
            }
        }

        // Save the coach with updated team
        await coach.save();

        res.status(200).json({ message: "Team created successfully", coach });
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: "Error creating team", error });
    }
};





// Login endpoint
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if passwords match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({
            userId: user._id, email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Return user object and token
        res.status(200).json({ user, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: "Error logging in", error });
    }
};



// Generate a 4-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}



// NodeMailer transport configuration
const transporter = nodemailer.createTransport({

    service: 'Gmail',
    port: 587,
    auth: {
        user: "ibtasamofficial@gmail.com",
        pass: "vcvk eepn jtsz rrsz",
    }
});

// Forget Password endpoint
exports.forgetpassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate OTP and set expiration time (e.g., 1 hour from now)
        const otp = generateOTP();
        const otpExpires = Date.now() + 3600000; // 1 hour in milliseconds


        // Save OTP to database
        const otps = new OTPModel({
            identify: user.email,
            resetPasswordOTP: otp,
            resetPasswordExpires: otpExpires,


        })
        await otps.save();


        // Send OTP via email
        const mailOptions = {
            from: "ibtasamofficial@gmail.com",
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };
        const mailcheck = await transporter.sendMail(mailOptions);
        console.log(mailcheck);

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        console.error('Error in forget password:', error);
        res.status(500).json({ message: "Error in forget password", error });
    }
};


exports.verifyotp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user by email and verify OTP
        const user = await OTPModel.findOne({
            identify: email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }, // Check if OTP is still valid
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid OTP or OTP has expired" });
        }

        // Clear OTP fields (optional: if OTP verification is successful, you might want to clear OTP fields immediately)
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error('Error in verifying OTP:', error);
        res.status(500).json({ message: "Error in verifying OTP", error });
    }
};




exports.resetPassword = async (req, res) => {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        // Find user by email
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error('Error in resetting password:', error);
        res.status(500).json({ message: "Error in resetting password", error });
    }
};



// Update Name and Upload Image endpoint
exports.updateProfile = async (req, res) => {
    const { email } = req.body;
    try {
        // Find user by email
        const user = await usersModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update name and image
        if (req.file) {
            user.profile = req.file.filename;
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error in updating profile:', error);
        res.status(500).json({ message: 'Error in updating profile', error });
    }
};


// Backend API endpoint to fetch team details for a logged-in coach
exports.getCoachTeam = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch coach's details including team data
        const coach = await usersModel
            .findById(userId) // Find coach by user ID
            .populate({
                path: 'makeTeam.players.user', // Populate the 'user' field in 'makeTeam.players'
                select: 'email position', // Select the fields to populate
            });

        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Return coach's team data
        res.status(200).json({ team: coach.makeTeam });
    } catch (error) {
        console.error('Error fetching coach team:', error);
        res.status(500).json({ message: 'Error fetching coach team', error });
    }
};