const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Setting", settingSchema);