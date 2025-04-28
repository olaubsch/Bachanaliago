const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
  },
  qrcode: { type: String, unique: true },
  score: { type: Number, default: 10 },
});

module.exports = mongoose.model("Task", taskSchema);
