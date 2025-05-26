const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const { name, description, location, score, type } = req.body;
  try {
    const task = await Task.create({
      name,
      description,
      location,
      score,
      type,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Nie udało się stworzyć taska", details: err });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania tasków" });
  }
};

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
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Zadanie nie znalezione" });
    }
    res.json({
      id: task._id,
      name: task.name,
      score: task.score,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};