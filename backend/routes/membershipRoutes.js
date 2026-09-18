const express = require('express')

const {
  getMyInstitutions,
  searchInstitutions,
  joinInstitution,
  approveMembership
} = require('../controllers/membershipController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get(
  '/my-institutions',
  protect,
  getMyInstitutions
)
router.get(
  '/institutions',
  protect,
  searchInstitutions
)
router.post(
  '/join',
  protect,
  joinInstitution
)
router.patch(
  '/approve',
  protect,
  approveMembership
)

module.exports = router