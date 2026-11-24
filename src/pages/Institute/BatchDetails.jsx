import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function BatchDetails() {
  const { batchId } = useParams()
  const { token, user } = useAuth()
  const { showAlert } = useModal()
  const navigate = useNavigate()

  const [batch, setBatch] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [videoLectures, setVideoLectures] = useState([])
  const [studyNotes, setStudyNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Active tab: 'teachers' | 'students' | 'videos' | 'notes' | 'materials'
  const [activeTab, setActiveTab] = useState('teachers')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Section-specific search states
  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [videoSearch, setVideoSearch] = useState('')
  const [noteSearch, setNoteSearch] = useState('')

  // Invite Teacher Modal State
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchingTeachers, setSearchingTeachers] = useState(false)
  const [invitingTeacherId, setInvitingTeacherId] = useState(null)
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('')
  const [inviteErrorMsg, setInviteErrorMsg] = useState('')

  const fetchBatchDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`${API_BASE_URL}/api/batches/${batchId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load batch details')
      }

      setBatch(data.batch)
      setTeachers(data.teachers || [])
      setStudents(data.students || [])
      setVideoLectures(data.videoLectures || [])
      setStudyNotes(data.studyNotes || [])
      setSubjects(data.subjects || [])
    } catch (err) {
      console.error('Fetch batch details error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && batchId) {
      fetchBatchDetails()
    }
  }, [token, batchId])

  // Automatic debounced live search for teachers matching topbar behavior
  useEffect(() => {
    const query = teacherSearchQuery.trim()
    if (!query || query.length < 2) {
      setSearchResults([])
      setSearchingTeachers(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingTeachers(true)
        setInviteErrorMsg('')
        setInviteSuccessMsg('')

        const res = await fetch(
          `${API_BASE_URL}/api/batches/teachers/search?q=${encodeURIComponent(
            query
          )}&batchId=${batchId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Search failed')

        setSearchResults(data.teachers || [])
      } catch (err) {
        console.error('Teacher search error:', err)
        setInviteErrorMsg(err.message)
      } finally {
        setSearchingTeachers(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [teacherSearchQuery, batchId, token])

  // Send batch invitation to teacher
  const handleSendInvite = async (teacher) => {
    try {
      setInvitingTeacherId(teacher._id)
      setInviteErrorMsg('')
      setInviteSuccessMsg('')

      const res = await fetch(`${API_BASE_URL}/api/batches/${batchId}/invite-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ teacherId: teacher._id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send invitation')

      setInviteSuccessMsg(
        `Invitation sent successfully to ${teacher.name || teacher.email}! A notification and email were dispatched.`
      )

      // Update local search results state to reflect 'pending'
      setSearchResults((prev) =>
        prev.map((t) => (t._id === teacher._id ? { ...t, membershipStatus: 'pending' } : t))
      )

      // Refresh batch details
      fetchBatchDetails()
    } catch (err) {
      setInviteErrorMsg(err.message)
    } finally {
      setInvitingTeacherId(null)
    }
  }

  // Filtered lists
  const filteredTeachers = teachers.filter((t) => {
    const q = teacherSearch.trim().toLowerCase()
    if (!q) return true
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.username?.toLowerCase().includes(q)
    )
  })

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return true
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q)
    )
  })

  const filteredVideos = videoLectures.filter((v) => {
    const q = videoSearch.trim().toLowerCase()
    const matchesSearch =
      !q ||
      v.title?.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.createdBy?.name?.toLowerCase().includes(q) ||
      v.subjectId?.name?.toLowerCase().includes(q)
    const matchesSubject =
      selectedSubject === 'all' ||
      v.subjectId?._id === selectedSubject ||
      v.subjectId === selectedSubject
    return matchesSearch && matchesSubject
  })

  const filteredNotes = studyNotes.filter((n) => {
    const q = noteSearch.trim().toLowerCase()
    const matchesSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q) ||
      n.createdBy?.name?.toLowerCase().includes(q) ||
      n.subjectId?.name?.toLowerCase().includes(q)
    const matchesSubject =
      selectedSubject === 'all' ||
      n.subjectId?._id === selectedSubject ||
      n.subjectId === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="container-fluid py-2 px-0 animate-fade-in">
      {/* Top Breadcrumb & Return Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => navigate('/institute/batches')}
            className="btn btn-sm btn-light border rounded-pill px-3 py-1 d-flex align-items-center gap-2 text-secondary"
            style={{ fontSize: '13px', cursor: 'pointer' }}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back to Batches</span>
          </button>
          <span className="text-muted small">/</span>
          <span className="badge-meta badge-meta-purple text-truncate">
            {batch ? batch.name : 'Batch Space'}
          </span>
        </div>

        <Link
          to="/institute/batches"
          className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
          style={{ fontSize: '12px' }}
        >
          <i className="bi bi-gear"></i>
          <span>Batch Management</span>
        </Link>
      </div>

      {loading ? (
        <div className="card-clean p-5 text-center bg-white">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div className="text-secondary small">Loading batch workspace details...</div>
        </div>
      ) : error ? (
        <div className="card-clean p-5 text-center bg-white border border-danger">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-2"></i>
          <h5 className="fw-bold text-dark mb-1">Failed to Open Batch Space</h5>
          <p className="text-muted small mb-3">{error}</p>
          <button onClick={fetchBatchDetails} className="btn-edu-primary mx-auto">
            Try Again
          </button>
        </div>
      ) : batch ? (
        <>
          {/* Batch Hero Banner */}
          <div className="card-clean p-4 p-md-5 mb-4 bg-white border-0 shadow-sm position-relative overflow-hidden">
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '280px',
                height: '280px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none'
              }}
            />

            <div className="row align-items-center g-3">
              <div className="col-12 col-md-8">
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span className="badge-meta badge-meta-emerald">
                    <i className="bi bi-mortarboard-fill me-1"></i> ACTIVE BATCH
                  </span>
                  {batch.department && (
                    <span className="badge bg-light text-secondary border">
                      <i className="bi bi-diagram-3 me-1 text-primary"></i>
                      {batch.department}
                    </span>
                  )}
                  {batch.academicYear && (
                    <span className="badge bg-light text-secondary border">
                      <i className="bi bi-calendar3 me-1 text-primary"></i>
                      {batch.academicYear}
                    </span>
                  )}
                </div>

                <h1 className="fw-extrabold text-dark tracking-tight mb-2" style={{ fontSize: 'clamp(22px, 3.5vw, 32px)' }}>
                  {batch.name}
                </h1>

                <p className="text-secondary small mb-0" style={{ maxWidth: '650px', lineHeight: '1.6' }}>
                  {batch.description || 'Dedicated campus learning space for coursework, faculty, students, and study materials.'}
                </p>
              </div>

              {/* Metrics Pills */}
              <div className="col-12 col-md-4">
                <div className="row g-2 text-center">
                  <div className="col-6">
                    <div className="p-3 rounded-4 bg-light border">
                      <div className="text-primary fw-extrabold fs-4">{teachers.length}</div>
                      <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>
                        <i className="bi bi-person-video3 me-1"></i> Teachers
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-4 bg-light border">
                      <div className="text-primary fw-extrabold fs-4">{students.length}</div>
                      <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>
                        <i className="bi bi-people-fill me-1"></i> Students
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-4 bg-light border">
                      <div className="text-dark fw-extrabold fs-4">{videoLectures.length}</div>
                      <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>
                        <i className="bi bi-camera-video-fill me-1 text-danger"></i> Video Lectures
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-4 bg-light border">
                      <div className="text-dark fw-extrabold fs-4">{studyNotes.length}</div>
                      <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>
                        <i className="bi bi-file-earmark-pdf-fill me-1 text-danger"></i> Notes & PDFs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="card-clean p-2 mb-4 bg-white border d-flex align-items-center justify-content-start flex-wrap gap-2">
            <div className="d-flex align-items-center gap-1 flex-wrap">
              <button
                onClick={() => setActiveTab('teachers')}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                  activeTab === 'teachers'
                    ? 'btn-primary text-white shadow-sm'
                    : 'btn-light text-secondary'
                }`}
                style={{ fontSize: '12px', cursor: 'pointer' }}
              >
                <i className="bi bi-person-video3 me-1"></i> Teachers ({teachers.length})
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                  activeTab === 'students'
                    ? 'btn-primary text-white shadow-sm'
                    : 'btn-light text-secondary'
                }`}
                style={{ fontSize: '12px', cursor: 'pointer' }}
              >
                <i className="bi bi-people-fill me-1"></i> Students ({students.length})
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                  activeTab === 'videos'
                    ? 'btn-primary text-white shadow-sm'
                    : 'btn-light text-secondary'
                }`}
                style={{ fontSize: '12px', cursor: 'pointer' }}
              >
                <i className="bi bi-play-circle-fill me-1"></i> Video Lectures ({videoLectures.length})
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                  activeTab === 'notes'
                    ? 'btn-primary text-white shadow-sm'
                    : 'btn-light text-secondary'
                }`}
                style={{ fontSize: '12px', cursor: 'pointer' }}
              >
                <i className="bi bi-file-earmark-text-fill me-1"></i> Study Notes & PDFs ({studyNotes.length})
              </button>
            </div>
          </div>

          {/* TAB: TEACHERS */}
          {activeTab === 'teachers' && (
            <div className="card-clean p-4 bg-white border">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Assigned Faculty & Teachers</h5>
                  <p className="text-muted small mb-0">Instructors approved and active for this learning space.</p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Modern Search Bar for Teachers */}
                  <div className="input-group input-group-sm" style={{ width: '260px' }}>
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search assigned faculty by name, email, or username..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="form-control border-start-0"
                    />
                    {teacherSearch && (
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        type="button"
                        onClick={() => setTeacherSearch('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>

                  <span className="badge-meta badge-meta-purple">{filteredTeachers.length} Teachers</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(true)
                      setTeacherSearchQuery('')
                      setSearchResults([])
                      setInviteSuccessMsg('')
                      setInviteErrorMsg('')
                    }}
                    className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                    style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Invite Teacher</span>
                  </button>
                </div>
              </div>

              {filteredTeachers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-person-x fs-1 opacity-50 d-block mb-2"></i>
                  No teachers found for this batch.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="small text-muted text-uppercase">Instructor Name</th>
                        <th className="small text-muted text-uppercase">Email Address</th>
                        <th className="small text-muted text-uppercase">Assigned On</th>
                        <th className="small text-muted text-uppercase text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => {
                        const isApproved = teacher.status === 'approved'
                        const isPending = teacher.status === 'pending'
                        const isRejected = teacher.status === 'rejected'

                        return (
                          <tr key={teacher.membershipId || teacher._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold bg-primary-subtle text-primary"
                                  style={{ width: '34px', height: '34px' }}
                                >
                                  {teacher.name?.charAt(0).toUpperCase() || 'T'}
                                </div>
                                <div>
                                  <Link
                                    to={`/teacher/${teacher.username || teacher._id}`}
                                    className="fw-bold text-dark text-decoration-none hover-primary d-inline-block"
                                    title="View Teacher Public Profile"
                                  >
                                    {teacher.name}
                                  </Link>
                                  {teacher.username && (
                                    <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                      @{teacher.username}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-secondary small">{teacher.email}</td>
                            <td className="text-muted small">
                              {teacher.joinedAt ? new Date(teacher.joinedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="text-end">
                              {isApproved && (
                                <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 rounded-pill fw-semibold">
                                  <i className="bi bi-check-circle-fill me-1"></i> Active Faculty
                                </span>
                              )}
                              {isPending && (
                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1 px-2 rounded-pill fw-semibold">
                                  <i className="bi bi-clock-history me-1"></i> Invited / Pending
                                </span>
                              )}
                              {isRejected && (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle py-1 px-2 rounded-pill fw-semibold">
                                  <i className="bi bi-x-circle me-1"></i> Declined
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === 'students' && (
            <div className="card-clean p-4 bg-white border">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Enrolled Students & Learners</h5>
                  <p className="text-muted small mb-0">Learners registered in this batch roster.</p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Modern Search Bar for Students */}
                  <div className="input-group input-group-sm" style={{ width: '260px' }}>
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search enrolled students by name or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="form-control border-start-0"
                    />
                    {studentSearch && (
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        type="button"
                        onClick={() => setStudentSearch('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>

                  <span className="badge-meta badge-meta-emerald">{filteredStudents.length} Students</span>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-people fs-1 opacity-50 d-block mb-2"></i>
                  No students enrolled in this batch yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="small text-muted text-uppercase">Student Name</th>
                        <th className="small text-muted text-uppercase">Email Address</th>
                        <th className="small text-muted text-uppercase">Enrollment Date</th>
                        <th className="small text-muted text-uppercase text-end">Enrollment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold bg-light text-secondary border"
                                style={{ width: '34px', height: '34px' }}
                              >
                                {student.name?.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className="fw-bold text-dark d-inline-block"
                              >
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-secondary small">{student.email}</td>
                          <td className="text-muted small">
                            {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="text-end">
                            <span className="badge bg-info-subtle text-info">Enrolled Learner</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: VIDEO LECTURES */}
          {activeTab === 'videos' && (
            <div className="card-clean p-4 bg-white border">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Video Lectures & Recorded Sessions</h5>
                  <p className="text-muted small mb-0">Access classroom lectures, presentations, and tutorials.</p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Modern Search Bar for Video Lectures */}
                  <div className="input-group input-group-sm" style={{ width: '260px' }}>
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search video lectures by title or topic..."
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                      className="form-control border-start-0"
                    />
                    {videoSearch && (
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        type="button"
                        onClick={() => setVideoSearch('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>

                  {subjects.length > 0 && (
                    <select
                      className="form-select form-select-sm"
                      style={{ width: '180px' }}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-camera-video-off fs-1 opacity-50 d-block mb-2"></i>
                  No video lectures found matching your criteria.
                </div>
              ) : (
                <div className="row g-3">
                  {filteredVideos.map((video) => (
                    <div key={video._id} className="col-12 col-md-6 col-lg-4">
                      <div className="card h-100 border rounded-4 p-3 bg-light d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-danger-subtle text-danger">
                              <i className="bi bi-camera-video me-1"></i> Video Lecture
                            </span>
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(video.createdAt).toLocaleDateString()}
                            </small>
                          </div>

                          <h6 className="fw-bold text-dark mb-1">{video.title}</h6>
                          <div className="text-muted small mb-2">
                            Subject: <strong>{video.subjectId?.name || 'General'}</strong>
                          </div>

                          {video.description && (
                            <p className="text-secondary small mb-3" style={{ fontSize: '12px' }}>
                              {video.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            By: {video.createdBy?.name || 'Faculty'}
                          </span>
                          {(video.fileUrl || video.linkUrl) && (
                            <a
                              href={video.fileUrl || video.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1"
                              style={{ fontSize: '12px' }}
                            >
                              <i className="bi bi-play-circle-fill"></i> Watch Lecture
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDY NOTES & PDFS */}
          {activeTab === 'notes' && (
            <div className="card-clean p-4 bg-white border">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Study Notes, PDFs & Course Handouts</h5>
                  <p className="text-muted small mb-0">View and download course notes, summaries, and materials.</p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Modern Search Bar for Study Notes */}
                  <div className="input-group input-group-sm" style={{ width: '260px' }}>
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search study notes, PDFs, or handouts..."
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      className="form-control border-start-0"
                    />
                    {noteSearch && (
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        type="button"
                        onClick={() => setNoteSearch('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>

                  {subjects.length > 0 && (
                    <select
                      className="form-select form-select-sm"
                      style={{ width: '180px' }}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-file-earmark-x fs-1 opacity-50 d-block mb-2"></i>
                  No study notes or documents found matching your criteria.
                </div>
              ) : (
                <div className="row g-3">
                  {filteredNotes.map((note) => (
                    <div key={note._id} className="col-12 col-md-6 col-lg-4">
                      <div className="card h-100 border rounded-4 p-3 bg-light d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-primary-subtle text-primary text-uppercase">
                              <i className="bi bi-file-earmark-pdf me-1"></i> {note.type || 'DOCUMENT'}
                            </span>
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </small>
                          </div>

                          <h6 className="fw-bold text-dark mb-1">{note.title}</h6>
                          <div className="text-muted small mb-2">
                            Subject: <strong>{note.subjectId?.name || 'General'}</strong>
                          </div>

                          {note.description && (
                            <p className="text-secondary small mb-3" style={{ fontSize: '12px' }}>
                              {note.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            By: {note.createdBy?.name || 'Faculty'}
                          </span>
                          {(note.fileUrl || note.linkUrl) && (
                            <a
                              href={note.fileUrl || note.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1"
                              style={{ fontSize: '12px' }}
                            >
                              <i className="bi bi-file-earmark-arrow-down"></i> Open Material
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}

      {/* =====================================================
          INVITE TEACHER MODAL (Compact & Live Search)
      ===================================================== */}
      {showInviteModal && (
        <div
          className="modal show d-block animate-fade-in"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content border-0 rounded-4 shadow-xl overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header border-bottom px-3 py-2 bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary-subtle"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <i className="bi bi-person-plus-fill fs-6"></i>
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>
                      Invite Teacher
                    </h6>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      To: <strong>{batch?.name}</strong>
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  style={{ fontSize: '11px' }}
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-3 bg-white">
                {/* Search Bar matching Topbar behavior */}
                <div className="position-relative mb-2">
                  <div
                    className="input-group input-group-sm shadow-xs"
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-hairline, #E4E4E7)'
                    }}
                  >
                    <span className="input-group-text bg-white border-end-0 text-secondary ps-3 pe-2 d-flex align-items-center border-0">
                      {searchingTeachers ? (
                        <span className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '13px', height: '13px' }} />
                      ) : (
                        <i className="bi bi-search" style={{ fontSize: '13px' }} />
                      )}
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 px-2 bg-white"
                      style={{ height: '38px', fontSize: '12.5px', boxShadow: 'none' }}
                      placeholder="Search teacher by name, username, or email..."
                      value={teacherSearchQuery}
                      onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {teacherSearchQuery && (
                      <button
                        type="button"
                        className="btn bg-white border-0 text-muted pe-3 d-flex align-items-center"
                        onClick={() => {
                          setTeacherSearchQuery('')
                          setSearchResults([])
                        }}
                      >
                        <i className="bi bi-x-circle-fill" style={{ fontSize: '12px' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Alerts inside modal */}
                {inviteSuccessMsg && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-1 px-2 rounded-2 small mb-2" style={{ fontSize: '11.5px' }}>
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>{inviteSuccessMsg}</span>
                  </div>
                )}

                {inviteErrorMsg && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-1 px-2 rounded-2 small mb-2" style={{ fontSize: '11.5px' }}>
                    <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                    <span>{inviteErrorMsg}</span>
                  </div>
                )}

                {/* Live Results Panel */}
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="text-secondary fw-semibold" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                      Teacher Accounts
                    </span>
                    {searchResults.length > 0 && (
                      <span className="badge bg-light text-secondary border" style={{ fontSize: '9.5px' }}>
                        {searchResults.length} Match{searchResults.length > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>

                  {searchingTeachers ? (
                    <div className="text-center py-4 bg-light rounded-3 border">
                      <div className="spinner-border spinner-border-sm text-primary mb-1" style={{ width: '16px', height: '16px' }}></div>
                      <div className="text-muted" style={{ fontSize: '11.5px' }}>Searching educators...</div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-4 bg-light rounded-3 border text-muted p-2" style={{ fontSize: '12px' }}>
                      {teacherSearchQuery.trim().length >= 2 ? (
                        <>
                          <i className="bi bi-person-x fs-5 d-block mb-1 opacity-50" />
                          No teachers found matching &quot;{teacherSearchQuery}&quot;.
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-badge fs-5 d-block mb-1 opacity-50" />
                          Type 2+ characters to auto-search registered teachers.
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-1" style={{ maxHeight: '230px', overflowY: 'auto' }}>
                      {searchResults.map((t) => {
                        const isApproved = t.membershipStatus === 'approved'
                        const isPending = t.membershipStatus === 'pending'
                        const isSending = invitingTeacherId === t._id

                        return (
                          <div
                            key={t._id}
                            className="p-2 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-2 transition-all hover-shadow-xs"
                          >
                            <div className="d-flex align-items-center gap-2 min-w-0" style={{ flex: 1 }}>
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold bg-primary-subtle text-primary border flex-shrink-0"
                                style={{ width: '32px', height: '32px', fontSize: '13px' }}
                              >
                                {t.name ? t.name.charAt(0).toUpperCase() : 'T'}
                              </div>
                              <div className="min-w-0 lh-sm">
                                <div className="fw-semibold text-truncate" style={{ fontSize: '12.5px' }}>
                                  <Link
                                    to={`/teacher/${t.username || t._id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-dark text-decoration-none hover-primary"
                                    title="View Teacher Profile (opens in new tab)"
                                  >
                                    {t.name || 'Educator'}
                                  </Link>
                                  {t.username && <span className="text-muted fw-normal ms-1">(@{t.username})</span>}
                                </div>
                                <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                                  {t.email}
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              {isApproved ? (
                                <span className="badge bg-success-subtle text-success py-1 px-2 rounded-pill fw-medium" style={{ fontSize: '10.5px' }}>
                                  <i className="bi bi-check-lg me-1"></i> Enrolled
                                </span>
                              ) : isPending ? (
                                <span className="badge bg-warning-subtle text-warning-emphasis py-1 px-2 rounded-pill fw-medium" style={{ fontSize: '10.5px' }}>
                                  <i className="bi bi-clock me-1"></i> Pending
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSendInvite(t)}
                                  disabled={isSending}
                                  className="btn btn-sm btn-primary rounded-pill px-2 py-1 d-flex align-items-center gap-1 fw-medium"
                                  style={{ fontSize: '11.5px', cursor: isSending ? 'not-allowed' : 'pointer' }}
                                >
                                  {isSending ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm" role="status" style={{ width: '10px', height: '10px' }}></span>
                                      <span>Inviting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-send-fill" style={{ fontSize: '10px' }}></i>
                                      <span>Invite</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer border-top px-3 py-2 bg-light d-flex justify-content-between align-items-center">
                <small className="text-muted" style={{ fontSize: '10.5px' }}>
                  <i className="bi bi-bell-fill text-primary me-1"></i>
                  Invites notify teachers via bell notification and email.
                </small>

                <button
                  type="button"
                  className="btn btn-sm btn-light border rounded-pill px-3 py-1"
                  style={{ fontSize: '11.5px' }}
                  onClick={() => setShowInviteModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchDetails
