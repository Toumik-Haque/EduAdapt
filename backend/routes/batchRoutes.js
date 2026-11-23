const express = require('express')

const {
  createBatch,
  getMyBatches,
  getInstitutionBatches,
  updateBatch,
  deleteBatch,
  getBatchDetails,
  searchTeachers,
  inviteTeacherToBatch
} = require('../controllers/batchController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Search teachers
router.get('/teachers/search', protect, searchTeachers)

// Create a batch
router.post('/', protect, createBatch)

// Update a batch
router.put('/:batchId', protect, updateBatch)

// Delete a batch (empty only)
router.delete('/:batchId', protect, deleteBatch)

// Invite teacher to batch
router.post('/:batchId/invite-teacher', protect, inviteTeacherToBatch)

// Get full details of a specific batch
router.get('/:batchId/details', protect, getBatchDetails)

// Get batches of logged-in institute
router.get('/my', protect, getMyBatches)

router.get(
  '/institution/:institutionId',
  protect,
  getInstitutionBatches
)

module.exports = router