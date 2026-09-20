import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function TeacherRequests() {
  const { token } = useAuth()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchRequests = async () => {
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
          data.message || 'Failed to fetch teacher requests'
        )
      }

      setRequests(data.requests || [])
    } catch (error) {
      console.error('Fetch teacher requests error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchRequests()
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
        throw new Error(
          data.message || 'Failed to approve teacher'
        )
      }

      setSuccess('Teacher approved successfully')

      fetchRequests()
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
        throw new Error(
          data.message || 'Failed to reject teacher'
        )
      }

      setSuccess('Teacher request rejected')

      fetchRequests()
    } catch (error) {
      console.error('Reject teacher error:', error)
      setError(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <section>

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}
      <div className="d-flex justify-content-between align-items-end mb-3">

        <div className="d-flex align-items-start gap-3">

          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              background: '#F5F3FF',
              color: '#7C3AED'
            }}
          >
            <i
              className="bi bi-person-plus"
              style={{
                fontSize: '17px'
              }}
            />
          </div>

          <div>
            <h5
              className="fw-bold mb-1"
              style={{
                color: '#18181B'
              }}
            >
              Teacher Requests
            </h5>

            <p
              className="mb-0"
              style={{
                color: '#71717A',
                fontSize: '13px'
              }}
            >
              Review teachers requesting access to your batches.
            </p>
          </div>

        </div>

        {/* Request count */}
        {!loading && requests.length > 0 && (
          <div
            className="d-flex align-items-center gap-1 px-2 py-1"
            style={{
              background: '#FFF7ED',
              color: '#C2410C',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <i className="bi bi-clock" />
            {requests.length} Pending
          </div>
        )}

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

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="d-flex align-items-center gap-2 mb-3 px-3 py-2"
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            borderRadius: '10px',
            fontSize: '13px'
          }}
        >
          <i className="bi bi-check-circle" />

          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}
      {loading ? (

        <div
          className="card border-0"
          style={{
            borderRadius: '14px',
            border: '1px solid #E4E4E7',
            boxShadow: '0 2px 8px rgba(24, 24, 27, 0.03)'
          }}
        >
          <div
            className="card-body py-5 text-center"
          >
            <div
              className="spinner-border spinner-border-sm mb-2"
              style={{
                color: '#7C3AED'
              }}
              role="status"
            />

            <div
              className="small"
              style={{
                color: '#71717A'
              }}
            >
              Loading teacher requests...
            </div>
          </div>
        </div>

      ) : requests.length === 0 ? (

        /* =====================================================
           EMPTY STATE
        ===================================================== */
        <div
          className="card border-0"
          style={{
            borderRadius: '14px',
            border: '1px solid #E4E4E7',
            boxShadow: '0 2px 8px rgba(24, 24, 27, 0.03)'
          }}
        >
          <div
            className="card-body text-center py-5"
          >

            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#F5F3FF',
                color: '#7C3AED'
              }}
            >
              <i
                className="bi bi-person-check"
                style={{
                  fontSize: '20px'
                }}
              />
            </div>

            <h6
              className="fw-semibold mb-1"
              style={{
                color: '#18181B'
              }}
            >
              No pending requests
            </h6>

            <p
              className="small mb-0"
              style={{
                color: '#71717A'
              }}
            >
              New teacher requests will appear here.
            </p>

          </div>
        </div>

      ) : (

        /* =====================================================
           REQUEST CARDS
        ===================================================== */
        <div className="row g-3">

          {requests.map((request) => {

            const isProcessing =
              processingId === request.membershipId

            return (
              <div
                className="col-12 col-md-6 col-xl-4"
                key={request.membershipId}
              >

                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                  }}
                >

                  <div className="card-body p-3">

                    {/* =====================================
                        TEACHER
                    ===================================== */}
                    <div
                      className="d-flex align-items-center gap-3 mb-3"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '11px',
                          background: '#F5F3FF',
                          color: '#7C3AED'
                        }}
                      >
                        <i
                          className="bi bi-person"
                          style={{
                            fontSize: '19px'
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >
                        <h6
                          className="fw-semibold mb-1 text-truncate"
                          style={{
                            color: '#18181B'
                          }}
                        >
                          {request.teacherName}
                        </h6>

                        <div
                          className="small text-truncate"
                          style={{
                            color: '#71717A'
                          }}
                        >
                          {request.teacherEmail}
                        </div>
                      </div>

                    </div>

                    {/* =====================================
                        REQUEST INFORMATION
                    ===================================== */}
                    <div
                      className="p-3 mb-3"
                      style={{
                        background: '#FAFAFA',
                        border: '1px solid #F0F0F2',
                        borderRadius: '11px'
                      }}
                    >

                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                      >
                        <i
                          className="bi bi-mortarboard"
                          style={{
                            color: '#7C3AED',
                            fontSize: '13px'
                          }}
                        />

                        <span
                          className="small fw-semibold"
                          style={{
                            color: '#3F3F46'
                          }}
                        >
                          Requested Batch
                        </span>
                      </div>

                      <div
                        className="fw-semibold mb-1"
                        style={{
                          color: '#18181B',
                          fontSize: '14px'
                        }}
                      >
                        {request.batchName}
                      </div>

                      <div
                        className="small"
                        style={{
                          color: '#71717A'
                        }}
                      >
                        {request.department ||
                          'Department not specified'}

                        {' • '}

                        {request.academicYear ||
                          'Academic year not specified'}
                      </div>

                    </div>

                    {/* =====================================
                        ACTIONS
                    ===================================== */}
                    <div className="d-flex gap-2">

                      <button
                        type="button"
                        className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        disabled={isProcessing}
                        onClick={() =>
                          handleApprove(request.membershipId)
                        }
                        style={{
                          background: isProcessing
                            ? '#E4E4E7'
                            : '#7C3AED',
                          color: isProcessing
                            ? '#71717A'
                            : '#FFFFFF',
                          border: '1px solid transparent',
                          borderRadius: '9px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              style={{
                                width: '13px',
                                height: '13px'
                              }}
                            />

                            Processing
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg" />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        disabled={isProcessing}
                        onClick={() =>
                          handleReject(request.membershipId)
                        }
                        style={{
                          background: '#FFFFFF',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '9px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        <i className="bi bi-x-lg" />
                        Reject
                      </button>

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