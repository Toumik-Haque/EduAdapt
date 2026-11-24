import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import SpaceSwitcher from '../../components/SpaceSwitcher/SpaceSwitcher'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function TeacherIndividual() {
  const { token, user } = useAuth()
  const { showAlert, showConfirm } = useModal()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create course modal state
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Computer Science')
  const [level, setLevel] = useState('All Levels')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [creating, setCreating] = useState(false)

  // Manage course materials modal / panel
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)

  // Add material form state
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [matTitle, setMatTitle] = useState('')
  const [matType, setMatType] = useState('document')
  const [matDesc, setMatDesc] = useState('')
  const [matLink, setMatLink] = useState('')
  const [matDueDate, setMatDueDate] = useState('')
  const [creatingMaterial, setCreatingMaterial] = useState(false)

  // Submissions inspector modal
  const [activeMaterial, setActiveMaterial] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [gradeInput, setGradeInput] = useState({})
  const [feedbackInput, setFeedbackInput] = useState({})

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/individual-courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setCourses(data.courses || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchCourses()
  }, [token])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim()) return
    try {
      setCreating(true)
      setError('')
      const res = await fetch(`${API_BASE_URL}/api/individual-courses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          subject,
          category,
          level,
          description,
          price: Number(price) || 0
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create course')
      }
      setSuccess('Course created successfully!')
      setShowModal(false)
      setTitle('')
      setSubject('')
      setDescription('')
      setPrice(0)
      fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const openCourseDetails = async (course) => {
    setSelectedCourse(course)
    setLoadingMaterials(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/materials/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setMaterials(data.materials || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!matTitle.trim() || !selectedCourse) return
    try {
      setCreatingMaterial(true)
      const res = await fetch(`${API_BASE_URL}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: matTitle,
          description: matDesc,
          type: matType,
          linkUrl: matLink,
          dueDate: matDueDate || undefined,
          contextType: 'individual',
          individualCourseId: selectedCourse._id
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMaterials([data.material, ...materials])
        setShowMaterialModal(false)
        setMatTitle('')
        setMatDesc('')
        setMatLink('')
        setMatDueDate('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingMaterial(false)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this course material?',
      'Delete Material',
      'danger',
      'Delete'
    )
    if (!confirmed) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMaterials(materials.filter((m) => m._id !== materialId))
        showAlert('Material removed.', 'Deleted', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('Failed to delete material.', 'Error', 'danger')
    }
  }

  const openSubmissions = async (material) => {
    setActiveMaterial(material)
    setLoadingSubmissions(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/materials/submissions/${material._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setSubmissions(data.submissions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleGrade = async (submissionId) => {
    const grade = gradeInput[submissionId]
    const feedback = feedbackInput[submissionId]
    try {
      const res = await fetch(`${API_BASE_URL}/api/materials/grade/${submissionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade, feedback })
      })
      if (res.ok) {
        showAlert('Grade and student feedback saved!', 'Graded', 'success')
        openSubmissions(activeMaterial)
      }
    } catch (err) {
      console.error(err)
      showAlert('Failed to save grade.', 'Error', 'danger')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#FAF8FF' }} className="py-4 py-md-5">
      <div className="container">
        <SpaceSwitcher />

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h1 className="fw-bold mb-1">Individual Teaching Space</h1>
            <p className="text-muted mb-0">
              Host private courses, publish learning resources, and manage individual students.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary rounded-pill px-4 shadow-sm"
          >
            <i className="bi bi-plus-circle me-1"></i> Create New Course
          </button>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        {/* Selected Course Detail View */}
        {selectedCourse ? (
          <div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="btn btn-sm btn-outline-secondary mb-3 rounded-pill d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left"></i> Back to All Courses
            </button>

            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <div className="d-flex gap-2 align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary">
                      {selectedCourse.category} • {selectedCourse.level}
                    </span>
                    <span className="badge bg-warning-subtle text-dark border">
                      Code: <strong>{selectedCourse.enrollmentCode}</strong>
                    </span>
                  </div>
                  <h3 className="fw-bold text-dark">{selectedCourse.title}</h3>
                  <p className="text-secondary mb-2">{selectedCourse.description}</p>
                  <div className="small text-muted">
                    Total Enrolled Students: <strong>{selectedCourse.enrolledStudents?.length || 0}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="btn btn-primary rounded-3 btn-sm"
                >
                  <i className="bi bi-file-earmark-plus me-1"></i> Add Resource / Assignment
                </button>
              </div>
            </div>

            {/* Course Material List */}
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-collection text-primary"></i> Course Content & Assignments
            </h4>

            {loadingMaterials ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading content...</div>
              </div>
            ) : materials.length === 0 ? (
              <div className="bg-white p-5 rounded-4 text-center border text-muted">
                <i className="bi bi-folder-plus fs-1 text-secondary opacity-50 d-block mb-2"></i>
                <h5>No content posted for this course yet</h5>
                <p className="small mb-3">Share notes, lectures, links or assignments with your enrolled students.</p>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                >
                  Post First Material
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {materials.map((mat) => (
                  <div key={mat._id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-light text-dark border text-capitalize">
                            {mat.type}
                          </span>
                          <button
                            onClick={() => handleDeleteMaterial(mat._id)}
                            className="btn btn-sm text-danger p-0 border-0"
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <h5 className="fw-bold mb-1 text-dark">{mat.title}</h5>
                        <p className="text-muted small">{mat.description || 'No description provided'}</p>
                        {mat.linkUrl && (
                          <a
                            href={mat.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-info w-100 mb-2 rounded-3 text-truncate"
                          >
                            <i className="bi bi-link-45deg me-1"></i> Open Link
                          </a>
                        )}
                      </div>

                      {mat.type === 'assignment' && (
                        <div className="mt-3 pt-2 border-top">
                          <button
                            onClick={() => openSubmissions(mat)}
                            className="btn btn-sm btn-outline-warning w-100 text-dark fw-semibold rounded-3"
                          >
                            <i className="bi bi-eye me-1"></i> View Submissions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* All Courses List */
          <div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading your courses...</div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white p-5 rounded-4 text-center border">
                <i className="bi bi-easel fs-1 text-primary opacity-50 d-block mb-3"></i>
                <h4>No Independent Courses Yet</h4>
                <p className="text-muted mb-4">
                  Create your first individual course to teach students independently outside an institutional space!
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary rounded-pill px-4"
                >
                  Create Course Now
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {courses.map((course) => (
                  <div key={course._id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-primary-subtle text-primary">
                            {course.category}
                          </span>
                          <span className="badge bg-light text-dark border">
                            Code: <strong>{course.enrollmentCode}</strong>
                          </span>
                        </div>
                        <h4 className="fw-bold mb-1 text-dark">{course.title}</h4>
                        <div className="text-muted small mb-2">
                          Subject: <strong>{course.subject}</strong> • {course.level}
                        </div>
                        <p className="text-secondary small">{course.description || 'No description'}</p>
                      </div>

                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="small text-muted">
                            <i className="bi bi-people me-1"></i>{' '}
                            {course.enrolledStudents?.length || 0} Enrolled
                          </span>
                          <span className="fw-bold text-dark">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </div>
                        <button
                          onClick={() => openCourseDetails(course)}
                          className="btn btn-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                        >
                          <i className="bi bi-gear"></i> Manage Course & Content
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Course */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Create Individual Course</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleCreateCourse}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Course Title <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Master Python Programming"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">
                          Subject <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Computer Science"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Level</label>
                        <select
                          className="form-select"
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="All Levels">All Levels</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Category <span className="optional-tag">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Programming, Mathematics, Design"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Description <span className="optional-tag">(optional)</span>
                      </label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Brief overview of course goals and topics..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light rounded-3"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="btn btn-primary rounded-3"
                      >
                        {creating ? 'Creating...' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Material */}
        {showMaterialModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Add Course Material / Assignment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowMaterialModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddMaterial}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Title <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Module 1: Lecture Notes or Homework 1"
                        value={matTitle}
                        onChange={(e) => setMatTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Type</label>
                        <select
                          className="form-select"
                          value={matType}
                          onChange={(e) => setMatType(e.target.value)}
                        >
                          <option value="document">Document / Notes</option>
                          <option value="assignment">Assignment</option>
                          <option value="video">Video</option>
                          <option value="link">Resource Link</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">
                          Due Date <span className="optional-tag">(optional)</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={matDueDate}
                          onChange={(e) => setMatDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Resource Link / URL <span className="optional-tag">(optional)</span>
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={matLink}
                        onChange={(e) => setMatLink(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Description / Instructions <span className="optional-tag">(optional)</span>
                      </label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Add guidance or instructions for students..."
                        value={matDesc}
                        onChange={(e) => setMatDesc(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light rounded-3"
                        onClick={() => setShowMaterialModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingMaterial}
                        className="btn btn-primary rounded-3"
                      >
                        {creatingMaterial ? 'Saving...' : 'Post Material'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Submissions */}
        {activeMaterial && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Submissions for: {activeMaterial.title}</h5>
                  <button type="button" className="btn-close" onClick={() => setActiveMaterial(null)}></button>
                </div>
                <div className="modal-body">
                  {loadingSubmissions ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No student has submitted work for this assignment yet.
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {submissions.map((sub) => (
                        <div key={sub._id} className="list-group-item px-0 py-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold">{sub.studentId?.name || sub.studentName}</span>
                            <span className="badge bg-secondary-subtle text-secondary">{sub.status}</span>
                          </div>
                          <p className="bg-light p-2 rounded small mb-2">{sub.content}</p>

                          <div className="d-flex gap-2 align-items-center">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Grade (e.g. 95/100 or A)"
                              defaultValue={sub.grade}
                              onChange={(e) =>
                                setGradeInput({ ...gradeInput, [sub._id]: e.target.value })
                              }
                              style={{ width: '150px' }}
                            />
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Feedback"
                              defaultValue={sub.feedback}
                              onChange={(e) =>
                                setFeedbackInput({ ...feedbackInput, [sub._id]: e.target.value })
                              }
                            />
                            <button
                              onClick={() => handleGrade(sub._id)}
                              className="btn btn-sm btn-outline-success rounded-3 text-nowrap"
                            >
                              Save Grade
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherIndividual
