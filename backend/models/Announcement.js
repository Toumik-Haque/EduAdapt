const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    senderType: {
      type: String,
      enum: ['institute', 'teacher'],
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      default: 'Instructor'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'learners', 'teachers', 'batch'],
      default: 'all'
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Announcement', announcementSchema)
