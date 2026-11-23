import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function TeacherBatchMembership() {
  const { token } = useAuth()

  const [institutions, setInstitutions] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState(null)

  const [batches, setBatches] = useState([])
  const [selectedBatchIds, setSelectedBatchIds] = useState([])

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [joining, setJoining] = useState(false)

  const [processingId, setProcessingId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [myBatches, setMyBatches] = useState([])

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `http://localhost:5000/api/membership/institutions?search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch institutions'
        )
      }

      setInstitutions(data.institutions || [])
    } catch (error) {
      console.error('Fetch institutions error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBatches = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/batches',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch your batches'
        )
      }

      setMyBatches(data.batches || [])
    } catch (error) {
      console.error('Fetch teacher batches error:', error)
      setError(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchInstitutions()
      fetchMyBatches()
    }
  }, [token])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchInstitutions()
  }

  const openBatchSelection = async (institution) => {
    try {
      setError('')
      setSuccess('')
      setSelectedInstitution(institution)
      setSelectedBatchIds([])
      setBatches([])

      setBatchLoading(true)

      const response = await fetch(
        `http://localhost:5000/api/batches/institution/${institution.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch batches'
        )
      }

      setBatches(data.batches || [])
    } catch (error) {
      console.error('Fetch institution batches error:', error)
      setError(error.message)
    } finally {
      setBatchLoading(false)
    }
  }

  const toggleBatch = (batchId) => {
    setSelectedBatchIds((current) => {
      if (current.includes(batchId)) {
        return current.filter((id) => id !== batchId)
      }

      return [...current, batchId]
    })
  }

  const handleJoin = async () => {
    if (!selectedInstitution) return

    if (selectedBatchIds.length === 0) {
      setError('Please select at least one batch')
      return
    }

    try {
      setJoining(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/join',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            institutionId: selectedInstitution.id,
            batchIds: selectedBatchIds
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to send join request'
        )
      }

      setSuccess('Batch join request sent successfully')

      setSelectedInstitution(null)
      setBatches([])
      setSelectedBatchIds([])

      fetchMyBatches()
    } catch (error) {
      console.error('Teacher join error:', error)
      setError(error.message)
    } finally {
      setJoining(false)
    }
  }

  const handleCancelRequest = async (membershipId) => {
    try {
      setProcessingId(membershipId)
      setError('')
      setSuccess('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/cancel',
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
          data.message || 'Failed to cancel request'
        )
      }

      setSuccess('Batch join request cancelled successfully')

      fetchMyBatches()
    } catch (error) {
      console.error('Cancel teacher request error:', error)
      setError(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleLeaveBatch = async (membershipId) => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this batch?'
    )

    if (!confirmed) {
      return
    }

    try {
      setProcessingId(membershipId)
      setError('')
      setSuccess('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/leave',
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
          data.message || 'Failed to leave batch'
        )
      }

      setSuccess('You have left the batch successfully')

      fetchMyBatches()
    } catch (error) {
      console.error('Leave teacher batch error:', error)
      setError(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-1">
            Join an Institution
          </h5>

          <p className="text-muted small">
            Find an institution and request access to its batches.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search institutions by name, campus type, or location..."
              value={search}
              onChange={handleSearch}
            />

            <button
              type="submit"
              className="btn btn-primary"
            >
              Search
            </button>
          </form>
        </div>
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

      <div className="mb-4">
        <h5 className="fw-semibold mb-3">
          Institutions
        </h5>

        {loading ? (
          <div className="text-center py-4">
            Loading institutions...
          </div>
        ) : institutions.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-4">
              <p className="text-muted mb-0">
                No institutions found.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {institutions.map((institution) => (
              <div
                className="col-md-6 col-lg-4"
                key={institution.id}
              >
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold">
                      {institution.instituteName ||
                        institution.name ||
                        institution.email}
                    </h6>

                    <p className="text-muted small mb-3">
                      {institution.email}
                    </p>

                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        openBatchSelection(institution)
                      }
                    >
                      Select Batches
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h5 className="fw-semibold mb-3">
          My Institution Batches
        </h5>

        {myBatches.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-4">
              <p className="text-muted mb-0">
                You have not joined any batches yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {myBatches.map((batch) => (
              <div
                className="col-md-6 col-lg-4"
                key={batch.membershipId}
              >
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column">

                    <h6 className="fw-semibold">
                      {batch.batchName}
                    </h6>

                    <p className="text-muted small mb-1">
                      {batch.department ||
                        'Department not specified'}
                    </p>

                    <p className="text-muted small mb-3">
                      {batch.academicYear ||
                        'Academic year not specified'}
                    </p>

                    <div className="mt-auto">

                      <span
                        className={`badge ${
                          batch.status === 'approved'
                            ? 'bg-success'
                            : batch.status === 'pending'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary'
                        }`}
                      >
                        {batch.status}
                      </span>

                      {batch.status === 'pending' && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100 mt-3"
                          disabled={
                            processingId === batch.membershipId
                          }
                          onClick={() =>
                            handleCancelRequest(
                              batch.membershipId
                            )
                          }
                        >
                          {processingId === batch.membershipId
                            ? 'Cancelling...'
                            : 'Cancel Request'}
                        </button>
                      )}

                      {batch.status === 'approved' && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100 mt-3"
                          disabled={
                            processingId === batch.membershipId
                          }
                          onClick={() =>
                            handleLeaveBatch(
                              batch.membershipId
                            )
                          }
                        >
                          {processingId === batch.membershipId
                            ? 'Leaving...'
                            : 'Leave Batch'}
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedInstitution && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  Select Batches
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedInstitution(null)
                    setBatches([])
                    setSelectedBatchIds([])
                  }}
                ></button>
              </div>

              <div className="modal-body">
                <p className="text-muted small">
                  Select the batches you want to teach in.
                </p>

                {batchLoading ? (
                  <div className="text-center py-3">
                    Loading batches...
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted mb-0">
                      This institution has no batches yet.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {batches.map((batch) => (
                      <label
                        key={batch._id}
                        className="border rounded p-3"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedBatchIds.includes(
                              batch._id
                            )}
                            onChange={() =>
                              toggleBatch(batch._id)
                            }
                          />

                          <span className="form-check-label fw-semibold">
                            {batch.name}
                          </span>
                        </div>

                        <div className="text-muted small ms-4 mt-1">
                          {batch.department ||
                            'Department not specified'}
                          {' • '}
                          {batch.academicYear ||
                            'Academic year not specified'}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    setSelectedInstitution(null)
                    setBatches([])
                    setSelectedBatchIds([])
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    joining ||
                    batchLoading ||
                    batches.length === 0
                  }
                  onClick={handleJoin}
                >
                  {joining
                    ? 'Sending...'
                    : 'Send Join Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherBatchMembership