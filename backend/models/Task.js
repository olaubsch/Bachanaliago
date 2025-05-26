const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
  },
  score: { type: Number, default: 10 },
  type: { type: String, enum: ['qr', 'text', 'photo', 'video'], required: true },
});

module.exports = mongoose.model("Task", taskSchema);