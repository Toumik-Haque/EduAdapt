const express = require('express')

const {
  createSubject,
  getBatchSubjects
} = require('../controllers/subjectController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Create subject inside a batch
router.post('/', protect, createSubject)

// Get subjects of a batch
router.get('/batch/:batchId', protect, getBatchSubjects)

module.exports = router