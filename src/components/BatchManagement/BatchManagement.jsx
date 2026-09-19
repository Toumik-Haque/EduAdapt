import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function BatchManagement() {
  const { token } = useAuth()

  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    academicYear: '',
    description: ''
  })

  const fetchBatches = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/batches/my',
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
      console.error('Fetch batches error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchBatches()
    }
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Batch name is required')
      return
    }

    try {
      setCreating(true)

      const response = await fetch(
        'http://localhost:5000/api/batches',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to create batch'
        )
      }

      setSuccess('Batch created successfully')

      setFormData({
        name: '',
        department: '',
        academicYear: '',
        description: ''
      })

      fetchBatches()
    } catch (error) {
      console.error('Create batch error:', error)
      setError(error.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h3 className="fw-semibold mb-1">
          Batch Management
        </h3>

        <p className="text-muted mb-0">
          Create and manage batches for your institution.
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

      {/* Create Batch */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">

          <h5 className="fw-semibold mb-3">
            Create New Batch
          </h5>

          <form onSubmit={handleCreate}>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">
                  Batch Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. CSE 3rd Year"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g. CSE"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Academic Year
                </label>

                <input
                  type="text"
                  name="academicYear"
                  className="form-control"
                  placeholder="e.g. 2026-27"
                  value={formData.academicYear}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Optional batch description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={creating}
            >
              {creating ? (
                'Creating...'
              ) : (
                <>
                  <i className="bi bi-plus-lg me-2"></i>
                  Create Batch
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      {/* Existing Batches */}

      <div className="mb-3">
        <h5 className="fw-semibold">
          Your Batches
        </h5>
      </div>

      {loading ? (
        <div className="text-center py-4">
          Loading batches...
        </div>
      ) : batches.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <i
              className="bi bi-collection fs-1 text-muted"
            ></i>

            <h6 className="mt-3">
              No batches created yet
            </h6>

            <p className="text-muted mb-0">
              Create your first batch to get started.
            </p>

          </div>
        </div>
      ) : (
        <div className="row g-3">

          {batches.map((batch) => (
            <div
              className="col-md-6 col-lg-4"
              key={batch._id}
            >
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-semibold mb-2">
                    {batch.name}
                  </h5>

                  {batch.department && (
                    <div className="text-muted small mb-1">
                      <i className="bi bi-diagram-3 me-2"></i>
                      {batch.department}
                    </div>
                  )}

                  {batch.academicYear && (
                    <div className="text-muted small mb-1">
                      <i className="bi bi-calendar3 me-2"></i>
                      {batch.academicYear}
                    </div>
                  )}

                  {batch.description && (
                    <p className="text-muted small mt-3 mb-0">
                      {batch.description}
                    </p>
                  )}

                </div>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default BatchManagement