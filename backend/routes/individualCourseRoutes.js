const express = require('express')
const protect = require('../middleware/authMiddleware')
const {
  createCourse,
  getTeacherCourses,
  getAvailableCourses,
  getEnrolledCourses,
  enrollCourse,
  updateProgress
} = require('../controllers/individualCourseController')

const router = express.Router()

router.post('/create', protect, createCourse)
router.get('/teacher', protect, getTeacherCourses)
router.get('/available', protect, getAvailableCourses)
router.get('/enrolled', protect, getEnrolledCourses)
router.post('/enroll', protect, enrollCourse)
router.put('/progress/:courseId', protect, updateProgress)

module.exports = router
