const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  deleteTask,
  getTaskByQrCode,
} = require("../controllers/taskController");

router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:id", deleteTask);
router.get('/:qrcode', getTaskByQrCode);

module.exports = router;
