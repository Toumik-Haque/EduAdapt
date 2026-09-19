const Subject = require('../models/Subject')
const Batch = require('../models/Batch')
const InstitutionMembership = require('../models/InstitutionMembership')

// Create a subject inside a batch
const createSubject = async (req, res) => {
  try {
    const {
      batchId,
      name,
      code,
      description
    } = req.body

    // Only teachers can create subjects
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message:
          'Only approved teachers can create subjects'
      })
    }

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required'
      })
    }

    // Find the batch
    const batch = await Batch.findById(batchId)

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      })
    }

    // Check whether this teacher is approved
    // for this exact batch
    const teacherMembership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId: batch.institutionId,
        batchId: batch._id,
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

    // Create subject
    const subject = await Subject.create({
      institutionId: batch.institutionId,
      batchId: batch._id,
      name: name.trim(),
      code: code
        ? code.trim().toUpperCase()
        : '',
      description: description
        ? description.trim()
        : '',
      createdBy: req.user.userId
    })

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject
    })
  } catch (error) {
    console.error(
      'Create subject error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while creating subject'
    })
  }
}


// Get subjects of a specific batch
const getBatchSubjects = async (req, res) => {
  try {
    const { batchId } = req.params

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      })
    }

    const batch = await Batch.findById(batchId)

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      })
    }

    // User must have an approved membership
    // for this exact batch.
    const membership =
      await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId: batch.institutionId,
        batchId: batch._id,
        status: 'approved'
      })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message:
          'You are not approved for this batch'
      })
    }

    const subjects = await Subject.find({
      batchId: batch._id
    }).sort({
      createdAt: -1
    })

    res.status(200).json({
      success: true,
      subjects
    })
  } catch (error) {
    console.error(
      'Get batch subjects error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Server error while fetching subjects'
    })
  }
}


module.exports = {
  createSubject,
  getBatchSubjects
}