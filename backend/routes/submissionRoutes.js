const express = require("express");
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const {
  submitTask,
  getPendingSubmissions,
  verifySubmission,
  getGroupSubmissions,
} = require("../controllers/submissionController");

router.post("/:taskId/submit", upload.single('file'), submitTask);
router.get("/pending", getPendingSubmissions);
router.post("/:submissionId/verify", verifySubmission);
router.get("/group/:groupCode", getGroupSubmissions);

module.exports = router;