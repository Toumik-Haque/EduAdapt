import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function StudyMaterials({ subjectId, batchId, isTeacher = false }) {
  const { token, user } = useAuth()
  const { showAlert, showConfirm } = useModal()

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('document')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  // Submissions Modal (for Teacher to inspect, or Student to submit)
  const [activeMaterial, setActiveMaterial] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [studentSubmission, setStudentSubmission] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [gradeInput, setGradeInput] = useState({})
  const [feedbackInput, setFeedbackInput] = useState({})

  const fetchMaterials = async () => {
    if (!subjectId) return
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:5000/api/materials/subject/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setMaterials(data.materials || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [subjectId, token])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !batchId || !subjectId) return
    try {
      setSaving(true)
      const res = await fetch('http://localhost:5000/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          type,
          linkUrl,
          dueDate: dueDate || undefined,
          contextType: 'institution',
          batchId,
          subjectId
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMaterials([data.material, ...materials])
        setShowAddModal(false)
        setTitle('')
        setDescription('')
        setLinkUrl('')
        setDueDate('')
      } else {
        alert(data.message || 'Failed to add material')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (matId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this study resource? Enrolled students will no longer be able to access it.',
      'Delete Study Material',
      'danger',
      'Delete',
      'Cancel'
    )
    if (!confirmed) return
    try {
      const res = await fetch(`http://localhost:5000/api/materials/${matId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMaterials(materials.filter((m) => m._id !== matId))
        showAlert('Resource removed successfully.', 'Deleted', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('Unable to delete material.', 'Error', 'danger')
    }
  }

  const handleOpenAssignment = async (mat) => {
    setActiveMaterial(mat)
    if (isTeacher) {
      // Fetch all submissions for teacher
      setLoadingSubmissions(true)
      try {
        const res = await fetch(`http://localhost:5000/api/materials/submissions/${mat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSubmissions(false)
      }
    } else {
      // Fetch learner's own submission
      try {
        const res = await fetch(`http://localhost:5000/api/materials/submission/${mat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok && data.submission) {
          setStudentSubmission(data.submission)
          setSubmissionText(data.submission.content || '')
        } else {
          setStudentSubmission(null)
          setSubmissionText('')
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSubmitWork = async (e) => {
    e.preventDefault()
    if (!submissionText.trim() || !activeMaterial) return
    try {
      setSubmitting(true)
      const res = await fetch(`http://localhost:5000/api/materials/submit/${activeMaterial._id}`, {
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
        setStudentSubmission(data.submission)
        showAlert('Your work has been submitted successfully to the instructor!', 'Assignment Submitted', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('Unable to submit assignment.', 'Submission Error', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGrade = async (subId) => {
    const grade = gradeInput[subId]
    const feedback = feedbackInput[subId]
    try {
      const res = await fetch(`http://localhost:5000/api/materials/grade/${subId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade, feedback })
      })
      if (res.ok) {
        showAlert('Grade and written feedback saved successfully!', 'Saved', 'success')
        handleOpenAssignment(activeMaterial)
      }
    } catch (err) {
      console.error(err)
      showAlert('Failed to save grade.', 'Error', 'danger')
    }
  }

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-dark">
          <i className="bi bi-file-earmark-ruled me-1 text-primary"></i> Study Materials & Assignments
        </h6>
        {isTeacher && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
          >
            <i className="bi bi-plus-lg me-1"></i> Add Material
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-muted small py-2">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="p-3 bg-light rounded text-center small text-muted">
          No materials or assignments added yet for this subject.
        </div>
      ) : (
        <div className="row g-2">
          {materials.map((m) => (
            <div key={m._id} className="col-12 col-md-6">
              <div className="card h-100 border rounded-3 p-3 bg-white shadow-none">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span
                    className={`badge ${
                      m.type === 'assignment'
                        ? 'bg-warning-subtle text-warning-emphasis'
                        : m.type === 'video'
                        ? 'bg-danger-subtle text-danger'
                        : m.type === 'link'
                        ? 'bg-info-subtle text-info-emphasis'
                        : 'bg-primary-subtle text-primary'
                    } text-capitalize`}
                  >
                    {m.type}
                  </span>
                  {isTeacher && (
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="btn btn-sm text-danger border-0 p-0"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                </div>

                <div className="fw-bold text-dark small">{m.title}</div>
                {m.description && <div className="text-muted small mb-2">{m.description}</div>}

                {m.dueDate && (
                  <div className="small text-danger mb-2">
                    <i className="bi bi-clock me-1"></i>Due: {new Date(m.dueDate).toLocaleDateString()}
                  </div>
                )}

                <div className="mt-auto d-flex gap-2">
                  {m.linkUrl && (
                    <a
                      href={m.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-light border w-100 small"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i> Open
                    </a>
                  )}

                  {m.type === 'assignment' && (
                    <button
                      onClick={() => handleOpenAssignment(m)}
                      className="btn btn-sm btn-outline-warning text-dark w-100 small fw-semibold"
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      {isTeacher ? 'Submissions' : 'Submit Work'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Material */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold">Post Subject Material</h6>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreate}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">
                      Title <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Chapter 1 Notes or Homework #1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
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
                        className="form-control form-control-sm"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">
                      URL / File Link <span className="optional-tag">(optional)</span>
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Instructions / Details <span className="optional-tag">(optional)</span>
                    </label>
                    <textarea
                      rows="2"
                      className="form-control form-control-sm"
                      placeholder="Add guidance..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-sm btn-primary rounded-pill px-3"
                    >
                      {saving ? 'Posting...' : 'Post Material'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submissions Inspection or Submission Form */}
      {activeMaterial && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold">Assignment: {activeMaterial.title}</h6>
                <button type="button" className="btn-close" onClick={() => setActiveMaterial(null)}></button>
              </div>
              <div className="modal-body">
                {isTeacher ? (
                  /* Teacher Submissions View */
                  <div>
                    {loadingSubmissions ? (
                      <div className="text-center py-3">Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                      <div className="text-center text-muted py-3 small">
                        No student has submitted work for this assignment yet.
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {submissions.map((sub) => (
                          <div key={sub._id} className="list-group-item px-0 py-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong>{sub.studentId?.name || sub.studentName}</strong>
                              <span className="badge bg-secondary-subtle text-secondary small">
                                {sub.status}
                              </span>
                            </div>
                            <div className="p-2 bg-light rounded small mb-2">{sub.content}</div>
                            <div className="d-flex gap-2">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Grade"
                                defaultValue={sub.grade}
                                onChange={(e) =>
                                  setGradeInput({ ...gradeInput, [sub._id]: e.target.value })
                                }
                                style={{ width: '90px' }}
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
                                className="btn btn-sm btn-outline-success"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Student Submission View */
                  <div>
                    {studentSubmission && (
                      <div className="alert alert-info py-2 small mb-3">
                        <div><strong>Status:</strong> {studentSubmission.status}</div>
                        {studentSubmission.grade && (
                          <div>
                            <strong>Grade:</strong> {studentSubmission.grade} |{' '}
                            <strong>Feedback:</strong> {studentSubmission.feedback}
                          </div>
                        )}
                      </div>
                    )}
                    <form onSubmit={handleSubmitWork}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">
                          Your Solution / Link <span className="required-star">*</span>
                        </label>
                        <textarea
                          rows="3"
                          className="form-control form-control-sm"
                          placeholder="Write your answer or paste link to document..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => setActiveMaterial(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn btn-sm btn-primary rounded-pill px-3"
                        >
                          {submitting ? 'Submitting...' : 'Turn In Work'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyMaterials
