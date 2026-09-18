const mongoose = require('mongoose')

const instituteProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    instituteName: {
      type: String,
      required: true,
      trim: true
    },

    instituteType: {
      type: String,
      required: true,
      enum: [
        'school',
        'college',
        'university',
        'coaching',
        'other'
      ]
    }
  },
  {
    timestamps: true
  }
)

const InstituteProfile = mongoose.model(
  'InstituteProfile',
  instituteProfileSchema
)

module.exports = InstituteProfile