const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:id", deleteTask);

module.exports = router;
