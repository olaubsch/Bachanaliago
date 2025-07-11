const Task = require("../models/Task");
const fs = require('fs');
const path = require('path');

exports.createTask = async (req, res) => {
  let { name, description, location, score, type } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    if (typeof name === 'string') name = JSON.parse(name);
    if (typeof description === 'string') description = JSON.parse(description);
    if (typeof location === 'string') location = JSON.parse(location);

    const task = await Task.create({
      name,
      description,
      location,
      score,
      type,
      image,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Nie udało się stworzyć taska", details: err });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();

    const localized = tasks.map(task => {
      let base64Image = null;

      if (task.image) {
        const relativePath = task.image.replace(/\\/g, '/'); // Normalize slashes
        const imagePath = path.join(__dirname, '..', relativePath); // Adjust if needed

        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const mimeType = getMimeType(imagePath); // Optional, see below
          base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      }

      return {
        _id: task._id,
        name: {
          pl: task.name?.get("pl") || "Brak nazwy",
          en: task.name?.get("en") || "No name"
        },
        description: {
          pl: task.description?.get("pl") || "Brak opisu",
          en: task.description?.get("en") || "No description"
        },
        location: task.location,
        score: task.score,
        type: task.type,
        image: base64Image,
      };
    });

    res.json(localized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd pobierania tasków" });
  }
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  let { name, description, location, score, type } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    if (typeof name === 'string') name = JSON.parse(name);
    if (typeof description === 'string') description = JSON.parse(description);
    if (typeof location === 'string') location = JSON.parse(location);

    const updateData = { name, description, location, score, type };
    if (image) updateData.image = image;

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Nie znaleziono taska" });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: "Błąd podczas aktualizacji taska", details: err });
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