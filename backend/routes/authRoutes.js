const express = require('express')

const {
  registerUser,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  resetPassword,
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

router.post(
  '/send-registration-otp',
  sendRegistrationOTP
)
router.post(
  '/send-password-reset-otp',
  sendPasswordResetOTP
)
router.post(
  '/reset-password',
  resetPassword
)

module.exports = router