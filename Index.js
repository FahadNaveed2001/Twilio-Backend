//dep imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require('twilio');

//files imports
const connectDB = require("./config/mongoconnection");
const {
  verifyToken,
  routesWithoutToken,
} = require("./middlewares/authmiddleware");
const { userLogin } = require("./userroutes/userlogin");
const User = require("./models/usermodel");
// const Settings = require("./models/smssettingsmodal");
const smsSettings = require("./models/smssettingsmodal");
const callSettings = require("./models/callsettingsmodel");
//app and port
const app = express();
const PORT = process.env.PORT || 8000;

//db connection
connectDB();

app.use(
  cors({
    origin: [
      "*",
      "https://zap70.com",
      "http://localhost:3000",
      "http://167.71.95.212:3000",
      "http://165.232.134.133:3000",
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
    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      existingUser.status = status;
      // existingUser.numberOfCall += 1; 
      existingUser.date = Date.now();
      await existingUser.save();
      res.status(200).json({
        status: "success",
        success: true,
        message: "User updated successfully",
        data: existingUser,
      });
    } else {
      const newUser = new User({
        phone,
        status,
      });
      await newUser.save();
      res.status(201).json({
        status: "success",
        success: true,
        message: "User added successfully",
        data: newUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server Eoor",
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


app.post("/api/add-sms", async (req, res) => {
  try {
    const { textMessage } = req.body;
    // await Settings.findOneAndDelete({});
    const newSettings = new smsSettings({
      textMessage,
      // numberOfUsers,
      // numberOfDays,
    });
    await newSettings.save();
    // console.log(newSettings);
    res.status(201).json({
      status: "success",
      success: true,
      message: "Settings added successfully",
      data: newSettings,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to add Settings",
    });
  }
});

app.get("/api/sms", async (req, res) => {
  try {
    const users = await smsSettings.find();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Twilio Settings fetched successfully",
      Settings: users,
    });
  } catch (error) {
    // console.error("Error fetching users:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to fetch Settings",
    });
  }
});

app.delete("/api/sms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSetting = await smsSettings.findByIdAndDelete(id);
    if (!deletedSetting) {
      return res.status(404).json({
        status: "error",
        message: "SMS not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "SMS deleted successfully",
      // deletedSetting: deletedSetting,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to delete SMS",
    });
  }
});

app.post("/api/add-call", async (req, res) => {
  try {
    const { numberOfCallsPerHour } = req.body;
    await callSettings.findOneAndDelete({});
    const newSettings = new callSettings({
      numberOfCallsPerHour,
    });
    await newSettings.save();
    // console.log(newSettings);
    res.status(201).json({
      status: "success",
      success: true,
      message: "Number of calls added successfully",
      data: newSettings,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to add Number of calls",
    });
  }
});

app.get("/api/call", async (req, res) => {
  try {
    const users = await callSettings.find();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Twilio Call Settings fetched successfully",
      Settings: users,
    });
  } catch (error) {
    // console.error("Error fetching users:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to fetch call Settings",
    });
  }
});

// app.post("/log-data", (req, res) => {
//   console.log("Received data:", req.body);
//   res.status(200).json({
//     status: "success",
//     success: true,
//     message: "Data received and logged successfully",
//     data: req.body,
//   });
// });
//server
app.listen(PORT, () => {
  console.log("==================================");
  console.log(`Server is running on port ${PORT}`);
});
