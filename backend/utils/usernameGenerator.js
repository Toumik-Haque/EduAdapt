const User = require('../models/User')

/**
 * Generate a clean, lowercase base string from a name or email
 */
const sanitizeBase = (str) => {
  if (!str) return 'user'
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) || 'user'
}

/**
 * Generate a unique username by checking MongoDB collisions
 * Format: base + random 4-digit number (or just base if available)
 */
const generateUniqueUsername = async (seed) => {
  let base = sanitizeBase(seed)
  if (base.length < 3) base = `user${base}`

  // First try base alone
  const exists = await User.findOne({ username: base })
  if (!exists) {
    return base
  }

  // If exists, append 4 random digits
  let attempts = 0
  while (attempts < 20) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const candidate = `${base}${randomSuffix}`
    const candidateExists = await User.findOne({ username: candidate })
    if (!candidateExists) {
      return candidate
    }
    attempts++
  }

  // Fallback with timestamp
  return `${base}${Date.now().toString().slice(-6)}`
}

module.exports = {
  sanitizeBase,
  generateUniqueUsername
}
