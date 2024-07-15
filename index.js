const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./src/config/db.js");
const usersRoutes = require("./src/routes/userRoutes.js");
const challengesRoutes = require("./src/routes/challengesRoutes.js");
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// middleware
const app = express();
const server = http.createServer(app);
dotenv.config();
app.use(express.json());
app.use("/images", express.static("images"));
app.use(express.static('public'));
app.use("/uploads", express.static("uploads"));



const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }

});

app.use(cors());



// MongoDB connection
dbconnect()

// Routes

app.use("/users", usersRoutes);
app.use("/challenges", challengesRoutes);

// chats


io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    socket.on("message", ({ room, message }) => {
        console.log({ room, message });
        socket.to(room).emit("receive-message", message);
    });

    // socket.on("join-room", (room) => {
    //     socket.join(room);
    //     console.log(`User joined room ${room}`);
    // });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});





const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
