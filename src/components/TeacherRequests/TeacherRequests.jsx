import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function TeacherRequests() {
  const { token } = useAuth()

  const [combinedItems, setCombinedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filters: type ('all' | 'request' | 'invitation'), status ('all' | 'pending' | 'approved' | 'rejected')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'request', 'invitation'
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRequestsAndInvitations = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/requests',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch teacher requests & invitations'
        )
      }

      setCombinedItems(data.combined || data.requests || [])
    } catch (error) {
      console.error('Fetch teacher requests error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchRequestsAndInvitations()
    }
  }, [token])

  const handleApprove = async (membershipId) => {
    try {
      setProcessingId(membershipId)
      setError('')
      setSuccess('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/approve',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            membershipId
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve teacher')
      }

      setSuccess('Teacher approved successfully')
      fetchRequestsAndInvitations()
    } catch (error) {
      console.error('Approve teacher error:', error)
      setError(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (membershipId) => {
    try {
      setProcessingId(membershipId)
      setError('')
      setSuccess('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/reject',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            membershipId
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject teacher')
      }

      setSuccess('Teacher request rejected')
      fetchRequestsAndInvitations()
    } catch (error) {
      console.error('Reject teacher error:', error)
      setError(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  // Filter and search
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false
      }
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false
      }
      // Search term (teacher name, email, batch name)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const nameMatch = (item.teacherName || '').toLowerCase().includes(q)
        const emailMatch = (item.teacherEmail || '').toLowerCase().includes(q)
        const batchMatch = (item.batchName || '').toLowerCase().includes(q)
        const userMatch = (item.teacherUsername || '').toLowerCase().includes(q)
        if (!nameMatch && !emailMatch && !batchMatch && !userMatch) {
          return false
        }
      }
      return true
    })
  }, [combinedItems, typeFilter, statusFilter, searchTerm])

  // Count helper
  const counts = useMemo(() => {
    return {
      all: combinedItems.length,
      requests: combinedItems.filter((i) => i.type === 'request').length,
      invitations: combinedItems.filter((i) => i.type === 'invitation').length,
      pending: combinedItems.filter((i) => i.status === 'pending').length,
      approved: combinedItems.filter((i) => i.status === 'approved').length,
      rejected: combinedItems.filter((i) => i.status === 'rejected').length
    }
  }, [combinedItems])

  return (
    <section>
      {/* =====================================================
          FILTER & CONTROLS TOOLBAR
      ===================================================== */}
      <div
        className="p-3 mb-3 bg-white"
        style={{
          borderRadius: '13px',
          border: '1px solid var(--border-hairline, #E4E4E7)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Top Row: Search and Type Pills */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom">
          {/* Type Segmented Pill Filter */}
          <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-3" style={{ fontSize: '12px' }}>
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`btn btn-sm border-0 py-1 px-2 rounded-2 fw-medium ${
                typeFilter === 'all' ? 'bg-white shadow-xs text-dark' : 'text-secondary'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('request')}
              className={`btn btn-sm border-0 py-1 px-2 rounded-2 fw-medium ${
                typeFilter === 'request' ? 'bg-white shadow-xs text-primary' : 'text-secondary'
              }`}
            >
              Requests ({counts.requests})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('invitation')}
              className={`btn btn-sm border-0 py-1 px-2 rounded-2 fw-medium ${
                typeFilter === 'invitation' ? 'bg-white shadow-xs text-primary' : 'text-secondary'
              }`}
            >
              Invitations ({counts.invitations})
            </button>
          </div>

          {/* Quick Search */}
          <div className="input-group input-group-sm" style={{ maxWidth: '240px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted ps-2 pe-1">
              <i className="bi bi-search" style={{ fontSize: '11px' }}></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 py-1 bg-white"
              style={{ fontSize: '12px', boxShadow: 'none' }}
              placeholder="Search by teacher name, username, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-white bg-white border-start-0 text-muted pe-2"
                onClick={() => setSearchTerm('')}
                type="button"
              >
                <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Status Filter Chips */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-1" style={{ fontSize: '11.5px' }}>
            <span className="text-muted me-1 fw-medium">Status:</span>
            {[
              { id: 'all', label: 'All', badge: counts.all, color: 'btn-outline-secondary' },
              { id: 'pending', label: 'Pending', badge: counts.pending, color: 'btn-outline-warning' },
              { id: 'approved', label: 'Approved', badge: counts.approved, color: 'btn-outline-success' },
              { id: 'rejected', label: 'Rejected / Declined', badge: counts.rejected, color: 'btn-outline-danger' }
            ].map((chip) => {
              const active = statusFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  className={`btn btn-sm py-0 px-2 rounded-pill d-inline-flex align-items-center gap-1 transition-all ${
                    active ? 'btn-dark text-white' : 'btn-light text-secondary border'
                  }`}
                  style={{ fontSize: '11.5px', height: '26px' }}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`badge rounded-pill ${
                      active ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'
                    }`}
                    style={{ fontSize: '9px', padding: '2px 5px' }}
                  >
                    {chip.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Refresh action */}
          <button
            type="button"
            onClick={fetchRequestsAndInvitations}
            disabled={loading}
            className="btn btn-sm btn-light border p-1 rounded-2 text-secondary d-flex align-items-center justify-content-center"
            style={{ width: '26px', height: '26px' }}
            title="Refresh list"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} style={{ fontSize: '12px' }}></i>
          </button>
        </div>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}
      {error && (
        <div
          className="d-flex align-items-start gap-2 mb-3 px-3 py-2"
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            borderRadius: '10px',
            fontSize: '13px'
          }}
        >
          <i className="bi bi-exclamation-circle mt-1" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div
          className="d-flex align-items-start gap-2 mb-3 px-3 py-2"
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            borderRadius: '10px',
            fontSize: '13px'
          }}
        >
          <i className="bi bi-check-circle mt-1" />
          <div>{success}</div>
        </div>
      )}

      {/* =====================================================
          LIST CONTENT
      ===================================================== */}
      {loading ? (
        <div
          className="card border-0"
          style={{
            borderRadius: '14px',
            border: '1px solid #E4E4E7',
            boxShadow: 'none'
          }}
        >
          <div className="card-body py-5 text-center">
            <div
              className="spinner-border spinner-border-sm mb-2"
              style={{ color: '#7C3AED' }}
              role="status"
            />
            <div className="small text-muted">
              Loading teachers requests & invitations...
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className="card border-0 bg-white"
          style={{
            borderRadius: '14px',
            border: '1px solid #E4E4E7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div className="card-body text-center py-5">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#F5F3FF',
                color: '#7C3AED'
              }}
            >
              <i className="bi bi-inbox" style={{ fontSize: '20px' }} />
            </div>

            <h6 className="fw-semibold mb-1 text-dark">
              No matching records found
            </h6>

            <p className="small mb-0 text-muted">
              {typeFilter !== 'all' || statusFilter !== 'all' || searchTerm
                ? 'Try adjusting your filters or search keywords.'
                : 'Incoming requests and faculty invitations will show up here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {filteredItems.map((item) => {
            const isProcessing = processingId === item.membershipId
            const isRequest = item.type === 'request'
            const isPending = item.status === 'pending'
            const isApproved = item.status === 'approved'
            const isRejected = item.status === 'rejected'

            return (
              <div
                key={item.id}
                className="card border-0 bg-white transition-all shadow-xs"
                style={{
                  borderRadius: '12px',
                  border: '1px solid #E4E4E7'
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                    {/* Left: Avatar & Info */}
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: isRequest ? '#F5F3FF' : '#E0F2FE',
                          color: isRequest ? '#7C3AED' : '#0284C7',
                          fontWeight: '600'
                        }}
                      >
                        {item.teacherName ? item.teacherName.charAt(0).toUpperCase() : 'T'}
                      </div>

                      <div className="overflow-hidden lh-sm" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          {item.teacherId ? (
                            <Link
                              to={`/teacher/${item.teacherUsername || item.teacherId}`}
                              className="fw-semibold text-dark text-decoration-none hover-primary text-truncate"
                              style={{ fontSize: '13.5px' }}
                              title="View Teacher Profile"
                            >
                              {item.teacherName}
                            </Link>
                          ) : (
                            <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '13.5px' }}>
                              {item.teacherName}
                            </span>
                          )}
                          {/* Type Pill */}
                          <span
                            className="badge"
                            style={{
                              fontSize: '10px',
                              fontWeight: 500,
                              background: isRequest ? '#FAF5FF' : '#F0F9FF',
                              color: isRequest ? '#7E22CE' : '#0369A1',
                              border: `1px solid ${isRequest ? '#E9D5FF' : '#BAE6FD'}`
                            }}
                          >
                            <i className={`bi ${isRequest ? 'bi-box-arrow-in-down-right' : 'bi-send'} me-1`}></i>
                            {isRequest ? 'Incoming Request' : 'Campus Invitation'}
                          </span>

                          {/* Status Badge */}
                          <span
                            className="badge"
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              background: isApproved
                                ? '#DCFCE7'
                                : isRejected
                                ? '#FEE2E2'
                                : '#FEF3C7',
                              color: isApproved
                                ? '#15803D'
                                : isRejected
                                ? '#B91C1C'
                                : '#B45309',
                              border: `1px solid ${
                                isApproved
                                  ? '#BBF7D0'
                                  : isRejected
                                  ? '#FECACA'
                                  : '#FDE68A'
                              }`
                            }}
                          >
                            {isApproved
                              ? 'Approved / Joined'
                              : isRejected
                              ? 'Rejected / Declined'
                              : 'Pending Action'}
                          </span>
                        </div>

                        {/* Batch Info */}
                        <div className="text-muted small text-truncate" style={{ fontSize: '12px' }}>
                          <span className="fw-medium text-dark">{item.batchName}</span>
                          {(item.department || item.academicYear) && (
                            <span className="text-secondary ms-1">
                              ({item.department || 'General'}
                              {item.academicYear ? ` • ${item.academicYear}` : ''})
                            </span>
                          )}
                          <span className="text-muted ms-2">• {item.teacherEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Date & Inline Action for pending incoming requests */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                      </span>

                      {/* If it's a pending incoming request, show quick Approve/Reject buttons */}
                      {isRequest && isPending && (
                        <div className="d-flex align-items-center gap-1 ms-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center gap-1"
                            style={{ fontSize: '11.5px', borderRadius: '7px' }}
                            disabled={isProcessing}
                            onClick={() => handleApprove(item.membershipId)}
                          >
                            {isProcessing ? (
                              <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }} />
                            ) : (
                              <i className="bi bi-check-lg" />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                            style={{ fontSize: '11.5px', borderRadius: '7px' }}
                            disabled={isProcessing}
                            onClick={() => handleReject(item.membershipId)}
                          >
                            <i className="bi bi-x-lg" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TeacherRequests
