const express = require("express");
const router = express.Router();
const { createGroup } = require("../controllers/groupController");
const { getGroupByCode } = require("../controllers/groupController");

router.post("/", createGroup);
router.get("/:code", getGroupByCode);

module.exports = router;
