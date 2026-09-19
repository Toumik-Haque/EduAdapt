const express = require('express')

const {
  createBatch,
  getMyBatches,
  getInstitutionBatches
} = require('../controllers/batchController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Create a batch
router.post('/', protect, createBatch)

// Get batches of logged-in institute
router.get('/my', protect, getMyBatches)

router.get(
  '/institution/:institutionId',
  protect,
  getInstitutionBatches
)

module.exports = router