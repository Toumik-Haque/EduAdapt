const crypto = require('crypto')
const EmailOTP = require('../models/EmailOTP')

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString()
}

const hashOTP = (otp) => {
  return crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex')
}

const createOTP = async ({
  email,
  purpose,
  userId = null
}) => {
  const normalizedEmail = email
    .toLowerCase()
    .trim()

  // Check whether a recent OTP already exists
  const existingOTP = await EmailOTP.findOne({
    email: normalizedEmail,
    purpose
  })

  if (existingOTP) {
    const cooldownMs = 60 * 1000
    const timeSinceCreation =
      Date.now() - existingOTP.createdAt.getTime()

    if (timeSinceCreation < cooldownMs) {
      const remainingSeconds = Math.ceil(
        (cooldownMs - timeSinceCreation) / 1000
      )

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`
      )
    }

    // Existing OTP is older than the cooldown
    await EmailOTP.deleteOne({
      _id: existingOTP._id
    })
  }

  const otp = generateOTP()
  const otpHash = hashOTP(otp)

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  )

  await EmailOTP.create({
    email: normalizedEmail,
    otpHash,
    purpose,
    userId,
    expiresAt
  })

  return otp
}

const verifyOTP = async ({
  email,
  otp,
  purpose
}) => {
  const normalizedEmail = email
    .toLowerCase()
    .trim()

  const record = await EmailOTP.findOne({
    email: normalizedEmail,
    purpose
  })

  if (!record) {
    return {
      success: false,
      message: 'OTP not found or already used'
    }
  }

  if (record.expiresAt < new Date()) {
    await EmailOTP.deleteOne({
      _id: record._id
    })

    return {
      success: false,
      message: 'OTP has expired'
    }
  }

  if (record.attempts >= 5) {
    await EmailOTP.deleteOne({
      _id: record._id
    })

    return {
      success: false,
      message: 'Too many incorrect attempts'
    }
  }

  const otpHash = hashOTP(otp)

  if (otpHash !== record.otpHash) {
    record.attempts += 1
    await record.save()

    return {
      success: false,
      message: 'Invalid OTP'
    }
  }

  await EmailOTP.deleteOne({
    _id: record._id
  })

  return {
    success: true,
    userId: record.userId
  }
}

module.exports = {
  generateOTP,
  hashOTP,
  createOTP,
  verifyOTP
}