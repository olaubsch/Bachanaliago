const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  type: { type: String, enum: ['qr', 'text', 'photo', 'video'], required: true },
  submissionData: { type: String }, // Text content or file path
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

taskSubmissionSchema.index({ group: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('TaskSubmission', taskSubmissionSchema);
