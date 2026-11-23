const express = require('express')
const protect = require('../middleware/authMiddleware')
const {
  createMaterial,
  getMaterialsBySubject,
  getMaterialsByCourse,
  deleteMaterial,
  submitWork,
  getSubmissions,
  gradeSubmission,
  getMySubmission
} = require('../controllers/materialController')

const router = express.Router()

router.post('/', protect, createMaterial)
router.get('/subject/:subjectId', protect, getMaterialsBySubject)
router.get('/course/:courseId', protect, getMaterialsByCourse)
router.delete('/:materialId', protect, deleteMaterial)

// Submissions
router.post('/submit/:materialId', protect, submitWork)
router.get('/submission/:materialId', protect, getMySubmission)
router.get('/submissions/:materialId', protect, getSubmissions)
router.post('/grade/:submissionId', protect, gradeSubmission)

module.exports = router
