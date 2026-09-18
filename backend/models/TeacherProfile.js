const mongoose = require('mongoose')

const teacherProfileSchema = new mongoose.Schema(
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

const TeacherProfile = mongoose.model(
  'TeacherProfile',
  teacherProfileSchema
)

module.exports = TeacherProfile