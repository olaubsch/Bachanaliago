const express = require("express");
const router = express.Router();
const { login, quitFromGroup } = require("../controllers/userController");

router.post("/login", login);
router.delete("/quit", quitFromGroup);

module.exports = router;