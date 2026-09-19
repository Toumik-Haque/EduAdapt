const InstitutionMembership = require('../models/InstitutionMembership')
const InstituteProfile = require('../models/InstituteProfile')
const Batch = require('../models/Batch')
const User = require('../models/User')

const getMyInstitutions = async (req, res) => {
  try {
    const memberships = await InstitutionMembership.find({
      userId: req.user.userId,
      role: 'learner',
      status: 'approved'
    }).populate({
      path: 'institutionId',
      select: 'email accountType'
    })

    const InstituteProfile = require('../models/InstituteProfile')

    const institutions = await Promise.all(
      memberships.map(async (membership) => {
        const profile = await InstituteProfile.findOne({
          userId: membership.institutionId._id
        }).select(
          'instituteName instituteType'
        )

        return {
          id: membership.institutionId._id,
          instituteName: profile?.instituteName || '',
          instituteType: profile?.instituteType || '',
          membershipId: membership._id
        }
      })
    )

    res.status(200).json({
      success: true,
      institutions
    })
  } catch (error) {
    console.error(
      'Get my institutions error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while fetching institutions'
    })
  }
}

const getMyMemberships = async (req, res) => {
  try {
    const memberships =
      await InstitutionMembership.find({
        userId: req.user.userId,
        role: 'learner'
      })
        .populate({
          path: 'institutionId',
          select: 'email accountType'
        })
        .populate({
          path: 'batchId',
          select: 'name department academicYear description'
        })
        .lean()

    const InstituteProfile =
      require('../models/InstituteProfile')

    const result = await Promise.all(
      memberships.map(async (membership) => {
        const profile =
          await InstituteProfile.findOne({
            userId: membership.institutionId?._id
          }).select(
            'instituteName instituteType'
          )

        return {
          membershipId: membership._id,

          institutionId:
            membership.institutionId?._id,

          instituteName:
            profile?.instituteName || '',

          instituteType:
            profile?.instituteType || '',

          batchId:
            membership.batchId?._id || null,

          batchName:
            membership.batchId?.name || '',

          department:
            membership.batchId?.department || '',

          academicYear:
            membership.batchId?.academicYear || '',

          status:
            membership.status
        }
      })
    )

    res.status(200).json({
      success: true,
      memberships: result
    })
  } catch (error) {
    console.error(
      'Get my memberships error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching memberships'
    })
  }
}

const searchInstitutions = async (req, res) => {
  try {
    const search = req.query.search?.trim() || ''

    const User = require('../models/User')
    const InstituteProfile = require('../models/InstituteProfile')

    const institutions = await User.find({
      accountType: 'institute'
    })
      .select('email accountType')
      .lean()

    const instituteUserIds = institutions.map(
      institution => institution._id
    )

    const query = {
      userId: {
        $in: instituteUserIds
      }
    }

    if (search) {
      query.instituteName = {
        $regex: search,
        $options: 'i'
      }
    }

    const profiles = await InstituteProfile.find(query)
      .select('userId instituteName instituteType')
      .lean()

    const result = profiles.map(profile => ({
      id: profile.userId,
      instituteName: profile.instituteName,
      instituteType: profile.instituteType
    }))

    res.status(200).json({
      success: true,
      institutions: result
    })
  } catch (error) {
    console.error(
      'Search institutions error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while searching institutions'
    })
  }
}

const getInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params

    const InstitutionMembership =
      require('../models/InstitutionMembership')

    const InstituteProfile =
      require('../models/InstituteProfile')

    // Check whether the logged-in learner is an approved member
    const membership = await InstitutionMembership.findOne({
      userId: req.user.userId,
      institutionId,
      role: 'learner',
      status: 'approved'
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not an approved member of this institution'
      })
    }

    // Get institution profile
    const profile = await InstituteProfile.findOne({
      userId: institutionId
    }).select('instituteName instituteType')

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      })
    }

    res.status(200).json({
      success: true,
      institution: {
        id: institutionId,
        instituteName: profile.instituteName,
        instituteType: profile.instituteType
      }
    })
  } catch (error) {
    console.error('Get institution error:', error)

    res.status(500).json({
      success: false,
      message: 'Server error while fetching institution'
    })
  }
}

const joinInstitution = async (req, res) => {
  try {
    const {
      institutionId,
      batchIds
    } = req.body

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID is required'
      })
    }

    if (
      !Array.isArray(batchIds) ||
      batchIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one batch must be selected'
      })
    }

    // Only learners can join an institution as learners
    if (req.user.accountType !== 'learner') {
      return res.status(403).json({
        success: false,
        message: 'Only learners can join institutions'
      })
    }

    // Remove duplicate batch IDs
    const uniqueBatchIds = [
      ...new Set(batchIds.map(id => id.toString()))
    ]

    const User = require('../models/User')
    const Batch = require('../models/Batch')

    // Check whether institution exists
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

    // Check whether all selected batches belong
    // to this institution
    const batches = await Batch.find({
      _id: {
        $in: uniqueBatchIds
      },
      institutionId
    })

    if (batches.length !== uniqueBatchIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected batches are invalid'
      })
    }

    const createdMemberships = []
    const alreadyExists = []

    // Create one membership for each selected batch
    for (const batchId of uniqueBatchIds) {
      const existingMembership =
        await InstitutionMembership.findOne({
          userId: req.user.userId,
          institutionId,
          batchId,
          role: 'learner'
        })

      if (existingMembership) {
        alreadyExists.push({
          batchId,
          status: existingMembership.status
        })

        continue
      }

      const membership =
        await InstitutionMembership.create({
          userId: req.user.userId,
          institutionId,
          batchId,
          role: 'learner',
          status: 'pending'
        })

      createdMemberships.push(membership)
    }

    res.status(201).json({
      success: true,
      message: 'Batch join request processed successfully',
      created: createdMemberships,
      alreadyExists
    })
  } catch (error) {
    console.error(
      'Join institution error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while sending batch join request'
    })
  }
}

const approveMembership = async (req, res) => {
  try {
    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findById(
        membershipId
      )

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found'
      })
    }

    // Only the institution itself can approve
    if (
      membership.institutionId.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this request'
      })
    }

    if (membership.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Membership is already ${membership.status}`
      })
    }

    membership.status = 'approved'

    await membership.save()

    res.status(200).json({
      success: true,
      message: 'Membership approved successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Approve membership error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while approving membership'
    })
  }
}

const leaveInstitution = async (req, res) => {
  try {
    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        userId: req.user.userId,
        role: 'learner'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message:
          'Learner batch membership not found'
      })
    }

    if (membership.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message:
          `Cannot leave while membership is ${membership.status}`
      })
    }

    await InstitutionMembership.deleteOne({
      _id: membership._id
    })

    res.status(200).json({
      success: true,
      message:
        'You have left the batch successfully'
    })
  } catch (error) {
    console.error(
      'Leave learner batch error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while leaving batch'
    })
  }
}

const cancelJoinRequest = async (req, res) => {
  try {
    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        userId: req.user.userId,
        role: 'learner'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      })
    }

    if (membership.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          `Cannot cancel a ${membership.status} membership`
      })
    }

    await InstitutionMembership.deleteOne({
      _id: membership._id
    })

    res.status(200).json({
      success: true,
      message:
        'Batch join request cancelled successfully'
    })
  } catch (error) {
    console.error(
      'Cancel join request error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while cancelling join request'
    })
  }
}

const joinTeacherBatches = async (req, res) => {
  try {
    const {
      institutionId,
      batchIds
    } = req.body

    // Only teacher accounts can send teacher join requests
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can send teacher join requests'
      })
    }

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID is required'
      })
    }

    if (
      !Array.isArray(batchIds) ||
      batchIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one batch must be selected'
      })
    }

    // Remove duplicate batch IDs
    const uniqueBatchIds = [
      ...new Set(batchIds.map(id => id.toString()))
    ]

    // Check whether institution exists
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

    // Check whether all selected batches belong to this institution
    const batches = await Batch.find({
      _id: { $in: uniqueBatchIds },
      institutionId
    })

    if (batches.length !== uniqueBatchIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected batches are invalid'
      })
    }

    const createdMemberships = []
    const alreadyExists = []

    // Create one membership for each selected batch
    for (const batchId of uniqueBatchIds) {
      const existingMembership =
        await InstitutionMembership.findOne({
          userId: req.user.userId,
          institutionId,
          batchId,
          role: 'teacher'
        })

      if (existingMembership) {
        alreadyExists.push({
          batchId,
          status: existingMembership.status
        })

        continue
      }

      const membership =
        await InstitutionMembership.create({
          userId: req.user.userId,
          institutionId,
          batchId,
          role: 'teacher',
          status: 'pending'
        })

      createdMemberships.push(membership)
    }

    res.status(201).json({
      success: true,
      message: 'Teacher batch join request processed successfully',
      created: createdMemberships,
      alreadyExists
    })
  } catch (error) {
    console.error(
      'Teacher batch join error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while sending teacher join request'
    })
  }
}

const getMyTeacherBatches = async (req, res) => {
  try {
    // Only teachers can access this
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access teacher batches'
      })
    }

    const memberships =
      await InstitutionMembership.find({
        userId: req.user.userId,
        role: 'teacher'
      })
        .populate({
          path: 'institutionId',
          select: 'email accountType'
        })
        .populate({
          path: 'batchId',
          select: 'name department academicYear description'
        })
        .lean()

    const InstituteProfile =
      require('../models/InstituteProfile')

    const batches = await Promise.all(
      memberships.map(async (membership) => {

        const profile =
          await InstituteProfile.findOne({
            userId: membership.institutionId?._id
          }).select(
            'instituteName instituteType'
          )

        return {
          membershipId: membership._id,

          institutionId:
            membership.institutionId?._id,

          instituteName:
            profile?.instituteName || '',

          instituteType:
            profile?.instituteType || '',

          batchId:
            membership.batchId?._id,

          batchName:
            membership.batchId?.name || '',

          department:
            membership.batchId?.department || '',

          academicYear:
            membership.batchId?.academicYear || '',

          description:
            membership.batchId?.description || '',

          status:
            membership.status
        }
      })
    )

    res.status(200).json({
      success: true,
      batches
    })
  } catch (error) {
    console.error(
      'Get my teacher batches error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching teacher batches'
    })
  }
}

const getTeacherJoinRequests = async (req, res) => {
  try {
    // Only institutes can view teacher requests
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can view teacher requests'
      })
    }

    const memberships =
      await InstitutionMembership.find({
        institutionId: req.user.userId,
        role: 'teacher',
        status: 'pending'
      })
        .populate({
          path: 'userId',
          select: 'email accountType'
        })
        .populate({
          path: 'batchId',
          select: 'name department academicYear description'
        })
        .lean()

    const TeacherProfile =
      require('../models/TeacherProfile')

    const requests = await Promise.all(
      memberships.map(async membership => {
        const profile =
          await TeacherProfile.findOne({
            userId: membership.userId?._id
          }).select('fullName')

        return {
          membershipId: membership._id,

          teacherId: membership.userId?._id,

          teacherName:
            profile?.fullName ||
            membership.userId?.email ||
            '',

          teacherEmail:
            membership.userId?.email || '',

          batchId: membership.batchId?._id,

          batchName:
            membership.batchId?.name || '',

          department:
            membership.batchId?.department || '',

          academicYear:
            membership.batchId?.academicYear || '',

          status: membership.status,

          createdAt: membership.createdAt
        }
      })
    )

    res.status(200).json({
      success: true,
      requests
    })
  } catch (error) {
    console.error(
      'Get teacher join requests error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching teacher join requests'
    })
  }
}

const approveTeacherMembership = async (req, res) => {
  try {
    // Only institutes can approve teachers
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can approve teacher requests'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        institutionId: req.user.userId,
        role: 'teacher'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Teacher request not found'
      })
    }

    if (membership.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${membership.status}`
      })
    }

    membership.status = 'approved'

    await membership.save()

    res.status(200).json({
      success: true,
      message: 'Teacher approved for the batch successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Approve teacher membership error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while approving teacher request'
    })
  }
}

const rejectTeacherMembership = async (req, res) => {
  try {
    // Only institutes can reject teachers
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can reject teacher requests'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        institutionId: req.user.userId,
        role: 'teacher'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Teacher request not found'
      })
    }

    if (membership.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${membership.status}`
      })
    }

    membership.status = 'rejected'

    await membership.save()

    res.status(200).json({
      success: true,
      message: 'Teacher request rejected successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Reject teacher membership error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while rejecting teacher request'
    })
  }
}

const cancelTeacherBatchRequest = async (req, res) => {
  try {
    // Only teachers can cancel their requests
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can cancel teacher requests'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        userId: req.user.userId,
        role: 'teacher'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Teacher membership request not found'
      })
    }

    if (membership.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          `Cannot cancel a ${membership.status} membership`
      })
    }

    await InstitutionMembership.deleteOne({
      _id: membership._id
    })

    res.status(200).json({
      success: true,
      message: 'Teacher batch request cancelled successfully'
    })
  } catch (error) {
    console.error(
      'Cancel teacher batch request error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while cancelling teacher request'
    })
  }
}

const leaveTeacherBatch = async (req, res) => {
  try {
    // Only teachers can leave their batches
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can leave teacher batches'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        userId: req.user.userId,
        role: 'teacher'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Teacher batch membership not found'
      })
    }

    if (membership.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message:
          `Cannot leave while membership is ${membership.status}`
      })
    }

    await InstitutionMembership.deleteOne({
      _id: membership._id
    })

    res.status(200).json({
      success: true,
      message: 'You have left the batch successfully'
    })
  } catch (error) {
    console.error(
      'Leave teacher batch error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while leaving teacher batch'
    })
  }
}

const getLearnerJoinRequests = async (req, res) => {
  try {
    // Only teachers can view learner requests
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view learner requests'
      })
    }

    // Find batches where this teacher is approved
    const teacherMemberships =
      await InstitutionMembership.find({
        userId: req.user.userId,
        role: 'teacher',
        status: 'approved'
      }).select('institutionId batchId')

    const batchIds = teacherMemberships
      .map(membership => membership.batchId)
      .filter(Boolean)

    if (batchIds.length === 0) {
      return res.status(200).json({
        success: true,
        requests: []
      })
    }

    // Find pending learner requests for those batches
    const memberships =
      await InstitutionMembership.find({
        batchId: { $in: batchIds },
        role: 'learner',
        status: 'pending'
      })
        .populate({
          path: 'userId',
          select: 'email accountType'
        })
        .populate({
          path: 'institutionId',
          select: 'email accountType'
        })
        .populate({
          path: 'batchId',
          select: 'name department academicYear description'
        })
        .lean()

    const LearnerProfile =
      require('../models/LearnerProfile')

    const requests = await Promise.all(
      memberships.map(async membership => {
        const profile =
          await LearnerProfile.findOne({
            userId: membership.userId?._id
          }).select('fullName')

        return {
          membershipId: membership._id,

          learnerId:
            membership.userId?._id,

          learnerName:
            profile?.fullName ||
            membership.userId?.email ||
            '',

          learnerEmail:
            membership.userId?.email || '',

          institutionId:
            membership.institutionId?._id,

          batchId:
            membership.batchId?._id,

          batchName:
            membership.batchId?.name || '',

          department:
            membership.batchId?.department || '',

          academicYear:
            membership.batchId?.academicYear || '',

          status:
            membership.status,

          createdAt:
            membership.createdAt
        }
      })
    )

    res.status(200).json({
      success: true,
      requests
    })
  } catch (error) {
    console.error(
      'Get learner join requests error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching learner requests'
    })
  }
}

const approveLearnerMembership = async (req, res) => {
  try {
    // Only teachers can approve learners
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can approve learner requests'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    // Find the learner request
    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        role: 'learner',
        status: 'pending'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Learner request not found'
      })
    }

    // Check whether this teacher is approved
    // for the requested batch
    const teacherMembership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId: membership.institutionId,
        batchId: membership.batchId,
        role: 'teacher',
        status: 'approved'
      })

    if (!teacherMembership) {
      return res.status(403).json({
        success: false,
        message:
          'You are not an approved teacher for this batch'
      })
    }

    // Approve learner
    membership.status = 'approved'

    await membership.save()

    res.status(200).json({
      success: true,
      message: 'Learner approved successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Approve learner membership error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while approving learner request'
    })
  }
}

const rejectLearnerMembership = async (req, res) => {
  try {
    // Only teachers can reject learners
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can reject learner requests'
      })
    }

    const { membershipId } = req.body

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: 'Membership ID is required'
      })
    }

    // Find the learner request
    const membership =
      await InstitutionMembership.findOne({
        _id: membershipId,
        role: 'learner',
        status: 'pending'
      })

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Learner request not found'
      })
    }

    // Check whether this teacher is approved
    // for the requested batch
    const teacherMembership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId: membership.institutionId,
        batchId: membership.batchId,
        role: 'teacher',
        status: 'approved'
      })

    if (!teacherMembership) {
      return res.status(403).json({
        success: false,
        message:
          'You are not an approved teacher for this batch'
      })
    }

    // Reject learner
    membership.status = 'rejected'

    await membership.save()

    res.status(200).json({
      success: true,
      message: 'Learner request rejected successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Reject learner membership error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while rejecting learner request'
    })
  }
}

const getApprovedLearners = async (req, res) => {
  try {
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view learners'
      })
    }

    const { batchId } = req.query

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      })
    }

    // Check whether this teacher is approved for this batch
    const teacherMembership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        batchId,
        role: 'teacher',
        status: 'approved'
      })

    if (!teacherMembership) {
      return res.status(403).json({
        success: false,
        message:
          'You are not an approved teacher for this batch'
      })
    }

    // Find approved learners of this batch
    const memberships =
      await InstitutionMembership.find({
        batchId,
        role: 'learner',
        status: 'approved'
      })
        .populate({
          path: 'userId',
          select: 'email accountType'
        })
        .lean()

    const LearnerProfile =
      require('../models/LearnerProfile')

    const learners = await Promise.all(
      memberships.map(async membership => {
        const profile =
          await LearnerProfile.findOne({
            userId: membership.userId?._id
          }).select('fullName')

        return {
          membershipId: membership._id,
          learnerId: membership.userId?._id,
          learnerName:
            profile?.fullName ||
            membership.userId?.email ||
            '',
          learnerEmail:
            membership.userId?.email || '',
          batchId: membership.batchId,
          joinedAt: membership.createdAt
        }
      })
    )

    res.status(200).json({
      success: true,
      learners
    })
  } catch (error) {
    console.error(
      'Get approved learners error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching approved learners'
    })
  }
}

const getInstituteOverview = async (req, res) => {
  try {
    // Only institutes can access this overview
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can access the overview'
      })
    }

    const institutionId = req.user.userId

    // Count batches belonging to this institute
    const totalBatches = await Batch.countDocuments({
      institutionId
    })

    // Get approved teacher memberships
    const approvedTeacherMemberships =
      await InstitutionMembership.find({
        institutionId,
        role: 'teacher',
        status: 'approved'
      }).select('userId')

    // Get approved learner memberships
    const approvedLearnerMemberships =
      await InstitutionMembership.find({
        institutionId,
        role: 'learner',
        status: 'approved'
      }).select('userId')

    // Count unique teachers
    const uniqueTeacherIds = new Set(
      approvedTeacherMemberships.map(
        membership => membership.userId.toString()
      )
    )

    // Count unique learners
    const uniqueLearnerIds = new Set(
      approvedLearnerMemberships.map(
        membership => membership.userId.toString()
      )
    )

    // Count pending teacher batch requests
    const pendingTeacherRequests =
      await InstitutionMembership.countDocuments({
        institutionId,
        role: 'teacher',
        status: 'pending'
      })

    res.status(200).json({
      success: true,
      overview: {
        batches: totalBatches,
        teachers: uniqueTeacherIds.size,
        learners: uniqueLearnerIds.size,
        pendingTeacherRequests
      }
    })
  } catch (error) {
    console.error(
      'Get institute overview error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching institute overview'
    })
  }
}

const getInstituteBatchOverview = async (req, res) => {
  try {
    // Only institutes can access this overview
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can access the batch overview'
      })
    }

    const institutionId = req.user.userId

    // Get all batches belonging to this institute
    const batches = await Batch.find({
      institutionId
    })
      .select('name department academicYear description')
      .sort({
        createdAt: -1
      })

    // Build batch-wise overview
    const batchOverview = await Promise.all(
      batches.map(async batch => {
        const teacherCount =
          await InstitutionMembership.countDocuments({
            institutionId,
            batchId: batch._id,
            role: 'teacher',
            status: 'approved'
          })

        const learnerCount =
          await InstitutionMembership.countDocuments({
            institutionId,
            batchId: batch._id,
            role: 'learner',
            status: 'approved'
          })

        return {
          batchId: batch._id,
          name: batch.name,
          department: batch.department,
          academicYear: batch.academicYear,
          description: batch.description,
          teachers: teacherCount,
          learners: learnerCount
        }
      })
    )

    res.status(200).json({
      success: true,
      batches: batchOverview
    })
  } catch (error) {
    console.error(
      'Get institute batch overview error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching batch overview'
    })
  }
}

const getPublicInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params

    // Find institute account
    const institute = await User.findOne({
      _id: instituteId,
      accountType: 'institute'
    }).select('_id email')

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      })
    }

    // Find institute public profile
    const instituteProfile =
      await InstituteProfile.findOne({
        userId: institute._id
      }).select(
        'instituteName instituteType profilePhoto coverPhoto about contact location website socialLinks'
      )

    if (!instituteProfile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    // Count batches
    const totalBatches =
      await Batch.countDocuments({
        institutionId: institute._id
      })

    // Find approved teachers
    const approvedTeachers =
      await InstitutionMembership.find({
        institutionId: institute._id,
        role: 'teacher',
        status: 'approved'
      }).select('userId')

    const uniqueTeacherIds = new Set(
      approvedTeachers.map(
        membership => membership.userId.toString()
      )
    )

    // Find approved learners
    const approvedLearners =
      await InstitutionMembership.find({
        institutionId: institute._id,
        role: 'learner',
        status: 'approved'
      }).select('userId')

    const uniqueLearnerIds = new Set(
      approvedLearners.map(
        membership => membership.userId.toString()
      )
    )

    res.status(200).json({
      success: true,

      institute: {
        id: institute._id,

        // Public profile
        name: instituteProfile.instituteName,
        type: instituteProfile.instituteType,

        profilePhoto: instituteProfile.profilePhoto,
        coverPhoto: instituteProfile.coverPhoto,

        about: instituteProfile.about,

        contact: {
          email: institute.email,
          phone: instituteProfile.contact?.phone || ''
        },

        location: instituteProfile.location,

        website: instituteProfile.website,

        socialLinks: instituteProfile.socialLinks,

        // Public statistics
        stats: {
          batches: totalBatches,
          teachers: uniqueTeacherIds.size,
          learners: uniqueLearnerIds.size
        }
      }
    })
  } catch (error) {
    console.error(
      'Get public institute error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching public institute'
    })
  }
}

const getPublicInstituteBatches = async (req, res) => {
  try {
    const { instituteId } = req.params

    // Make sure the institute exists
    const institute = await User.findOne({
      _id: instituteId,
      accountType: 'institute'
    }).select('_id')

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      })
    }

    // Get only public batch information
    const batches = await Batch.find({
      institutionId: institute._id
    })
      .select('name department academicYear description')
      .sort({
        createdAt: -1
      })

    res.status(200).json({
      success: true,
      batches
    })
  } catch (error) {
    console.error(
      'Get public institute batches error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching public institute batches'
    })
  }
}

module.exports = {
  getMyInstitutions,
  getMyMemberships,
  searchInstitutions,
  getInstitution,
  joinInstitution,
  joinTeacherBatches,
  getMyTeacherBatches,
  getTeacherJoinRequests,
  approveMembership,
  approveTeacherMembership,
  rejectTeacherMembership,
  cancelTeacherBatchRequest,
  leaveTeacherBatch,
  leaveInstitution,
  cancelJoinRequest,
  getLearnerJoinRequests,
  approveLearnerMembership,
  rejectLearnerMembership,
  getApprovedLearners,
  getInstituteOverview,
  getInstituteBatchOverview,
  getPublicInstitute,
  getPublicInstituteBatches
}