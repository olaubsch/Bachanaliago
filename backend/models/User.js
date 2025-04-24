const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nickname: String,
  groupCode: String,
});

module.exports = mongoose.model("User", userSchema);
