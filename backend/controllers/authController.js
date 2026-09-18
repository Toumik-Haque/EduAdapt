const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const InstituteProfile = require('../models/InstituteProfile')
const TeacherProfile = require('../models/TeacherProfile')
const LearnerProfile = require('../models/LearnerProfile')

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      accountType,
      instituteType
    } = req.body

    // Validate common required fields
    if (!name || !email || !password || !accountType) {
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

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
}