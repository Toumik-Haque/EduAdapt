const Batch = require('../models/Batch')
const InstituteProfile = require('../models/InstituteProfile')

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


module.exports = {
  createBatch,
  getMyBatches,
  getInstitutionBatches
}