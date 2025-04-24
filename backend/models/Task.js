const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model("Task", taskSchema);
