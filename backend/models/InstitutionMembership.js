const mongoose = require('mongoose')

const institutionMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null
    },

    role: {
      type: String,
      required: true,
      enum: [
        'learner',
        'teacher'
      ]
    },

    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'approved',
        'rejected'
      ],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

institutionMembershipSchema.index(
  {
    userId: 1,
    institutionId: 1,
    batchId: 1
  },
  {
    unique: true
  }
)

const InstitutionMembership = mongoose.model(
  'InstitutionMembership',
  institutionMembershipSchema
)

module.exports = InstitutionMembership