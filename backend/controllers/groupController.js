const Group = require("../models/Group");
const User = require("../models/User");

exports.createGroup = async (req, res) => {
  const { name, ownerNickname } = req.body;

  if (!name || !ownerNickname) {
    return res.status(400).json({ error: "Brak nazwy grupy lub nicku właściciela" });
  }

  let code;
  let existing;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    existing = await Group.findOne({ code });
  } while (existing);

  try {
    const owner = await User.create({ nickname: ownerNickname, groupCode: code });
    const group = await Group.create({ name, code, owner: owner._id, users: [owner._id], score: 0 });
    res.status(201).json({ group, user: owner });
  } catch (err) {
    console.error("Błąd Mongo:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Nick already taken in this group" });
    }
    res.status(400).json({ error: "Błąd tworzenia grupy" });
  }
};

exports.getGroupByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const group = await Group.findOne({ code }).populate('owner').populate('users');
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }
    // Remove null users and save to database
    const originalLength = group.users.length;
    group.users = group.users.filter(user => user);
    if (group.users.length !== originalLength) {
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania grupy" });
  }
};

exports.addScoreToGroup = async (req, res) => {
  const { code } = req.params;
  const { points, taskId } = req.body; // ile punktów chcemy dodać

  if (typeof points !== 'number') {
    return res.status(400).json({ error: "Nieprawidłowa wartość punktów" });
  }

  try {
    const group = await Group.findOne({ code });

    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    if (group.completedTasks.some(id => id.toString() === taskId)) {
      return res.status(400).json({ error: "Zadanie już zostało wykonane przez tę grupę" });
    }

    group.completedTasks.push(taskId);
    group.score += points;
    await group.save();


    res.json({ message: "Dodano punkty", newScore: group.score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd aktualizacji punktów" });
  }
};

exports.getScore = async (req, res) => {
  const { code } = req.params;
  try {
    // Znajdujemy grupę po kodzie
    const group = await Group.findOne({ code });

    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    // Zwracamy tylko wynik grupy
    res.json({ score: group.score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd pobierania wyniku grupy" });
  }
};


exports.getLeaderboard = async (req, res) => {
  try {
    const groups = await Group.find()
      .sort({ tasksCompleted: -1 })
      .select("name code score tasksCompleted");

    //console.log("Pobrane grupy:", groups); // <-- TO DODAJ

    res.json(groups);
  } catch (err) {
    console.error("Błąd pobierania leaderboarda:", err);
    res.status(500).json({ error: "Błąd pobierania leaderboarda" });
  }
};

exports.removeUserFromGroup = async (req, res) => {
  const { groupCode, requesterNickname, userIdToRemove } = req.body;

  try {
    const group = await Group.findOne({ code: groupCode }).populate('owner').populate('users');
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    const requester = group.users.find(user => user.nickname === requesterNickname);
    if (!requester) {
      return res.status(403).json({ error: "Requester not found in group" });
    }

    if (requester._id.toString() !== group.owner._id.toString()) {
      return res.status(403).json({ error: "Only the owner can remove users" });
    }

    const userToRemove = group.users.find(user => user._id.toString() === userIdToRemove);
    if (!userToRemove) {
      return res.status(404).json({ error: "User to remove not found in group" });
    }

    if (userToRemove._id.toString() === group.owner._id.toString()) {
      return res.status(400).json({ error: "Cannot remove the owner" });
    }

    group.users = group.users.filter(user => user._id.toString() !== userIdToRemove);
    await group.save();
    await User.deleteOne({ _id: userIdToRemove });

    res.json({ message: "User removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error removing user" });
  }
};

exports.transferOwnership = async (req, res) => {
  const { groupCode, requesterNickname, newOwnerId } = req.body;

  try {
    const group = await Group.findOne({ code: groupCode }).populate('owner').populate('users');
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    const requester = group.users.find(user => user.nickname === requesterNickname);
    if (!requester) {
      return res.status(403).json({ error: "Requester not found in group" });
    }

    if (requester._id.toString() !== group.owner._id.toString()) {
      return res.status(403).json({ error: "Only the owner can transfer ownership" });
    }

    const newOwner = group.users.find(user => user._id.toString() === newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ error: "New owner not found in group" });
    }

    group.owner = newOwner._id;
    await group.save();

    res.json({ message: "Ownership transferred successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error transferring ownership" });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupCode, requesterNickname } = req.body;

  try {
    const group = await Group.findOne({ code: groupCode }).populate('owner');
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    const requester = await User.findOne({ nickname: requesterNickname, groupCode });
    if (!requester) {
      return res.status(403).json({ error: "Requester not found" });
    }

    if (requester._id.toString() !== group.owner._id.toString()) {
      return res.status(403).json({ error: "Only the owner can delete the group" });
    }

    await User.deleteMany({ groupCode });
    await Group.deleteOne({ code: groupCode });

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting group" });
  }
};
