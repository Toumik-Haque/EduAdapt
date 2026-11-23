const Announcement = require('../models/Announcement')
const InstitutionMembership = require('../models/InstitutionMembership')

// Post an announcement (Institute Admin or Teacher)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience = 'all', institutionId, batchId, pinned = false } = req.body

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      })
    }

    if (req.user.accountType === 'learner') {
      return res.status(403).json({
        success: false,
        message: 'Learners cannot publish announcements'
      })
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      senderType: req.user.accountType,
      senderId: req.user.userId,
      senderName: req.user.name || 'Staff',
      targetAudience,
      institutionId: institutionId || (req.user.accountType === 'institute' ? req.user.userId : undefined),
      batchId,
      pinned
    })

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      announcement
    })
  } catch (error) {
    console.error('Create announcement error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    })
  }
}

// Get announcements relevant to the logged-in user
const getMyAnnouncements = async (req, res) => {
  try {
    const { institutionId } = req.query
    let query = {}

    if (institutionId) {
      query.institutionId = institutionId
    }

    const announcements = await Announcement.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(20)

    res.json({
      success: true,
      announcements
    })
  } catch (error) {
    console.error('Get announcements error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    })
  }
}

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Announcement.findById(id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' })
    }

    if (item.senderId.toString() !== req.user.userId && req.user.accountType !== 'institute') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    await Announcement.findByIdAndDelete(id)
    res.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  createAnnouncement,
  getMyAnnouncements,
  deleteAnnouncement
}
