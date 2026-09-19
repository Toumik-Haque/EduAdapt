const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      trim: true,
      uppercase: true
    },

    description: {
      type: String,
      trim: true
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

module.exports = mongoose.model('Subject', subjectSchema)