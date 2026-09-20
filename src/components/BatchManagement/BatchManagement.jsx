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
              className="bi bi-collection"
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
              Batch Management
            </h5>

            <p
              className="mb-0"
              style={{
                color: '#71717A',
                fontSize: '13px'
              }}
            >
              Create and organize learning spaces for your institution.
            </p>
          </div>

        </div>

        {!loading && batches.length > 0 && (
          <div
            className="d-flex align-items-center gap-1 px-2 py-1"
            style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <i className="bi bi-collection" />
            {batches.length} {batches.length === 1 ? 'Batch' : 'Batches'}
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
          CREATE BATCH
      ===================================================== */}
      <div
        className="card border-0 mb-4"
        style={{
          borderRadius: '14px',
          border: '1px solid #E4E4E7',
          boxShadow: '0 2px 8px rgba(24, 24, 27, 0.03)'
        }}
      >

        <div className="card-body p-3 p-md-4">

          <div className="d-flex align-items-center gap-2 mb-3">

            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: '#F5F3FF',
                color: '#7C3AED'
              }}
            >
              <i className="bi bi-plus-lg" />
            </div>

            <div>
              <h6
                className="fw-semibold mb-0"
                style={{
                  color: '#18181B'
                }}
              >
                Create New Batch
              </h6>

              <div
                style={{
                  color: '#71717A',
                  fontSize: '12px'
                }}
              >
                Add a new learning space to your institution.
              </div>
            </div>

          </div>

          <form onSubmit={handleCreate}>

            <div className="row g-3">

              {/* Batch Name */}
              <div className="col-12 col-lg-6">

                <label
                  className="form-label mb-1"
                  style={{
                    color: '#3F3F46',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Batch Name
                </label>

                <div className="input-group">

                  <span
                    className="input-group-text"
                    style={{
                      background: '#FAFAFA',
                      border: '1px solid #E4E4E7',
                      borderRight: 'none',
                      color: '#7C3AED'
                    }}
                  >
                    <i className="bi bi-mortarboard" />
                  </span>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. CSE 3rd Year"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      border: '1px solid #E4E4E7',
                      fontSize: '13px'
                    }}
                  />

                </div>

              </div>

              {/* Department */}
              <div className="col-12 col-md-6 col-lg-3">

                <label
                  className="form-label mb-1"
                  style={{
                    color: '#3F3F46',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Department
                </label>

                <div className="input-group">

                  <span
                    className="input-group-text"
                    style={{
                      background: '#FAFAFA',
                      border: '1px solid #E4E4E7',
                      borderRight: 'none',
                      color: '#7C3AED'
                    }}
                  >
                    <i className="bi bi-diagram-3" />
                  </span>

                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="e.g. CSE"
                    value={formData.department}
                    onChange={handleChange}
                    style={{
                      border: '1px solid #E4E4E7',
                      fontSize: '13px'
                    }}
                  />

                </div>

              </div>

              {/* Academic Year */}
              <div className="col-12 col-md-6 col-lg-3">

                <label
                  className="form-label mb-1"
                  style={{
                    color: '#3F3F46',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Academic Year
                </label>

                <div className="input-group">

                  <span
                    className="input-group-text"
                    style={{
                      background: '#FAFAFA',
                      border: '1px solid #E4E4E7',
                      borderRight: 'none',
                      color: '#7C3AED'
                    }}
                  >
                    <i className="bi bi-calendar3" />
                  </span>

                  <input
                    type="text"
                    name="academicYear"
                    className="form-control"
                    placeholder="e.g. 2026-27"
                    value={formData.academicYear}
                    onChange={handleChange}
                    style={{
                      border: '1px solid #E4E4E7',
                      fontSize: '13px'
                    }}
                  />

                </div>

              </div>

              {/* Description */}
              <div className="col-12">

                <label
                  className="form-label mb-1"
                  style={{
                    color: '#3F3F46',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Description
                  <span
                    className="ms-1"
                    style={{
                      color: '#A1A1AA',
                      fontWeight: '400'
                    }}
                  >
                    Optional
                  </span>
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Add a short description about this batch..."
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    border: '1px solid #E4E4E7',
                    borderRadius: '9px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />

              </div>

            </div>

            {/* Create Button */}
            <div className="d-flex justify-content-end mt-3">

              <button
                type="submit"
                className="btn d-flex align-items-center justify-content-center gap-2"
                disabled={creating}
                style={{
                  background: creating
                    ? '#E4E4E7'
                    : '#7C3AED',
                  color: creating
                    ? '#71717A'
                    : '#FFFFFF',
                  border: '1px solid transparent',
                  borderRadius: '9px',
                  padding: '8px 15px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >

                {creating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      style={{
                        width: '14px',
                        height: '14px'
                      }}
                    />

                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg" />
                    Create Batch
                  </>
                )}

              </button>

            </div>

          </form>

        </div>
      </div>

      {/* =====================================================
          EXISTING BATCHES
      ===================================================== */}
      <div className="mb-3">

        <h6
          className="fw-semibold mb-1"
          style={{
            color: '#18181B'
          }}
        >
          Your Batches
        </h6>

        <p
          className="mb-0"
          style={{
            color: '#71717A',
            fontSize: '12px'
          }}
        >
          Learning spaces currently created for your institution.
        </p>

      </div>

      {loading ? (

        <div
          className="card border-0"
          style={{
            borderRadius: '14px',
            border: '1px solid #E4E4E7'
          }}
        >
          <div className="card-body text-center py-5">

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
              Loading batches...
            </div>

          </div>
        </div>

      ) : batches.length === 0 ? (

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
          <div className="card-body text-center py-5">

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
                className="bi bi-collection"
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
              No batches created yet
            </h6>

            <p
              className="small mb-0"
              style={{
                color: '#71717A'
              }}
            >
              Create your first batch using the form above.
            </p>

          </div>
        </div>

      ) : (

        /* =====================================================
           BATCH CARDS
        ===================================================== */
        <div className="row g-3">

          {batches.map((batch) => (
            <div
              className="col-12 col-md-6 col-xl-4"
              key={batch._id}
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

                  {/* Batch Title */}
                  <div className="d-flex align-items-start gap-3 mb-3">

                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#F5F3FF',
                        color: '#7C3AED'
                      }}
                    >
                      <i className="bi bi-mortarboard" />
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
                        {batch.name}
                      </h6>

                      <div
                        style={{
                          color: '#A1A1AA',
                          fontSize: '11px'
                        }}
                      >
                        Learning Space
                      </div>

                    </div>

                  </div>

                  {/* Metadata */}
                  <div
                    className="d-flex flex-wrap gap-2 mb-3"
                  >

                    {batch.department && (
                      <span
                        className="d-inline-flex align-items-center gap-1 px-2 py-1"
                        style={{
                          background: '#FAFAFA',
                          border: '1px solid #E4E4E7',
                          borderRadius: '7px',
                          color: '#52525B',
                          fontSize: '11px'
                        }}
                      >
                        <i
                          className="bi bi-diagram-3"
                          style={{
                            color: '#7C3AED'
                          }}
                        />

                        {batch.department}
                      </span>
                    )}

                    {batch.academicYear && (
                      <span
                        className="d-inline-flex align-items-center gap-1 px-2 py-1"
                        style={{
                          background: '#FAFAFA',
                          border: '1px solid #E4E4E7',
                          borderRadius: '7px',
                          color: '#52525B',
                          fontSize: '11px'
                        }}
                      >
                        <i
                          className="bi bi-calendar3"
                          style={{
                            color: '#7C3AED'
                          }}
                        />

                        {batch.academicYear}
                      </span>
                    )}

                  </div>

                  {/* Description */}
                  {batch.description ? (
                    <p
                      className="small mb-0"
                      style={{
                        color: '#71717A',
                        lineHeight: '1.6'
                      }}
                    >
                      {batch.description}
                    </p>
                  ) : (
                    <p
                      className="small mb-0"
                      style={{
                        color: '#A1A1AA',
                        fontStyle: 'italic'
                      }}
                    >
                      No description added.
                    </p>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>

      )}

    </section>
  )
}

export default BatchManagement