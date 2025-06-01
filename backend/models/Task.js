const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true,
  },
  description: {
    type: Map,
    of: String,
    required: true,
  },
  location: {
    lat: Number,
    lng: Number,
  },
  score: { type: Number, default: 10 },
  type: { type: String, enum: ['qr', 'text', 'photo', 'video'], required: true },
  image: { type: String },
});

module.exports = mongoose.model("Task", taskSchema);