const User = require("../models/User");
const Group = require("../models/Group");

exports.login = async (req, res) => {
  const { nickname, groupCode } = req.body;

  try {
    // SZUKAMY GRUPY
    const group = await Group.findOne({ code: groupCode.toUpperCase() });
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }

    // SPRAWDZAMY LIMIT
    if (group.users.length >= 5) {
      console.log("Grupa pełna!");
      return res.status(400).json({ error: "Grupa pełna (max 5 osób)" });
    }

    // TWORZYMY USERA
    const user = await User.create({ nickname, groupCode });

    // DODAJEMY USERA DO GRUPY
    group.users.push(user._id);
    await group.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd logowania" });
  }
};
