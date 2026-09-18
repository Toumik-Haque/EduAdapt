const mongoose = require('mongoose')

const learnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

const LearnerProfile = mongoose.model(
  'LearnerProfile',
  learnerProfileSchema
)

module.exports = LearnerProfile