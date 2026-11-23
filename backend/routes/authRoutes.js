const express = require('express')

const {
  registerUser,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  resetPassword,
  loginUser,
  getCurrentUser,
  getMyProfile,
  updateMyProfile,
  deleteAccount,
  searchPublicProfiles,
  getPublicUserProfile
} = require('../controllers/authController')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/me', protect, getCurrentUser)

router.get('/profile', protect, getMyProfile)
router.patch('/profile', protect, updateMyProfile)
router.delete('/delete-account', protect, deleteAccount)

// Public Search & Profile Inspection (search supports optional auth or guest lookup)
router.get('/search-profiles', searchPublicProfiles)
router.get('/public/user/:userId', getPublicUserProfile)

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