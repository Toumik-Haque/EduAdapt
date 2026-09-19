const mongoose = require('mongoose')

const batchSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      trim: true
    },

    academicYear: {
      type: String,
      trim: true
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

module.exports = mongoose.model('Batch', batchSchema)