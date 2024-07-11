const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./src/config/db.js");
const usersRoutes = require("./src/routes/userRoutes.js");
const challengesRoutes = require("./src/routes/challengesRoutes.js");


// middleware
dotenv.config();
const app = express();
app.use(express.json());
app.use("/images", express.static("images"));

// MongoDB connection
dbconnect()

// Routes

app.use("/users", usersRoutes);
app.use("/challenges", challengesRoutes);








const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
