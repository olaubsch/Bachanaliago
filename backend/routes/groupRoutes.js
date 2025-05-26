const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroupByCode,
  removeUserFromGroup,
  transferOwnership,
  deleteGroup,
  getLeaderboard,
  incrementTasksCompleted,
  addScoreToGroup,
  getScore,
  playSlots,
  updateGroupScore
} = require("../controllers/groupController");

router.post("/", createGroup);
router.get("/leaderboard", getLeaderboard);
router.get("/:code", getGroupByCode);
router.post('/:code/score', addScoreToGroup);
router.get('/:code/score', getScore);
router.post("/removeUser", removeUserFromGroup);
router.post("/transferOwnership", transferOwnership);
router.post("/deleteGroup", deleteGroup);
router.post('/:code/play-slots', playSlots);
router.post('/:code/update-score', updateGroupScore);

module.exports = router;