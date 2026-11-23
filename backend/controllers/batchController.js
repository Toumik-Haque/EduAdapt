const Batch = require('../models/Batch')
const InstituteProfile = require('../models/InstituteProfile')
const InstitutionMembership = require('../models/InstitutionMembership')
const Subject = require('../models/Subject')
const Material = require('../models/Material')
const User = require('../models/User')
const TeacherProfile = require('../models/TeacherProfile')
const Notification = require('../models/Notification')
const { sendEmail } = require('../services/emailService')

// Create a batch
const createBatch = async (req, res) => {
  try {
    const {
      name,
      department,
      academicYear,
      description
    } = req.body

    // Only institute accounts can create batches
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can create batches'
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Batch name is required'
      })
    }

    // Check institute profile
    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    const batch = await Batch.create({
      institutionId: req.user.userId,
      name: name.trim(),
      department: department ? department.trim() : '',
      academicYear: academicYear ? academicYear.trim() : '',
      description: description ? description.trim() : '',
      createdBy: req.user.userId
    })

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      batch
    })
  } catch (error) {
    console.error('Create batch error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error while creating batch'
    })
  }
}


// Get all batches of the logged-in institute
const getMyBatches = async (req, res) => {
  try {
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can access their batches'
      })
    }

    const batches = await Batch.find({
      institutionId: req.user.userId
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      batches
    })
  } catch (error) {
    console.error('Get batches error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error while fetching batches'
    })
  }
}

const getInstitutionBatches = async (req, res) => {
  try {
    const { institutionId } = req.params

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID is required'
      })
    }

    // Check whether the institution exists
    const User = require('../models/User')

    const institution = await User.findOne({
      _id: institutionId,
      accountType: 'institute'
    })

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      })
    }

    const batches = await Batch.find({
      institutionId
    }).sort({
      createdAt: -1
    })

    res.status(200).json({
      success: true,
      batches
    })
  } catch (error) {
    console.error(
      'Get institution batches error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching institution batches'
    })
  }
}

// Update a batch
const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params
    const { name, department, academicYear, description } = req.body

    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can update batches'
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Batch name is required'
      })
    }

    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      })
    }

    if (batch.institutionId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this batch'
      })
    }

    batch.name = name.trim()
    batch.department = department ? department.trim() : ''
    batch.academicYear = academicYear ? academicYear.trim() : ''
    batch.description = description ? description.trim() : ''

    await batch.save()

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      batch
    })
  } catch (error) {
    console.error('Update batch error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating batch'
    })
  }
}

// Delete a batch (only empty batches can be deleted)
const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params

    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can delete batches'
      })
    }

    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      })
    }

    if (batch.institutionId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this batch'
      })
    }

    // Check if any learners or teachers are enrolled in this batch
    const enrolledMembersCount = await InstitutionMembership.countDocuments({
      batchId: batch._id,
      status: { $in: ['approved', 'pending'] }
    })

    if (enrolledMembersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch: this batch currently has ${enrolledMembersCount} member(s) enrolled or pending. Only empty batches can be deleted.`
      })
    }

    // Check if any subjects or materials exist in this batch
    const subjectsCount = await Subject.countDocuments({ batchId: batch._id })
    if (subjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch: this batch has ${subjectsCount} active subject(s). Please remove subjects first.`
      })
    }

    const materialsCount = await Material.countDocuments({ batchId: batch._id })
    if (materialsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch: this batch has ${materialsCount} study material(s). Please remove materials first.`
      })
    }

    await Batch.findByIdAndDelete(batchId)

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    })
  } catch (error) {
    console.error('Delete batch error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting batch'
    })
  }
}

// Get full details of a batch (batch info, teachers, learners, video lectures, and study notes/PDFs)
const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params

    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      })
    }

    // Ensure user has access: either the owning institute or an enrolled member (teacher/learner)
    const isOwnerInstitute =
      req.user.accountType === 'institute' &&
      batch.institutionId.toString() === req.user.userId

    if (!isOwnerInstitute) {
      const membership = await InstitutionMembership.findOne({
        institutionId: batch.institutionId,
        batchId: batch._id,
        userId: req.user.userId,
        status: 'approved'
      })

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this batch'
        })
      }
    }

    // Fetch teachers (approved faculty AND pending invited/requested teachers)
    const teacherMemberships = await InstitutionMembership.find({
      batchId: batch._id,
      role: 'teacher'
    }).populate('userId', 'name email username accountType')

    const TeacherProfile = require('../models/TeacherProfile')
    const Notification = require('../models/Notification')

    const teachers = await Promise.all(
      teacherMemberships
        .filter((m) => m.userId)
        .map(async (m) => {
          const profile = await TeacherProfile.findOne({ userId: m.userId._id }).select('fullName')

          let effectiveStatus = m.status // 'approved', 'pending', 'rejected'

          // If membership is pending, cross-check latest invitation notification in case it was declined
          if (effectiveStatus === 'pending') {
            const notif = await Notification.findOne({
              recipientId: m.userId._id,
              batchId: batch._id,
              type: 'batch_invitation'
            }).sort({ createdAt: -1 })

            if (notif) {
              if (notif.status === 'declined') {
                effectiveStatus = 'rejected'
              } else if (notif.status === 'accepted') {
                effectiveStatus = 'approved'
              }
            }
          }

          return {
            _id: m.userId._id,
            membershipId: m._id,
            name: profile?.fullName || m.userId.name || m.userId.username || m.userId.email,
            email: m.userId.email,
            username: m.userId.username,
            status: effectiveStatus,
            joinedAt: m.createdAt
          }
        })
    )

    // Fetch students/learners enrolled in this batch
    const learnerMemberships = await InstitutionMembership.find({
      batchId: batch._id,
      role: 'learner',
      status: 'approved'
    }).populate('userId', 'name email username accountType')

    const students = learnerMemberships
      .filter((m) => m.userId)
      .map((m) => ({
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        username: m.userId.username,
        joinedAt: m.createdAt
      }))

    // Fetch subjects belonging to this batch
    const subjects = await Subject.find({ batchId: batch._id })

    // Fetch all study materials and lectures for this batch
    const materials = await Material.find({ batchId: batch._id })
      .populate('createdBy', 'name email')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })

    // Filter into video lectures and study notes (documents/notes/assignments)
    const videoLectures = materials.filter(
      (m) => m.type === 'video' || (m.fileType && m.fileType.includes('video'))
    )

    const studyNotes = materials.filter(
      (m) => m.type !== 'video' && (!m.fileType || !m.fileType.includes('video'))
    )

    res.status(200).json({
      success: true,
      batch,
      teachers,
      students,
      subjects,
      materials,
      videoLectures,
      studyNotes
    })
  } catch (error) {
    console.error('Get batch details error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batch details'
    })
  }
}

// Search teachers registered on EduAdapt by username or email
const searchTeachers = async (req, res) => {
  try {
    const { q, batchId } = req.query

    if (!q || !q.trim()) {
      return res.json({ success: true, teachers: [] })
    }

    const query = q.trim()

    // Find users with accountType: 'teacher' whose email matches query
    const teacherUsers = await User.find({
      accountType: 'teacher',
      email: { $regex: query, $options: 'i' }
    }).select('_id email username')

    // Also find teachers by their TeacherProfile fullName
    const profileMatches = await TeacherProfile.find({
      fullName: { $regex: query, $options: 'i' }
    }).populate('userId', '_id email username accountType')

    const userMap = new Map()

    teacherUsers.forEach((u) => {
      userMap.set(u._id.toString(), {
        _id: u._id,
        email: u.email,
        username: u.username || '',
        name: ''
      })
    })

    profileMatches.forEach((p) => {
      if (p.userId && p.userId.accountType === 'teacher') {
        const idStr = p.userId._id.toString()
        if (userMap.has(idStr)) {
          userMap.get(idStr).name = p.fullName
          userMap.get(idStr).username = p.userId.username || userMap.get(idStr).username
        } else {
          userMap.set(idStr, {
            _id: p.userId._id,
            email: p.userId.email,
            username: p.userId.username || '',
            name: p.fullName
          })
        }
      }
    })

    // Populate any remaining empty names
    const teacherList = Array.from(userMap.values())
    for (const t of teacherList) {
      if (!t.name) {
        const prof = await TeacherProfile.findOne({ userId: t._id })
        t.name = prof ? prof.fullName : t.email.split('@')[0]
      }

      // Check current membership status in this batch if batchId provided
      if (batchId) {
        const membership = await InstitutionMembership.findOne({
          batchId,
          userId: t._id
        })
        t.membershipStatus = membership ? membership.status : 'not_invited'
      } else {
        t.membershipStatus = 'not_invited'
      }
    }

    res.json({
      success: true,
      teachers: teacherList
    })
  } catch (error) {
    console.error('Search teachers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while searching teachers'
    })
  }
}

// Send batch invitation to teacher
const inviteTeacherToBatch = async (req, res) => {
  try {
    const { batchId } = req.params
    const { teacherId } = req.body

    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can invite teachers to batches'
      })
    }

    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' })
    }

    if (batch.institutionId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: you do not own this batch'
      })
    }

    const teacher = await User.findOne({
      _id: teacherId,
      accountType: 'teacher'
    })

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher account not found'
      })
    }

    // Get institute profile for branding
    const instProfile = await InstituteProfile.findOne({ userId: req.user.userId })
    const instituteName = instProfile ? instProfile.instituteName : 'Your Institution'

    // Check existing membership
    let membership = await InstitutionMembership.findOne({
      institutionId: req.user.userId,
      batchId: batch._id,
      userId: teacher._id
    })

    if (membership && membership.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already an approved member of this batch'
      })
    }

    if (!membership) {
      membership = await InstitutionMembership.create({
        institutionId: req.user.userId,
        batchId: batch._id,
        userId: teacher._id,
        role: 'teacher',
        initiatedBy: 'institute',
        status: 'pending'
      })
    } else {
      membership.initiatedBy = 'institute'
      membership.status = 'pending'
      await membership.save()
    }

    // 1. Create In-App Bell Notification for Teacher
    const notificationTitle = `Invitation to teach batch: ${batch.name}`
    const notificationMessage = `${instituteName} has invited you to join as a faculty member for the learning batch "${batch.name}" (${batch.department || 'General'}, ${batch.academicYear || 'Current Year'}).`

    const notification = await Notification.create({
      recipientId: teacher._id,
      senderId: req.user.userId,
      institutionId: req.user.userId,
      batchId: batch._id,
      type: 'batch_invitation',
      title: notificationTitle,
      message: notificationMessage,
      actionLink: `/teacher`
    })

    // 2. Send Invitation Email to Teacher
    const appOrigin = process.env.CLIENT_URL || 'http://localhost:5174'
    const loginLink = `${appOrigin}/login`

    try {
      await sendEmail({
        to: teacher.email,
        subject: `EduAdapt Batch Invitation: ${batch.name} at ${instituteName}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E4E4E7; border-radius: 12px; background: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #7C3AED; margin: 0 0 6px;">EduAdapt</h2>
              <span style="font-size: 12px; color: #71717A; text-transform: uppercase; letter-spacing: 1px;">Campus Faculty Invitation</span>
            </div>
            
            <p style="color: #18181B; font-size: 15px; line-height: 1.6;">
              Hello <strong>${teacher.email}</strong>,
            </p>
            
            <p style="color: #3F3F46; font-size: 14px; line-height: 1.6;">
              <strong>${instituteName}</strong> has invited you to join their official teaching workspace for the batch <strong>${batch.name}</strong>.
            </p>
            
            <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 10px; padding: 16px; margin: 20px 0;">
              <div style="font-weight: bold; color: #5B21B6; font-size: 15px; margin-bottom: 4px;">${batch.name}</div>
              <div style="color: #6D28D9; font-size: 13px;">${batch.department || 'General'} • Academic Year: ${batch.academicYear || 'Active'}</div>
              ${batch.description ? `<p style="color: #4C1D95; font-size: 12px; margin: 8px 0 0; line-height: 1.5;">${batch.description}</p>` : ''}
            </div>
            
            <p style="color: #71717A; font-size: 13px; line-height: 1.5;">
              You can review and accept this invitation directly from the bell notification icon inside your EduAdapt Educator Dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" style="background: #7C3AED; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Open EduAdapt Dashboard & Accept
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #E4E4E7; margin: 24px 0;" />
            
            <div style="font-size: 11px; color: #A1A1AA; text-align: center;">
              This invitation was sent by ${instituteName} through the EduAdapt Learning Platform.
            </div>
          </div>
        `
      })
      console.log(`Invitation email sent successfully to ${teacher.email}`)
    } catch (emailErr) {
      console.warn('Invitation email could not be sent (Brevo/SMTP):', emailErr.message)
      // Continue without crashing so in-app bell notification still succeeds
    }

    res.status(200).json({
      success: true,
      message: `Invitation successfully sent to ${teacher.email}! A notification and email have been dispatched.`,
      notification
    })
  } catch (error) {
    console.error('Invite teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while sending teacher invitation'
    })
  }
}

module.exports = {
  createBatch,
  getMyBatches,
  getInstitutionBatches,
  updateBatch,
  deleteBatch,
  getBatchDetails,
  searchTeachers,
  inviteTeacherToBatch
}