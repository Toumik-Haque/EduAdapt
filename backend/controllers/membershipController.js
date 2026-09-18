const InstitutionMembership = require('../models/InstitutionMembership')

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

const joinInstitution = async (req, res) => {
  try {
    const { institutionId } = req.body

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID is required'
      })
    }

    const User = require('../models/User')

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

    // Prevent an institute account from joining itself
    if (req.user.userId.toString() === institutionId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own institution'
      })
    }

    // Check existing membership/request
    const existingMembership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId
      })

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message: `Membership already exists with status: ${existingMembership.status}`
      })
    }

    // Create pending membership request
    const membership =
      await InstitutionMembership.create({
        userId: req.user.userId,
        institutionId,
        role: 'learner',
        status: 'pending'
      })

    res.status(201).json({
      success: true,
      message: 'Institution join request sent successfully',
      membership
    })
  } catch (error) {
    console.error(
      'Join institution error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while joining institution'
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

module.exports = {
  getMyInstitutions,
  searchInstitutions,
  joinInstitution,
  approveMembership
}