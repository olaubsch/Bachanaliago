const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Group", groupSchema);
