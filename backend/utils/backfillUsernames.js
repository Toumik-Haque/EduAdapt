const User = require('../models/User')
const InstituteProfile = require('../models/InstituteProfile')
const TeacherProfile = require('../models/TeacherProfile')
const LearnerProfile = require('../models/LearnerProfile')
const { generateUniqueUsername } = require('../utils/usernameGenerator')

/**
 * Migration to assign unique usernames to all existing users without one
 */
const backfillUsernames = async () => {
  try {
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    })

    if (usersWithoutUsername.length === 0) {
      return
    }

    console.log(`[Migration] Found ${usersWithoutUsername.length} user(s) without username. Backfilling...`)

    for (const user of usersWithoutUsername) {
      let seed = ''

      if (user.accountType === 'institute') {
        const inst = await InstituteProfile.findOne({ userId: user._id })
        seed = inst?.instituteName || user.email.split('@')[0]
      } else if (user.accountType === 'teacher') {
        const teacher = await TeacherProfile.findOne({ userId: user._id })
        seed = teacher?.fullName || user.email.split('@')[0]
      } else if (user.accountType === 'learner') {
        const learner = await LearnerProfile.findOne({ userId: user._id })
        seed = learner?.fullName || user.email.split('@')[0]
      } else {
        seed = user.email.split('@')[0]
      }

      const generated = await generateUniqueUsername(seed)
      user.username = generated
      await user.save()
      console.log(`[Migration] User ${user.email} assigned username: @${generated}`)
    }

    console.log(`[Migration] Successfully completed username backfill.`)
  } catch (error) {
    console.error('[Migration] Username backfill error:', error)
  }
}

module.exports = {
  backfillUsernames
}
