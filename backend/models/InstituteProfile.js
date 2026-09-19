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
    },

    profilePhoto: {
      url: {
        type: String,
        default: ''
      },
      publicId: {
        type: String,
        default: ''
      }
    },

    coverPhoto: {
      url: {
        type: String,
        default: ''
      },
      publicId: {
        type: String,
        default: ''
      }
    },

    about: {
      type: String,
      trim: true,
      default: ''
    },

    contact: {
      phone: {
        type: String,
        trim: true,
        default: ''
      }
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: ''
      },
      city: {
        type: String,
        trim: true,
        default: ''
      },
      state: {
        type: String,
        trim: true,
        default: ''
      },
      country: {
        type: String,
        trim: true,
        default: 'India'
      }
    },

    website: {
      type: String,
      trim: true,
      default: ''
    },

    socialLinks: {
      facebook: {
        type: String,
        trim: true,
        default: ''
      },
      instagram: {
        type: String,
        trim: true,
        default: ''
      },
      linkedin: {
        type: String,
        trim: true,
        default: ''
      },
      youtube: {
        type: String,
        trim: true,
        default: ''
      }
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