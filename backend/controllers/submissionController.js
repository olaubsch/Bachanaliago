const TaskSubmission = require("../models/TaskSubmission");
const Task = require("../models/Task");
const Group = require("../models/Group");

exports.submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { groupCode } = req.body;
  const submissionData = req.file ? req.file.path : req.body.submissionData;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const group = await Group.findOne({ code: groupCode.toUpperCase() });
    if (!group) return res.status(404).json({ error: "Group not found" });

    let submission = await TaskSubmission.findOne({ task: taskId, group: group._id });

    if (task.type === 'qr') {
      if (submissionData !== task._id.toString()) return res.status(400).json({ error: "Invalid QR code" });
      if (submission && submission.status === 'approved') return res.status(400).json({ error: "Task already completed" });
      submission = submission || new TaskSubmission({ task: taskId, group: group._id, type: task.type });
      submission.submissionData = submissionData;
      submission.status = 'approved';
      await submission.save();
      group.score += task.score;
      await group.save();
      return res.json({ message: "Task completed successfully", points: task.score });
    } else {
      if (submission && submission.status === 'approved') return res.status(400).json({ error: "Task already completed" });
      submission = submission || new TaskSubmission({ task: taskId, group: group._id, type: task.type });
      submission.submissionData = submissionData;
      submission.status = 'pending';
      await submission.save();

      const io = req.app.get("io");
      io.emit("pendingSubmission");

      return res.json({ message: "Submission received, pending verification" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ status: 'pending' })
      .populate('task', 'name type')
      .populate('group', 'name');
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.verifySubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const submission = await TaskSubmission.findById(submissionId)
        .populate('task')
        .populate('group');

    if (!submission) return res.status(404).json({ error: "Submission not found" });
    if (submission.status !== 'pending') return res.status(400).json({ error: "Submission is not pending" });

    submission.status = status;
    submission.verifiedAt = new Date();
    await submission.save();

    if (status === 'approved') {
      submission.group.score += submission.task.score;
      await submission.group.save();
    }

    res.json({ message: `Submission ${status}` });

    const io = req.app.get("io");
    if (submission.group?.code) {
      io.to(submission.group.code).emit("refreshTasks");
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getGroupSubmissions = async (req, res) => {
  const { groupCode } = req.params;
  try {
    const group = await Group.findOne({ code: groupCode.toUpperCase() });
    if (!group) return res.status(404).json({ error: "Group not found" });
    const submissions = await TaskSubmission.find({ group: group._id }).populate('task');
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    console.log("Fetching all submissions...");

    const submissions = await TaskSubmission.find()
        .populate({ path: 'task', select: 'name type' })
        .populate({ path: 'group', select: 'name code score' }); // Optional: include more fields if needed

    console.log("Submissions fetched:", submissions.length);
    res.json(submissions);
  } catch (err) {
    console.error("Error in getAllSubmissions:", err);
    res.status(500).json({ error: "Server error" });
  }
};



