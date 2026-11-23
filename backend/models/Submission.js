const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    grade: {
      type: String,
      trim: true
    },
    feedback: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'resubmission_requested'],
      default: 'submitted'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Submission', submissionSchema)
