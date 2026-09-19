const express = require('express')

const {
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
} = require('../controllers/membershipController')

const {
  getInstituteProfile,
  updateInstituteProfile,
  uploadInstituteProfilePhoto,
  uploadInstituteCoverPhoto
} = require('../controllers/instituteProfileController')

const upload = require('../middleware/upload')

const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get(
  '/my-institutions',
  protect,
  getMyInstitutions
)
router.get(
  '/my-memberships',
  protect,
  getMyMemberships
)
router.get(
  '/institutions/:institutionId',
  protect,
  getInstitution
)
router.get(
  '/institutions',
  protect,
  searchInstitutions
)
router.post(
  '/join',
  protect,
  joinInstitution
)
router.post(
  '/teacher/join',
  protect,
  joinTeacherBatches
)
router.get(
  '/teacher/batches',
  protect,
  getMyTeacherBatches
)
router.get(
  '/teacher/requests',
  protect,
  getTeacherJoinRequests
)
router.patch(
  '/approve',
  protect,
  approveMembership
)
router.post(
  '/teacher/approve',
  protect,
  approveTeacherMembership
)
router.post(
  '/teacher/reject',
  protect,
  rejectTeacherMembership
)
router.post(
  '/teacher/cancel',
  protect,
  cancelTeacherBatchRequest
)
router.post(
  '/teacher/leave',
  protect,
  leaveTeacherBatch
)
router.delete(
  '/leave',
  protect,
  leaveInstitution
)
router.delete(
  '/cancel',
  protect,
  cancelJoinRequest
)

router.get(
  '/teacher/learner-requests',
  protect,
  getLearnerJoinRequests
)
router.post(
  '/teacher/learner-approve',
  protect,
  approveLearnerMembership
)
router.post(
  '/teacher/learner-reject',
  protect,
  rejectLearnerMembership
)
router.get(
  '/teacher/learners',
  protect,
  getApprovedLearners
)

router.get(
  '/institute/overview',
  protect,
  getInstituteOverview
)

router.get(
  '/institute/batch-overview',
  protect,
  getInstituteBatchOverview
)

router.get(
  '/public/institute/:instituteId',
  getPublicInstitute
)
router.get(
  '/public/institute/:instituteId/batches',
  getPublicInstituteBatches
)


// ==========================
router.put(
  '/institute/profile',
  protect,
  updateInstituteProfile
)
router.get(
  '/institute/profile',
  protect,
  getInstituteProfile
)
router.post(
  '/institute/profile/photo',
  protect,
  upload.single('profilePhoto'),
  uploadInstituteProfilePhoto
)
router.post(
  '/institute/profile/cover',
  protect,
  upload.single('coverPhoto'),
  uploadInstituteCoverPhoto
)

module.exports = router