const express = require('express')
const protect = require('../middleware/authMiddleware')
const Notification = require('../models/Notification')
const InstitutionMembership = require('../models/InstitutionMembership')

const router = express.Router()

// Get notifications for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.userId
    })
      .populate('senderId', 'name email username accountType')
      .populate('institutionId', 'name email username accountType')
      .populate('batchId', 'name department academicYear')
      .sort({ createdAt: -1 })
      .limit(30)

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.userId,
      status: 'unread'
    })

    res.json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (err) {
    console.error('Fetch notifications error:', err)
    res.status(500).json({ success: false, message: 'Server error fetching notifications' })
  }
})

// Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { status: 'read' },
      { new: true }
    )
    res.json({ success: true, notification: notif })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.userId, status: 'unread' },
      { status: 'read' }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Accept invitation
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.userId
    })

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    if (notif.type === 'batch_invitation' && notif.batchId) {
      // Find or create approved membership
      let membership = await InstitutionMembership.findOne({
        institutionId: notif.institutionId,
        batchId: notif.batchId,
        userId: req.user.userId
      })

      if (membership) {
        membership.status = 'approved'
        await membership.save()
      } else {
        await InstitutionMembership.create({
          institutionId: notif.institutionId,
          batchId: notif.batchId,
          userId: req.user.userId,
          role: req.user.accountType === 'teacher' ? 'teacher' : 'learner',
          status: 'approved'
        })
      }

      notif.status = 'accepted'
      await notif.save()

      return res.json({
        success: true,
        message: 'Invitation accepted! You have joined the batch.',
        batchId: notif.batchId
      })
    }

    notif.status = 'read'
    await notif.save()
    res.json({ success: true, message: 'Notification marked as handled' })
  } catch (err) {
    console.error('Accept invitation error:', err)
    res.status(500).json({ success: false, message: 'Server error accepting invitation' })
  }
})

// Decline invitation
router.post('/:id/decline', protect, async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.userId
    })

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    notif.status = 'declined'
    await notif.save()

    // Keep InstitutionMembership status in sync with declined invitation
    if (notif.type === 'batch_invitation' && notif.batchId) {
      await InstitutionMembership.updateMany(
        {
          institutionId: notif.institutionId,
          batchId: notif.batchId,
          userId: req.user.userId,
          role: 'teacher',
          status: 'pending'
        },
        { status: 'rejected' }
      )
    }

    res.json({ success: true, message: 'Invitation declined' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error declining invitation' })
  }
})

module.exports = router
