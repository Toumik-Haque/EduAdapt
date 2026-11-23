const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const InstituteProfile = require('../models/InstituteProfile')
const TeacherProfile = require('../models/TeacherProfile')
const LearnerProfile = require('../models/LearnerProfile')
const EmailOTP = require('../models/EmailOTP')

const { createOTP, verifyOTP } = require('../services/otpService')
const { sendEmail } = require('../services/emailService')
const { generateUniqueUsername } = require('../utils/usernameGenerator')
const InstitutionMembership = require('../models/InstitutionMembership')
const Notification = require('../models/Notification')

const sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    // Check whether email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create OTP
    const otp = await createOTP({
      email: normalizedEmail,
      purpose: 'registration'
    })

    // Send OTP through Brevo
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'EduAdapt Registration OTP',
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #6D28D9;">
            Verify your EduAdapt email
          </h2>

          <p>
            Use the following OTP to continue creating your EduAdapt account:
          </p>

          <div style="
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6D28D9;
            margin: 24px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request this code, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

          <p style="color: #777; font-size: 13px;">
            EduAdapt — Adaptive Education Ecosystem
          </p>
        </div>
      `
      })
    } catch (emailError) {
      await EmailOTP.deleteMany({
        email: normalizedEmail,
        purpose: 'registration'
      })

      throw emailError
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    })
  } catch (error) {
    console.error(
      'Send registration OTP error:',
      error
    )

    if (
      error.message &&
      error.message.startsWith('Please wait')
    ) {
      return res.status(429).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Unable to send OTP'
    })
  }
}

const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    // Check whether the account exists
    const user = await User.findOne({
      email: normalizedEmail
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      })
    }

    // Create password reset OTP
    const otp = await createOTP({
      email: normalizedEmail,
      purpose: 'password_reset',
      userId: user._id
    })

    // Send OTP through Brevo
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'EduAdapt Password Reset OTP',
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #6D28D9;">
            Reset your EduAdapt password
          </h2>

          <p>
            We received a request to reset your EduAdapt account password.
          </p>

          <p>
            Use the following OTP to continue:
          </p>

          <div style="
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6D28D9;
            margin: 24px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

          <p style="color: #777; font-size: 13px;">
            EduAdapt — Adaptive Education Ecosystem
          </p>
        </div>
      `
      })
    } catch (emailError) {
      await EmailOTP.deleteMany({
        email: normalizedEmail,
        purpose: 'password_reset'
      })

      throw emailError
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully'
    })
  } catch (error) {
    console.error(
      'Send password reset OTP error:',
      error
    )

    if (
      error.message &&
      error.message.startsWith('Please wait')
    ) {
      return res.status(429).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Unable to send password reset OTP'
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
      confirmNewPassword
    } = req.body

    // Validate required fields
    if (
      !email ||
      !otp ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Check password confirmation
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      })
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    // Make sure the account still exists
    const user = await User.findOne({
      email: normalizedEmail
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify password reset OTP
    const otpResult = await verifyOTP({
      email: normalizedEmail,
      otp,
      purpose: 'password_reset'
    })

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    )

    // Update password
    user.password = hashedPassword

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error(
      'Reset password error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    })
  }
}

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      accountType,
      instituteType,
      otp
    } = req.body

    // Validate common required fields
    if (!name || !email || !password || !accountType || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Required registration fields are missing'
      })
    }

    // Validate account type
    const allowedAccountTypes = [
      'institute',
      'teacher',
      'learner'
    ]

    if (!allowedAccountTypes.includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type'
      })
    }

    // Institute-specific validation
    if (accountType === 'institute' && !instituteType) {
      return res.status(400).json({
        success: false,
        message: 'Institute type is required'
      })
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // Verify registration OTP before creating the account
    const otpResult = await verifyOTP({
      email: normalizedEmail,
      otp,
      purpose: 'registration'
    })

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      })
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique username
    const username = await generateUniqueUsername(name.trim())

    // Create main User account
    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      accountType
    })

    let profile

    // Create account-specific profile
    if (accountType === 'institute') {
      profile = await InstituteProfile.create({
        userId: user._id,
        instituteName: name.trim(),
        instituteType
      })
    }

    if (accountType === 'teacher') {
      profile = await TeacherProfile.create({
        userId: user._id,
        fullName: name.trim()
      })
    }

    if (accountType === 'learner') {
      profile = await LearnerProfile.create({
        userId: user._id,
        fullName: name.trim()
      })
    }

    // Successful response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType
      },
      profile: {
        id: profile._id
      }
    })
  } catch (error) {
    console.error('Registration error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // Find user
    const user = await User.findOne({
      email: normalizedEmail
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        accountType: user.accountType
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    // Find account-specific profile
    let profile = null

    if (user.accountType === 'learner') {
      profile = await LearnerProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'teacher') {
      profile = await TeacherProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'institute') {
      profile = await InstituteProfile.findOne({
        userId: user._id
      })
    }

    // Successful login
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType
      },
      profile
    })

  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
}

const getCurrentUser = async (req, res) => {
  try {
    // Find main user account
    const user = await User.findById(req.user.userId)
      .select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let profile = null

    // Find account-specific profile
    if (user.accountType === 'learner') {
      profile = await LearnerProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'teacher') {
      profile = await TeacherProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'institute') {
      profile = await InstituteProfile.findOne({
        userId: user._id
      })
    }

    res.status(200).json({
      success: true,
      message: 'Authenticated user',
      user,
      profile
    })
  } catch (error) {
    console.error('Get current user error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('email accountType')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let profile = null

    if (user.accountType === 'learner') {
      profile = await LearnerProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'teacher') {
      profile = await TeacherProfile.findOne({
        userId: user._id
      })
    }

    if (user.accountType === 'institute') {
      profile = await InstituteProfile.findOne({
        userId: user._id
      })
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType
      },
      profile
    })
  } catch (error) {
    console.error('Get profile error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    })
  }
}


const updateMyProfile = async (req, res) => {
  try {
    const { name, instituteType, username } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      })
    }

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      })
    }

    // Handle username update if requested
    let updatedUsername = undefined
    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 alphanumeric characters'
        })
      }

      const existing = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user.userId }
      })

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose another.'
        })
      }

      await User.findByIdAndUpdate(req.user.userId, { username: cleanUsername })
      updatedUsername = cleanUsername
    }

    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let profile = null

    if (user.accountType === 'learner') {
      profile = await LearnerProfile.findOneAndUpdate(
        { userId: user._id },
        { fullName: trimmedName },
        {
          new: true,
          runValidators: true
        }
      )
    }

    if (user.accountType === 'teacher') {
      profile = await TeacherProfile.findOneAndUpdate(
        { userId: user._id },
        { fullName: trimmedName },
        {
          new: true,
          runValidators: true
        }
      )
    }

    if (user.accountType === 'institute') {
      if (!instituteType) {
        return res.status(400).json({
          success: false,
          message: 'Institute type is required'
        })
      }

      profile = await InstituteProfile.findOneAndUpdate(
        { userId: user._id },
        {
          instituteName: trimmedName,
          instituteType
        },
        {
          new: true,
          runValidators: true
        }
      )
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      username: updatedUsername || user.username,
      profile
    })
  } catch (error) {
    console.error('Update profile error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      })
    }

    // Cascade cleanups
    // 1. Delete profiles
    await Promise.all([
      LearnerProfile.deleteMany({ userId }),
      TeacherProfile.deleteMany({ userId }),
      InstituteProfile.deleteMany({ userId })
    ])

    // 2. Delete memberships & notifications
    await Promise.all([
      InstitutionMembership.deleteMany({ userId }),
      Notification.deleteMany({ recipient: userId }),
      EmailOTP.deleteMany({ email: user.email })
    ])

    // 3. Delete user account
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    })
  }
}

/**
 * Global Search for platform profiles: Institutes, Teachers, Students
 * Search by username, full name, or email
 */
const searchPublicProfiles = async (req, res) => {
  try {
    const query = req.query.q?.trim() || ''
    if (!query || query.length < 2) {
      return res.status(200).json({ success: true, results: [] })
    }

    const regex = new RegExp(query.replace(/[^a-zA-Z0-9@_.-]/g, ''), 'i')

    // Find users matching username or email
    const matchedUsers = await User.find({
      $or: [{ username: regex }, { email: regex }]
    })
      .select('username email accountType')
      .limit(15)
      .lean()

    // Find institute profiles matching instituteName
    const matchedInstitutes = await InstituteProfile.find({
      instituteName: regex
    })
      .select('userId instituteName instituteType profilePhoto about location')
      .populate('userId', 'username email accountType')
      .limit(10)
      .lean()

    // Find teacher profiles matching fullName
    const matchedTeachers = await TeacherProfile.find({
      fullName: regex
    })
      .select('userId fullName')
      .populate('userId', 'username email accountType')
      .limit(10)
      .lean()

    // Do not include learners in public profile search
    const resultsMap = new Map()

    // Add matched institutes
    for (const inst of matchedInstitutes) {
      if (inst.userId) {
        const uId = inst.userId._id.toString()
        resultsMap.set(uId, {
          userId: uId,
          name: inst.instituteName,
          username: inst.userId.username || '',
          email: inst.userId.email,
          accountType: 'institute',
          instituteType: inst.instituteType,
          avatar: inst.profilePhoto?.url || '',
          location: [inst.location?.city, inst.location?.state].filter(Boolean).join(', ')
        })
      }
    }

    // Add matched teachers
    for (const t of matchedTeachers) {
      if (t.userId) {
        const uId = t.userId._id.toString()
        if (!resultsMap.has(uId)) {
          resultsMap.set(uId, {
            userId: uId,
            name: t.fullName,
            username: t.userId.username || '',
            email: t.userId.email,
            accountType: 'teacher'
          })
        }
      }
    }

    // Process matched users who might not have been caught by name regex (only institute and teacher)
    for (const u of matchedUsers) {
      const uId = u._id.toString()
      if (!resultsMap.has(uId)) {
        if (u.accountType === 'institute') {
          const inst = await InstituteProfile.findOne({ userId: u._id }).select('instituteName instituteType profilePhoto location').lean()
          resultsMap.set(uId, {
            userId: uId,
            name: inst?.instituteName || u.username,
            username: u.username || '',
            email: u.email,
            accountType: 'institute',
            instituteType: inst?.instituteType,
            avatar: inst?.profilePhoto?.url || '',
            location: [inst?.location?.city, inst?.location?.state].filter(Boolean).join(', ')
          })
        } else if (u.accountType === 'teacher') {
          const t = await TeacherProfile.findOne({ userId: u._id }).select('fullName').lean()
          resultsMap.set(uId, {
            userId: uId,
            name: t?.fullName || u.username,
            username: u.username || '',
            email: u.email,
            accountType: 'teacher'
          })
        }
      }
    }

    const results = Array.from(resultsMap.values()).slice(0, 12)

    res.status(200).json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Search public profiles error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while searching profiles'
    })
  }
}

const mongoose = require('mongoose')

/**
 * Get Public Profile of any User (Teacher, Student / Learner, or Campus)
 * Accepts either a MongoDB ObjectId (userId) or a unique username
 */
const getPublicUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    let user = null
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('username email accountType createdAt').lean()
    }
    if (!user) {
      user = await User.findOne({ username: userId.toLowerCase() }).select('username email accountType createdAt').lean()
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const resolvedUserId = user._id

    let profile = null
    let memberships = []

    if (user.accountType === 'institute') {
      profile = await InstituteProfile.findOne({ userId: resolvedUserId }).lean()
    } else if (user.accountType === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: resolvedUserId }).lean()
      // Find teacher's batches/affiliations
      memberships = await InstitutionMembership.find({ userId: resolvedUserId, status: 'approved' })
        .populate('institutionId', 'username email')
        .populate('batchId', 'name department academicYear')
        .lean()
    } else {
      // Learners / Students have NO public profile on EduAdapt
      return res.status(404).json({
        success: false,
        message: 'Public profile not available for learner accounts'
      })
    }

    res.status(200).json({
      success: true,
      user,
      profile,
      memberships
    })
  } catch (error) {
    console.error('Get public user profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    })
  }
}

module.exports = {
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
}