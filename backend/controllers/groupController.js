const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  const { name, code } = req.body;
  try {
    const group = await Group.create({ name, code });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: "Kod grupy musi być unikalny." });
  }
};
