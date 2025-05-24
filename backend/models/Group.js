const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  score: { type: Number, default: 0 },
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tasksCompleted: { type: Number, default: 0 },
  hasPlayedSlots: { type: Boolean, default: false }
});

module.exports = mongoose.model("Group", groupSchema);