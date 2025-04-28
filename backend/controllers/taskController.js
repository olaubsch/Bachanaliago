const Task = require("../models/Task");

// Tworzenie taska (admin)
exports.createTask = async (req, res) => {
  const { name, description, location, score, qrcode } = req.body;
  try {
    const task = await Task.create({
      name,
      description,
      location,
      score,
      qrcode,
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

exports.getTaskByQrCode = async (req, res) => {
  const { qrcode } = req.params;

  try {
    const task = await Task.findOne({ qrcode }); // zakładam, że w modelu Task masz pole qrCode

    if (!task) {
      return res.status(404).json({ error: "Zadanie nie znalezione" });
    }

    res.json({
      id: task._id,
      name: task.name,
      score: task.score, // zakładam, że zadanie ma pole `points`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
