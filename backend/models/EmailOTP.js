const mongoose = require('mongoose')

const emailOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    otpHash: {
      type: String,
      required: true
    },

    purpose: {
      type: String,
      required: true,
      enum: [
        'registration',
        'email_change',
        'password_reset'
      ]
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

const EmailOTP = mongoose.model(
  'EmailOTP',
  emailOTPSchema
)

module.exports = EmailOTP