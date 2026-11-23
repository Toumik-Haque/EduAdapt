const express = require('express')
const protect = require('../middleware/authMiddleware')
const {
  createAnnouncement,
  getMyAnnouncements,
  deleteAnnouncement
} = require('../controllers/announcementController')

const router = express.Router()

router.post('/', protect, createAnnouncement)
router.get('/', protect, getMyAnnouncements)
router.delete('/:id', protect, deleteAnnouncement)

module.exports = router
