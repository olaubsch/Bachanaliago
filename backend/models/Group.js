const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tasksCompleted: { type: Number, default: 0 }
});

module.exports = mongoose.model("Group", groupSchema);
