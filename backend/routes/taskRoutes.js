const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/supporters/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskByQrCode,
} = require("../controllers/taskController");

router.post("/", upload.single("image"), createTask);
router.get("/", getTasks);
router.put("/:id", upload.single("image"), updateTask);
router.delete("/:id", deleteTask);
router.get("/:id", getTaskByQrCode);

module.exports = router;