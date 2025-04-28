const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nickname: String,
  groupCode: String,
});

userSchema.index({ nickname: 1, groupCode: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);