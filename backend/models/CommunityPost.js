const mongoose = require('mongoose')

const communityPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorUsername: {
      type: String,
      default: ''
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      enum: ['learner', 'teacher', 'institute'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Question & Doubt', 'Study Resource', 'Project Showcase', 'Discussion', 'Achievement'],
      default: 'Discussion'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        authorUsername: {
          type: String,
          default: ''
        },
        authorName: {
          type: String,
          required: true
        },
        authorRole: {
          type: String,
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('CommunityPost', communityPostSchema)
