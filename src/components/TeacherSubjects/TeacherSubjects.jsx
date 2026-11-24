import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function TeacherSubjects() {
  const { token } = useAuth()

  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApprovedBatches = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/membership/teacher/batches`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load batches'
        )
      }

      const approvedBatches =
        (data.batches || []).filter(
          (batch) => batch.status === 'approved'
        )

      setBatches(approvedBatches)

      if (approvedBatches.length > 0) {
        setSelectedBatch(approvedBatches[0])
      } else {
        setSelectedBatch(null)
      }
    } catch (error) {
      console.error(
        'Failed to load teacher batches:',
        error
      )

      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      return
    }

    fetchApprovedBatches()
  }, [token])

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div
          className="spinner-border"
          style={{
            color: '#7C3AED'
          }}
          role="status"
        ></div>

        <p className="text-secondary mt-3 mb-0">
          Loading your batches...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-3 px-3 py-2"
        style={{
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA'
        }}
      >
        <i className="bi bi-exclamation-circle me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <div className="mb-4">

      <div className="mb-3">
        <h5 className="fw-bold mb-1">
          Subjects
        </h5>

        <p
          className="text-secondary mb-0"
          style={{
            fontSize: '0.85rem'
          }}
        >
          Manage subjects for your approved batches.
        </p>
      </div>

      {batches.length === 0 && (
        <div
          className="bg-white border rounded-4 p-4"
          style={{
            borderColor: '#E9D5FF'
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{
              width: '44px',
              height: '44px',
              background: '#F5F3FF',
              color: '#7C3AED'
            }}
          >
            <i className="bi bi-collection"></i>
          </div>

          <h6 className="fw-semibold mb-1">
            No approved batches
          </h6>

          <p className="text-secondary mb-0">
            You need to be approved for a batch before
            you can manage its subjects.
          </p>
        </div>
      )}

      {batches.length > 0 && (
        <>
          <div
            className="mb-4"
            style={{
              maxWidth: '500px'
            }}
          >
            <label
              className="form-label text-secondary mb-2"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              Teaching Batch
            </label>

            <select
              className="form-select rounded-3"
              value={
                selectedBatch?.batchId || ''
              }
              onChange={(e) => {
                const batch = batches.find(
                  (item) =>
                    item.batchId ===
                    e.target.value
                )

                setSelectedBatch(
                  batch || null
                )
              }}
              style={{
                borderColor: '#DDD6FE',
                boxShadow: 'none'
              }}
            >
              {batches.map((batch) => (
                <option
                  key={batch.membershipId}
                  value={batch.batchId}
                >
                  {batch.batchName}
                </option>
              ))}
            </select>

            {selectedBatch && (
              <div
                className="text-secondary mt-2"
                style={{
                  fontSize: '0.78rem'
                }}
              >
                {selectedBatch.instituteName}
                {selectedBatch.department &&
                  ` • ${selectedBatch.department}`}
                {selectedBatch.academicYear &&
                  ` • ${selectedBatch.academicYear}`}
              </div>
            )}
          </div>

          <div
            className="bg-white border rounded-4 p-4"
            style={{
              borderColor: '#E9D5FF'
            }}
          >
            <h6 className="fw-semibold mb-1">
              {selectedBatch?.batchName}
            </h6>

            <p className="text-secondary mb-0">
              Subjects for this batch will appear here.
            </p>
          </div>
        </>
      )}

    </div>
  )
}

export default TeacherSubjects