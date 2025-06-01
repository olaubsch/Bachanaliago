console.log("Router /api/groups załadowany");
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
  updateGroupScore,
  enableGroupCreation,
  disableGroupCreation
} = require("../controllers/groupController");
const Setting = require("../models/Setting");

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
router.post("/settings/enableGroupCreation", enableGroupCreation);
router.post("/settings/disableGroupCreation", disableGroupCreation);
router.get("/settings/groupCreationEnabled", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "groupCreationEnabled" });
    if (setting) {
      res.json({ enabled: setting.value });
    } else {
      res.json({ enabled: true }); // Default to true if not set
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching setting" });
  }
});

module.exports = router;
