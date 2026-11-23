const mongoose = require('mongoose')

const individualCourseSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels'
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      default: 0
    },
    thumbnail: {
      type: String,
      default: ''
    },
    enrollmentCode: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        },
        progress: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('IndividualCourse', individualCourseSchema)
