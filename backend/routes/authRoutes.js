const express = require('express')

const {
  registerUser,
  loginUser,
  getCurrentUser,
  getMyProfile,
  updateMyProfile
} = require('../controllers/authController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/me', protect, getCurrentUser)

router.get('/profile', protect, getMyProfile)
router.patch('/profile', protect, updateMyProfile)

module.exports = router