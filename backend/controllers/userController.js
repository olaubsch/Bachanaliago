const User = require("../models/User");
const Group = require("../models/Group");

exports.login = async (req, res) => {
  const { nickname, groupCode } = req.body;

  try {
    const group = await Group.findOne({ code: groupCode.toUpperCase() });
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    const existingUser = await User.findOne({ nickname, groupCode: groupCode.toUpperCase() });
    if (existingUser) {
      return res.json(existingUser);
    }

    if (group.users.length >= 5) {
      console.log("Grupa pełna!");
      return res.status(400).json({ error: "Grupa pełna (max 5 osób)" });
    }

    try {
      const user = await User.create({ nickname, groupCode: groupCode.toUpperCase() });
      group.users.push(user._id);
      await group.save();
      res.json(user);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: "Nick already taken in this group" });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd logowania" });
  }
};

exports.quitFromGroup = async (req, res) => {
  const { nickname, groupCode } = req.body;

  try {
    const user = await User.findOne({ nickname, groupCode: groupCode.toUpperCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const group = await Group.findOne({ code: groupCode.toUpperCase() });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (user._id.toString() === group.owner.toString()) {
      const otherUsers = group.users.filter(u => u.toString() !== user._id.toString());
      if (otherUsers.length > 0) {
        const newOwnerIndex = Math.floor(Math.random() * otherUsers.length);
        group.owner = otherUsers[newOwnerIndex];
      } else {
        await Group.deleteOne({ code: groupCode.toUpperCase() });
        await User.deleteOne({ _id: user._id });
        return res.json({ message: "Group deleted as the last user quit" });
      }
    }

    group.users = group.users.filter(u => u.toString() !== user._id.toString());
    await group.save();

    await User.deleteOne({ _id: user._id });

    res.json({ message: "Successfully quit from group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error quitting from group" });
  }
};