const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const InstituteProfile = require('../models/InstituteProfile')
const TeacherProfile = require('../models/TeacherProfile')
const LearnerProfile = require('../models/LearnerProfile')
const EmailOTP = require('../models/EmailOTP')

const { createOTP, verifyOTP } = require('../services/otpService')
const { sendEmail } = require('../services/emailService')

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

    // Create main User account
    const user = await User.create({
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
    const { name, instituteType } = req.body

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

module.exports = {
  registerUser,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  resetPassword,
  loginUser,
  getCurrentUser,
  getMyProfile,
  updateMyProfile
}