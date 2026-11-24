import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function ManageStudents() {
  const { token } = useAuth()
  const { showAlert, showConfirm } = useModal()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterBatch, setFilterBatch] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch student roster and memberships for this institute
  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`${API_BASE_URL}/api/membership/institute/batch-overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (res.ok) {
        // Flatten enrolled learners across all batches
        const allLearners = []
          ; (data.batches || []).forEach((b) => {
            ; (b.learners || []).forEach((l) => {
              allLearners.push({
                _id: l.membershipId || l._id,
                userId: l.userId,
                name: l.name || 'Enrolled Student',
                email: l.email || 'student@eduadapt.com',
                batchName: b.name,
                batchId: b.batchId,
                status: l.status || 'approved',
                joinedAt: l.createdAt || new Date()
              })
            })
          })
        setStudents(allLearners)
      } else {
        throw new Error(data.message || 'Failed to load students')
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchStudents()
  }, [token])

  const batches = ['All', ...new Set(students.map((s) => s.batchName))]

  const filteredStudents = students.filter((s) => {
    const matchesBatch = filterBatch === 'All' || s.batchName === filterBatch
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBatch && matchesSearch
  })

  return (
    <div>
      {/* Top Banner */}
      <div className="card-pro p-4 mb-4 bg-white">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge-meta badge-meta-emerald">
            <i className="bi bi-people-fill"></i> STUDENT ADMISSIONS & ROSTER
          </span>
          <span className="text-muted small">• Enrolled Campus Learners</span>
        </div>
        <h2 className="fw-extrabold text-dark tracking-tight mb-1">Manage Students & Admissions</h2>
        <p className="text-secondary small mb-0">
          Monitor student enrollment counts across batches, review student details, and verify campus cohort rosters.
        </p>

        {/* Filter Bar */}
        <div className="row g-3 align-items-center mt-3 pt-3 border-top">
          <div className="col-12 col-md-4">
            <input
              type="text"
              placeholder="Search enrolled student by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-12 col-md-4 d-flex align-items-center gap-2">
            <label className="small text-secondary text-nowrap fw-semibold">Filter Batch:</label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="form-select form-select-sm"
            >
              {batches.map((b, idx) => (
                <option key={idx} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 text-md-end text-muted small">
            Total Students Found: <strong>{filteredStudents.length}</strong>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="card-pro bg-white overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted small">Loading student roster...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-person-x fs-1 opacity-50 d-block mb-3"></i>
            <h5 className="fw-bold text-dark">No students found</h5>
            <p className="small mb-0">No learners match your search criteria or are enrolled in this batch yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-clean mb-0">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Assigned Batch</th>
                  <th>Enrollment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--brand-700)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {s.userId ? (
                            <span className="fw-bold text-dark">{s.name}</span>
                          ) : (
                            <div className="fw-bold text-dark">{s.name}</div>
                          )}
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {s.batchName}
                      </span>
                    </td>
                    <td>
                      <span className="badge-meta badge-meta-emerald text-capitalize">
                        <i className="bi bi-check-circle-fill"></i> {s.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => showAlert(`Student Profile:\nName: ${s.name}\nEmail: ${s.email}\nBatch: ${s.batchName}`, 'Student Information', 'info')}
                        className="btn btn-sm btn-light border rounded-pill px-3 py-1 text-secondary"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <i className="bi bi-eye me-1"></i> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageStudents
