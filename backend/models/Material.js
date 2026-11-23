const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['note', 'document', 'assignment', 'video', 'link'],
      default: 'document'
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    linkUrl: {
      type: String,
      trim: true
    },
    // Context: either 'institution' or 'individual'
    contextType: {
      type: String,
      enum: ['institution', 'individual'],
      default: 'institution'
    },
    // For institution context:
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    // For individual teacher context:
    individualCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndividualCourse'
    },
    // Due date for assignments
    dueDate: {
      type: Date
    },
    points: {
      type: Number,
      default: 100
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Material', materialSchema)
