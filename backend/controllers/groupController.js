const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  console.log("Request body:", req.body);

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Brak nazwy grupy" });
  }

  let code;
  let existing;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-znakowy kod
    existing = await Group.findOne({ code }); // sprawdzamy, czy już jest taki kod
  } while (existing);

  try {
    const group = await Group.create({ name, code });
    res.status(201).json(group);
  } catch (err) {
    console.error("Błąd Mongo:", err); // <-- log błędu
    res.status(400).json({ error: "Błąd tworzenia grupy" });
  }
};

exports.getGroupByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const group = await Group.findOne({ code }).populate('users');;
    if (!group) {
      return res.status(404).json({ error: "Grupa nie znaleziona" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania grupy" });
  }
};
