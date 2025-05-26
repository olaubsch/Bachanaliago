const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../utils/bannedWords.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Błąd odczytu pliku bannedWords:", err);
      return res.status(500).json({ error: "Nie udało się załadować słownika" });
    }

    try {
      const badWords = JSON.parse(data);
      res.json(badWords);
    } catch (e) {
      console.error("Błąd parsowania JSON:", e);
      res.status(500).json({ error: "Niepoprawny format JSON" });
    }
  });
});

module.exports = router;
