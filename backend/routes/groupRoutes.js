const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroupByCode,
  removeUserFromGroup,
  transferOwnership,
  deleteGroup,
  getLeaderboard,
  incrementTasksCompleted
} = require("../controllers/groupController");

router.post("/", createGroup);
router.get("/leaderboard", getLeaderboard);
router.get("/:code", getGroupByCode);
router.post("/removeUser", removeUserFromGroup);
router.post("/transferOwnership", transferOwnership);
router.post("/deleteGroup", deleteGroup);

module.exports = router;