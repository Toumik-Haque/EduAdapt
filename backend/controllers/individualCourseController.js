const IndividualCourse = require('../models/IndividualCourse')

// Helper to generate a random 6-character code
const generateEnrollmentCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'EDU-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create an individual course (Teacher)
const createCourse = async (req, res) => {
  try {
    if (req.user.accountType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create independent courses'
      })
    }

    const {
      title,
      subject,
      category,
      level,
      description,
      price,
      thumbnail
    } = req.body

    if (!title || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title and subject are required'
      })
    }

    let enrollmentCode = generateEnrollmentCode()
    // Ensure uniqueness
    while (await IndividualCourse.findOne({ enrollmentCode })) {
      enrollmentCode = generateEnrollmentCode()
    }

    const course = await IndividualCourse.create({
      teacherId: req.user.userId,
      title: title.trim(),
      subject: subject.trim(),
      category: category || 'General',
      level: level || 'All Levels',
      description: description ? description.trim() : '',
      price: price || 0,
      thumbnail: thumbnail || '',
      enrollmentCode
    })

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    })
  }
}

// Get all courses created by logged-in teacher
const getTeacherCourses = async (req, res) => {
  try {
    const courses = await IndividualCourse.find({ teacherId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('enrolledStudents.studentId', 'name email')

    res.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get teacher courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    })
  }
}

// Get all public/available courses for learners to explore
const getAvailableCourses = async (req, res) => {
  try {
    const courses = await IndividualCourse.find({ isPublished: true })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get available courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    })
  }
}

// Get courses enrolled by the learner
const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await IndividualCourse.find({
      'enrolledStudents.studentId': req.user.userId
    }).populate('teacherId', 'name email')

    res.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get enrolled courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrolled courses'
    })
  }
}

// Enroll student into course by ID or code
const enrollCourse = async (req, res) => {
  try {
    const { courseId, code } = req.body

    let course
    if (courseId) {
      course = await IndividualCourse.findById(courseId)
    } else if (code) {
      course = await IndividualCourse.findOne({
        enrollmentCode: code.trim().toUpperCase()
      })
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    const alreadyEnrolled = course.enrolledStudents.some(
      (s) => s.studentId && s.studentId.toString() === req.user.userId
    )

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      })
    }

    course.enrolledStudents.push({
      studentId: req.user.userId,
      enrolledAt: new Date(),
      progress: 0
    })

    await course.save()

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      course
    })
  } catch (error) {
    console.error('Enroll course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling'
    })
  }
}

// Update student progress in course
const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params
    const { progress } = req.body

    const course = await IndividualCourse.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    const enrollment = course.enrolledStudents.find(
      (s) => s.studentId && s.studentId.toString() === req.user.userId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      })
    }

    enrollment.progress = Math.min(100, Math.max(0, Number(progress) || 0))
    await course.save()

    res.json({
      success: true,
      message: 'Progress updated',
      progress: enrollment.progress
    })
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    })
  }
}

module.exports = {
  createCourse,
  getTeacherCourses,
  getAvailableCourses,
  getEnrolledCourses,
  enrollCourse,
  updateProgress
}
