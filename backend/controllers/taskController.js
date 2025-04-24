const Task = require("../models/Task");

// Tworzenie taska (admin)
exports.createTask = async (req, res) => {
  const { name, description, location } = req.body;
  try {
    const task = await Task.create({
      name,
      description,
      location,
    });
    res.status(201).json(task);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Nie udało się stworzyć taska", details: err });
  }
};

// Pobieranie wszystkich tasków (wszyscy gracze widzą te same)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania tasków" });
  }
};

// Usuwanie taska (admin)
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task usunięty" });
  } catch (err) {
    res.status(500).json({ error: "Błąd usuwania taska" });
  }
};
