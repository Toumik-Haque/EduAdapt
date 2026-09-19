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
    <div className="mb-4">

      <div className="mb-3">
        <h5 className="fw-semibold mb-1">
          Teacher Requests
        </h5>

        <p className="text-muted small mb-0">
          Review teachers requesting access to your batches.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          Loading teacher requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <i className="bi bi-person-check fs-1 text-muted"></i>

            <h6 className="mt-3">
              No pending teacher requests
            </h6>

            <p className="text-muted small mb-0">
              New teacher requests will appear here.
            </p>

          </div>
        </div>
      ) : (
        <div className="row g-3">

          {requests.map((request) => (
            <div
              className="col-md-6 col-lg-4"
              key={request.membershipId}
            >
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h6 className="fw-semibold mb-1">
                    {request.teacherName}
                  </h6>

                  <p className="text-muted small mb-3">
                    {request.teacherEmail}
                  </p>

                  <div className="mb-3">

                    <div className="small fw-semibold">
                      Requested Batch
                    </div>

                    <div className="text-muted small">
                      {request.batchName}
                    </div>

                    <div className="text-muted small">
                      {request.department || 'Department not specified'}
                      {' • '}
                      {request.academicYear || 'Academic year not specified'}
                    </div>

                  </div>

                  <div className="d-flex gap-2">

                    <button
                      className="btn btn-primary btn-sm flex-grow-1"
                      disabled={
                        processingId === request.membershipId
                      }
                      onClick={() =>
                        handleApprove(request.membershipId)
                      }
                    >
                      {processingId === request.membershipId
                        ? 'Processing...'
                        : 'Approve'}
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm flex-grow-1"
                      disabled={
                        processingId === request.membershipId
                      }
                      onClick={() =>
                        handleReject(request.membershipId)
                      }
                    >
                      Reject
                    </button>

                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default TeacherRequests