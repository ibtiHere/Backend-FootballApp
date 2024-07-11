const mongoose = require("mongoose");

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {

        });
        console.log('MongoDB connected');
    } catch (err) {
        console.log('MongoDB connection error:', err);
        // Optionally retry connecting after a delay
        setTimeout(dbconnect, 5000); // Retry after 5 seconds
    }

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, attempting to reconnect');
        dbconnect();
    });
};

module.exports = dbconnect;
