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
  const lang = req.query.lang || "pl";

  try {
    const tasks = await Task.find();

    const localized = tasks.map(task => ({
      _id: task._id,
      name: task.name?.get(lang) || task.name?.get("pl") || "Brak nazwy",
      description: task.description?.get(lang) || task.description?.get("pl") || "Brak opisu",
      location: task.location,
      score: task.score,
      type: task.type
    }));

    res.json(localized);
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
  const lang = req.query.lang || "pl";
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Zadanie nie znalezione" });
    }
    res.json({
      id: task._id,
      name: task.name?.get(lang) || task.name?.get("pl"),
      score: task.score,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};