import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SpaceSwitcher from '../../components/SpaceSwitcher/SpaceSwitcher'
import { useAuth } from '../../context/AuthContext'

function IndividualLearning() {
  const { token, user } = useAuth()

  const [activeTab, setActiveTab] = useState('enrolled') // 'enrolled' | 'explore'
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [enrollCode, setEnrollCode] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseMaterials, setCourseMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [submissionModal, setSubmissionModal] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mySubmission, setMySubmission] = useState(null)

  const fetchEnrolled = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/individual-courses/enrolled', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setEnrolledCourses(data.courses || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAvailable = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/individual-courses/available', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableCourses(data.courses || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchEnrolled(), fetchAvailable()])
    setLoading(false)
  }

  useEffect(() => {
    if (token) loadData()
  }, [token])

  const handleEnroll = async (courseId = null, code = '') => {
    try {
      setEnrolling(true)
      setError('')
      setSuccessMsg('')
      const res = await fetch('http://localhost:5000/api/individual-courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, code: code || enrollCode })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Enrollment failed')
      }
      setSuccessMsg('Successfully enrolled in course!')
      setEnrollCode('')
      await loadData()
      setActiveTab('enrolled')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  const openCourseView = async (course) => {
    setSelectedCourse(course)
    setLoadingMaterials(true)
    try {
      const res = await fetch(`http://localhost:5000/api/materials/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setCourseMaterials(data.materials || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handleOpenSubmission = async (material) => {
    setSubmissionModal(material)
    setSubmissionText('')
    setMySubmission(null)
    try {
      const res = await fetch(`http://localhost:5000/api/materials/submission/${material._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.submission) {
        setMySubmission(data.submission)
        setSubmissionText(data.submission.content || '')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    if (!submissionText.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch(`http://localhost:5000/api/materials/submit/${submissionModal._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: submissionText,
          studentName: user?.name || 'Student'
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMySubmission(data.submission)
        setSuccessMsg('Assignment submitted successfully!')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const updateCourseProgress = async (courseId, newProgress) => {
    try {
      const res = await fetch(`http://localhost:5000/api/individual-courses/progress/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress: newProgress })
      })
      if (res.ok) {
        setEnrolledCourses((prev) =>
          prev.map((c) => {
            if (c._id === courseId) {
              const enrolled = c.enrolledStudents.map((s) =>
                s.studentId === user?.userId ? { ...s, progress: newProgress } : s
              )
              return { ...c, enrolledStudents: enrolled }
            }
            return c
          })
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#F8F7FC' }} className="py-4 py-md-5">
      <div className="container">
        <SpaceSwitcher />

        {/* Back navigation when inspecting a course */}
        {selectedCourse ? (
          <div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="btn btn-sm btn-outline-secondary mb-3 rounded-pill d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left"></i> Back to Courses
            </button>

            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <span className="badge bg-primary-subtle text-primary mb-2">
                    {selectedCourse.category || 'General'} • {selectedCourse.level || 'All Levels'}
                  </span>
                  <h2 className="fw-bold mb-1 text-dark">{selectedCourse.title}</h2>
                  <p className="text-muted mb-2">
                    Instructor: <strong>{selectedCourse.teacherId?.name || 'Instructor'}</strong> ({selectedCourse.subject})
                  </p>
                  <p className="mb-0 text-secondary">{selectedCourse.description}</p>
                </div>

                {/* Progress control */}
                {enrolledCourses.some((c) => c._id === selectedCourse._id) && (
                  <div className="p-3 bg-light rounded-3 text-center border" style={{ minWidth: '180px' }}>
                    <div className="small text-muted mb-1">Your Progress</div>
                    <h4 className="fw-bold text-success mb-2">
                      {selectedCourse.enrolledStudents?.find(
                        (s) => s.studentId === user?.userId || s.studentId?._id === user?.userId
                      )?.progress || 0}%
                    </h4>
                    <div className="btn-group btn-group-sm">
                      <button
                        onClick={() =>
                          updateCourseProgress(
                            selectedCourse._id,
                            Math.max(
                              0,
                              (selectedCourse.enrolledStudents?.find(
                                (s) => s.studentId === user?.userId || s.studentId?._id === user?.userId
                              )?.progress || 0) - 25
                            )
                          )
                        }
                        className="btn btn-outline-secondary"
                      >
                        -25%
                      </button>
                      <button
                        onClick={() =>
                          updateCourseProgress(
                            selectedCourse._id,
                            Math.min(
                              100,
                              (selectedCourse.enrolledStudents?.find(
                                (s) => s.studentId === user?.userId || s.studentId?._id === user?.userId
                              )?.progress || 0) + 25
                            )
                          )
                        }
                        className="btn btn-outline-primary"
                      >
                        +25%
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Content / Lessons / Materials */}
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-folder2-open text-primary"></i> Course Materials & Lessons
            </h4>

            {loadingMaterials ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading materials...</div>
              </div>
            ) : courseMaterials.length === 0 ? (
              <div className="bg-white p-5 rounded-4 text-center border text-muted">
                <i className="bi bi-journal-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
                <h5>No course materials posted yet</h5>
                <p className="small mb-0">The instructor has not added learning modules to this course yet.</p>
              </div>
            ) : (
              <div className="row g-3">
                {courseMaterials.map((mat) => (
                  <div key={mat._id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span
                          className={`badge ${
                            mat.type === 'assignment'
                              ? 'bg-warning-subtle text-warning-emphasis'
                              : mat.type === 'video'
                              ? 'bg-danger-subtle text-danger'
                              : mat.type === 'link'
                              ? 'bg-info-subtle text-info-emphasis'
                              : 'bg-primary-subtle text-primary'
                          } text-capitalize`}
                        >
                          <i
                            className={`bi me-1 ${
                              mat.type === 'assignment'
                                ? 'bi-clipboard-check'
                                : mat.type === 'video'
                                ? 'bi-play-circle'
                                : mat.type === 'link'
                                ? 'bi-link-45deg'
                                : 'bi-file-earmark-text'
                            }`}
                          ></i>
                          {mat.type}
                        </span>
                        {mat.dueDate && (
                          <small className="text-muted">
                            Due: {new Date(mat.dueDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                      <h5 className="fw-bold mb-1 text-dark">{mat.title}</h5>
                      <p className="text-muted small flex-grow-1">{mat.description || 'No description provided.'}</p>

                      {mat.linkUrl && (
                        <a
                          href={mat.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-info w-100 mb-2 rounded-3 text-truncate"
                        >
                          <i className="bi bi-box-arrow-up-right me-1"></i> Open Resource
                        </a>
                      )}

                      {mat.fileUrl && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary w-100 mb-2 rounded-3"
                        >
                          <i className="bi bi-download me-1"></i> View / Download File
                        </a>
                      )}

                      {mat.type === 'assignment' && (
                        <button
                          onClick={() => handleOpenSubmission(mat)}
                          className="btn btn-sm btn-warning w-100 rounded-3 text-dark fw-semibold mt-auto"
                        >
                          <i className="bi bi-send me-1"></i> Submit Assignment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Tab View */
          <div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h1 className="fw-bold mb-1">Individual Learning Space</h1>
                <p className="text-muted mb-0">
                  Explore freelance courses, self-paced subjects, and track your personalized study roadmap.
                </p>
              </div>

              {/* Code Quick Enrollment */}
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Course Code (e.g. EDU-XXXX)"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value)}
                  className="form-control form-control-sm text-uppercase"
                  style={{ width: '220px' }}
                />
                <button
                  disabled={!enrollCode.trim() || enrolling}
                  onClick={() => handleEnroll(null, enrollCode)}
                  className="btn btn-sm btn-primary text-nowrap rounded-3"
                >
                  {enrolling ? 'Enrolling...' : 'Join Code'}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}

            {/* Navigation Tabs */}
            <div className="d-flex gap-2 border-bottom mb-4">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`btn btn-sm pb-2 border-0 rounded-0 fw-semibold ${
                  activeTab === 'enrolled'
                    ? 'border-bottom border-primary border-3 text-primary'
                    : 'text-muted'
                }`}
              >
                My Enrolled Courses ({enrolledCourses.length})
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`btn btn-sm pb-2 border-0 rounded-0 fw-semibold ${
                  activeTab === 'explore'
                    ? 'border-bottom border-primary border-3 text-primary'
                    : 'text-muted'
                }`}
              >
                Explore Courses ({availableCourses.length})
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading your courses...</div>
              </div>
            ) : activeTab === 'enrolled' ? (
              /* Enrolled List */
              enrolledCourses.length === 0 ? (
                <div className="bg-white p-5 rounded-4 text-center border">
                  <i className="bi bi-mortarboard fs-1 text-primary opacity-50 d-block mb-3"></i>
                  <h4>No Courses Joined Yet</h4>
                  <p className="text-muted mb-3">
                    You haven't enrolled in any individual self-paced courses yet. Explore our open catalog or enter a teacher's invitation code!
                  </p>
                  <button onClick={() => setActiveTab('explore')} className="btn btn-primary rounded-pill px-4">
                    Explore Available Courses
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {enrolledCourses.map((c) => {
                    const myEnrollment = c.enrolledStudents?.find(
                      (s) => s.studentId === user?.userId || s.studentId?._id === user?.userId
                    )
                    const progress = myEnrollment ? myEnrollment.progress : 0

                    return (
                      <div key={c._id} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="badge bg-secondary-subtle text-secondary">{c.category}</span>
                              <span className="badge bg-light text-dark border">{c.enrollmentCode}</span>
                            </div>
                            <h4 className="fw-bold mb-1">{c.title}</h4>
                            <p className="text-muted small mb-2">Subject: <strong>{c.subject}</strong></p>
                            <p className="text-secondary small">{c.description || 'No description provided'}</p>
                          </div>

                          <div className="mt-3 pt-3 border-top">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>Progress</span>
                              <span className="fw-bold text-dark">{progress}%</span>
                            </div>
                            <div className="progress mb-3" style={{ height: '7px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <button
                              onClick={() => openCourseView(c)}
                              className="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                            >
                              <i className="bi bi-play-circle"></i> Continue Learning
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              /* Explore Available List */
              availableCourses.length === 0 ? (
                <div className="bg-white p-5 rounded-4 text-center border text-muted">
                  <h5>No public courses found at this moment</h5>
                  <p className="small mb-0">Check back later or ask your instructor for their course enrollment code.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {availableCourses.map((c) => {
                    const isAlreadyEnrolled = enrolledCourses.some((item) => item._id === c._id)
                    return (
                      <div key={c._id} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="badge bg-primary-subtle text-primary">{c.category}</span>
                              <span className="badge bg-light text-muted border">{c.level}</span>
                            </div>
                            <h4 className="fw-bold mb-1 text-dark">{c.title}</h4>
                            <div className="text-muted small mb-2">
                              Taught by: <strong>{c.teacherId?.name || 'Instructor'}</strong>
                            </div>
                            <p className="text-secondary small">{c.description || 'No description provided'}</p>
                          </div>

                          <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
                            <div className="fw-bold text-primary">
                              {c.price === 0 ? 'Free' : `$${c.price}`}
                            </div>
                            {isAlreadyEnrolled ? (
                              <button
                                onClick={() => openCourseView(c)}
                                className="btn btn-sm btn-outline-success rounded-pill px-3"
                              >
                                Enrolled (View)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(c._id)}
                                className="btn btn-sm btn-primary rounded-pill px-3"
                              >
                                Enroll Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        )}

        {/* Modal for Submitting Assignments */}
        {submissionModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Submit Assignment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSubmissionModal(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <h6 className="fw-bold text-primary mb-1">{submissionModal.title}</h6>
                  <p className="text-muted small mb-3">{submissionModal.description}</p>

                  {mySubmission && (
                    <div className="alert alert-info py-2 small mb-3">
                      <strong>Status:</strong> {mySubmission.status}
                      {mySubmission.grade && (
                        <div>
                          <strong>Grade:</strong> {mySubmission.grade} |{' '}
                          <strong>Feedback:</strong> {mySubmission.feedback}
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmitAssignment}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Your Solution / Answer / Link</label>
                      <textarea
                        rows="4"
                        className="form-control"
                        placeholder="Type your answer, or paste GitHub/Google Drive links here..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light rounded-3"
                        onClick={() => setSubmissionModal(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary rounded-3"
                      >
                        {submitting ? 'Submitting...' : 'Turn In Work'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndividualLearning
