const mongoose = require("mongoose");

const settingsScehma = new mongoose.Schema({
  textMessage: {
    type: String,
    required: true,
  },
  numberOfUsers: {
    type: Number,
    required: true,
  },
  numberOfCalls: {
    type: Number,
    required: true,
  },
});

const Settings = mongoose.model("Twilio-settings", settingsScehma);
module.exports = Settings;
