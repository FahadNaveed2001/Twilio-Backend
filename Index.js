//dep imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//files imports
const connectDB = require("./config/mongoconnection");
const {
  verifyToken,
  routesWithoutToken,
} = require("./middlewares/authmiddleware");
const { userLogin } = require("./userroutes/userlogin");
const User = require("./models/usermodel");
//app and port
const app = express();
const PORT = process.env.PORT || 8000;

//db connection
connectDB();

app.use(
  cors({
    origin: [
      "*",
      // "https://zap70.com",
      // "http://localhost:3000",
      // "http://167.71.95.212:3000",
      // "http://165.232.134.133:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

//middlewares
app.use((req, res, next) => {
  if (routesWithoutToken.includes(req.path)) {
    next();
  } else {
    verifyToken(req, res, next);
  }
});

//root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    success: true,
    message: "Twilio Server is running!",
  });
  console.log("Root route accessed");
});


app.post("/admin-login", async (req, res) => {
  userLogin(req, res);
});


app.post("/add-user", async (req, res) => {
  try {
    const { phone, status } = req.body;
    const newUser = new User({
      phone,
      status,
    });
    await newUser.save();
    console.log(newUser),
    res.status(201).json({
      status: "success",
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error),
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to add user",
    });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Twilio users fetched successfully",
      Users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error); 
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to fetch users",
    });
  }
});

app.post("/log-data", (req, res) => {
  console.log("Received data:", req.body);
  res.status(200).json({
    status: "success",
    success: true,
    message: "Data received and logged successfully",
    data: req.body,
  });
});

//server
app.listen(PORT, () => {
  console.log("==================================");
  console.log(`Server is running on port ${PORT}`);
});
