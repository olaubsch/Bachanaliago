const User = require("../models/User");

exports.login = async (req, res) => {
  const { nickname, groupCode } = req.body;
  const user = await User.create({ nickname, groupCode });
  res.json(user);
};
