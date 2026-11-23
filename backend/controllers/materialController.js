const Material = require('../models/Material')
const Submission = require('../models/Submission')
const Subject = require('../models/Subject')
const Batch = require('../models/Batch')
const InstitutionMembership = require('../models/InstitutionMembership')
const IndividualCourse = require('../models/IndividualCourse')

// Create Material (Notes, Assignment, Video, Link)
const createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      fileUrl,
      fileType,
      fileName,
      linkUrl,
      contextType = 'institution',
      batchId,
      subjectId,
      individualCourseId,
      dueDate,
      points
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material title is required'
      })
    }

    if (contextType === 'institution') {
      if (!batchId || !subjectId) {
        return res.status(400).json({
          success: false,
          message: 'batchId and subjectId are required for institutional materials'
        })
      }

      const batch = await Batch.findById(batchId)
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        })
      }

      // Check if user is a teacher of this batch or the institute owner
      const isTeacher = await InstitutionMembership.findOne({
        userId: req.user.userId,
        institutionId: batch.institutionId,
        batchId: batch._id,
        role: 'teacher',
        status: 'approved'
      })

      const isInstituteOwner = req.user.userId === batch.institutionId.toString()

      if (!isTeacher && !isInstituteOwner) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to add materials to this batch'
        })
      }

      const material = await Material.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        type: type || 'document',
        fileUrl: fileUrl || '',
        fileType: fileType || '',
        fileName: fileName || '',
        linkUrl: linkUrl || '',
        contextType: 'institution',
        institutionId: batch.institutionId,
        batchId: batch._id,
        subjectId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points: points || 100,
        createdBy: req.user.userId
      })

      return res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material
      })
    } else {
      // Individual course material
      if (!individualCourseId) {
        return res.status(400).json({
          success: false,
          message: 'individualCourseId is required for individual course materials'
        })
      }

      const course = await IndividualCourse.findById(individualCourseId)
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        })
      }

      if (course.teacherId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the course instructor can post materials'
        })
      }

      const material = await Material.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        type: type || 'document',
        fileUrl: fileUrl || '',
        fileType: fileType || '',
        fileName: fileName || '',
        linkUrl: linkUrl || '',
        contextType: 'individual',
        individualCourseId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points: points || 100,
        createdBy: req.user.userId
      })

      return res.status(201).json({
        success: true,
        message: 'Course material added successfully',
        material
      })
    }
  } catch (error) {
    console.error('Create material error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating material'
    })
  }
}

// Get materials by Subject
const getMaterialsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params
    const materials = await Material.find({
      subjectId,
      contextType: 'institution'
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')

    res.json({
      success: true,
      materials
    })
  } catch (error) {
    console.error('Get materials error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching materials'
    })
  }
}

// Get materials for an Individual Course
const getMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const materials = await Material.find({
      individualCourseId: courseId,
      contextType: 'individual'
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')

    res.json({
      success: true,
      materials
    })
  } catch (error) {
    console.error('Get course materials error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course materials'
    })
  }
}

// Delete Material
const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params
    const material = await Material.findById(materialId)

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      })
    }

    if (material.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      })
    }

    await Material.findByIdAndDelete(materialId)
    await Submission.deleteMany({ materialId })

    res.json({
      success: true,
      message: 'Material deleted successfully'
    })
  } catch (error) {
    console.error('Delete material error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting material'
    })
  }
}

// Submit Assignment / Work
const submitWork = async (req, res) => {
  try {
    const { materialId } = req.params
    const { content, fileUrl, fileName, studentName } = req.body

    const material = await Material.findById(materialId)
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // Upsert submission
    let submission = await Submission.findOne({
      materialId,
      studentId: req.user.userId
    })

    if (submission) {
      submission.content = content || submission.content
      submission.fileUrl = fileUrl || submission.fileUrl
      submission.fileName = fileName || submission.fileName
      submission.status = 'submitted'
      await submission.save()
    } else {
      submission = await Submission.create({
        materialId,
        studentId: req.user.userId,
        studentName: studentName || 'Student',
        content,
        fileUrl,
        fileName,
        status: 'submitted'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Work submitted successfully',
      submission
    })
  } catch (error) {
    console.error('Submit work error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment'
    })
  }
}

// Get Submissions for a Material (Teacher View)
const getSubmissions = async (req, res) => {
  try {
    const { materialId } = req.params
    const submissions = await Submission.find({ materialId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    })
  }
}

// Grade a Submission
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { grade, feedback } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    submission.grade = grade
    submission.feedback = feedback
    submission.status = 'graded'
    await submission.save()

    res.json({
      success: true,
      message: 'Graded successfully',
      submission
    })
  } catch (error) {
    console.error('Grade submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while grading'
    })
  }
}

// Get My Submission for a Material (Student View)
const getMySubmission = async (req, res) => {
  try {
    const { materialId } = req.params
    const submission = await Submission.findOne({
      materialId,
      studentId: req.user.userId
    })

    res.json({
      success: true,
      submission: submission || null
    })
  } catch (error) {
    console.error('Get my submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    })
  }
}

module.exports = {
  createMaterial,
  getMaterialsBySubject,
  getMaterialsByCourse,
  deleteMaterial,
  submitWork,
  getSubmissions,
  gradeSubmission,
  getMySubmission
}
