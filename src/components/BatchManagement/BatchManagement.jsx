import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function BatchManagement() {
  const { token } = useAuth()
  const { showConfirm, showAlert } = useModal()
  const formRef = useRef(null)

  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingBatchId, setEditingBatchId] = useState(null)
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

  const handleEditClick = (batch) => {
    setError('')
    setSuccess('')
    setEditingBatchId(batch._id)
    setFormData({
      name: batch.name || '',
      department: batch.department || '',
      academicYear: batch.academicYear || '',
      description: batch.description || ''
    })
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCancelEdit = () => {
    setEditingBatchId(null)
    setFormData({
      name: '',
      department: '',
      academicYear: '',
      description: ''
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Batch name is required')
      return
    }

    try {
      setSubmitting(true)

      const url = editingBatchId
        ? `http://localhost:5000/api/batches/${editingBatchId}`
        : 'http://localhost:5000/api/batches'
      const method = editingBatchId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      let data = {}
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.warn('Non-JSON response received:', jsonErr)
      }

      if (!response.ok) {
        throw new Error(
          data.message || (editingBatchId ? 'Failed to update batch' : 'Failed to create batch')
        )
      }

      setSuccess(editingBatchId ? 'Batch updated successfully' : 'Batch created successfully')

      setFormData({
        name: '',
        department: '',
        academicYear: '',
        description: ''
      })
      setEditingBatchId(null)

      fetchBatches()
    } catch (error) {
      console.error('Submit batch error:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBatch = async (batch) => {
    setError('')
    setSuccess('')

    const confirmed = await showConfirm(
      `Are you sure you want to delete the batch "${batch.name}"? Only empty batches with no enrolled members or materials can be deleted.`,
      'Delete Batch',
      'danger',
      'Delete Batch',
      'Keep Batch'
    )

    if (!confirmed) return

    try {
      setDeletingId(batch._id)

      const response = await fetch(`http://localhost:5000/api/batches/${batch._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      let data = {}
      try {
        data = await response.json()
      } catch (err) {
        console.warn('Non-JSON response:', err)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete batch')
      }

      // If this batch was currently being edited, cancel edit mode
      if (editingBatchId === batch._id) {
        handleCancelEdit()
      }

      setSuccess(`Batch "${batch.name}" was deleted successfully.`)
      showAlert(`Batch "${batch.name}" has been deleted successfully.`, 'Batch Deleted', 'success')
      fetchBatches()
    } catch (err) {
      console.error('Delete batch error:', err)
      setError(err.message)
      showAlert(err.message, 'Cannot Delete Batch', 'warning')
    } finally {
      setDeletingId(null)
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
          CREATE OR EDIT BATCH FORM
      ===================================================== */}
      <div
        ref={formRef}
        className="card border-0 mb-4"
        style={{
          borderRadius: '14px',
          border: editingBatchId ? '1px solid #C4B5FD' : '1px solid #E4E4E7',
          boxShadow: editingBatchId
            ? '0 4px 14px rgba(124, 58, 237, 0.08)'
            : '0 2px 8px rgba(24, 24, 27, 0.03)',
          transition: 'all 0.2s ease'
        }}
      >

        <div className="card-body p-3 p-md-4">

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
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
                <i className={editingBatchId ? 'bi bi-pencil-square' : 'bi bi-plus-lg'} />
              </div>

              <div>
                <h6
                  className="fw-semibold mb-0"
                  style={{
                    color: '#18181B'
                  }}
                >
                  {editingBatchId ? 'Edit Batch' : 'Create New Batch'}
                </h6>

                <div
                  style={{
                    color: '#71717A',
                    fontSize: '12px'
                  }}
                >
                  {editingBatchId
                    ? 'Update learning space details and save changes.'
                    : 'Add a new learning space to your institution.'}
                </div>
              </div>
            </div>

            {editingBatchId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{
                  background: '#F4F4F5',
                  color: '#52525B',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-x-lg" />
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>

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
                  Batch Name <span className="required-star">*</span>
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
                  Department <span className="optional-tag">(optional)</span>
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
                  Academic Year <span className="optional-tag">(optional)</span>
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
                  Description <span className="optional-tag">(optional)</span>
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

            {/* Form Action Buttons */}
            <div className="d-flex justify-content-end align-items-center gap-2 mt-3">

              {editingBatchId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn"
                  disabled={submitting}
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid #E4E4E7',
                    borderRadius: '9px',
                    color: '#71717A',
                    fontSize: '13px',
                    fontWeight: '500',
                    padding: '8px 15px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="btn d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
                style={{
                  background: submitting
                    ? '#E4E4E7'
                    : '#7C3AED',
                  color: submitting
                    ? '#71717A'
                    : '#FFFFFF',
                  border: '1px solid transparent',
                  borderRadius: '9px',
                  padding: '8px 15px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >

                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      style={{
                        width: '14px',
                        height: '14px'
                      }}
                    />

                    {editingBatchId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={editingBatchId ? 'bi bi-check-lg' : 'bi bi-plus-lg'} />
                    {editingBatchId ? 'Update Batch' : 'Create Batch'}
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

                  {/* Batch Title & Actions */}
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3">

                    <div className="d-flex align-items-start gap-3 min-w-0">
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: editingBatchId === batch._id ? '#7C3AED' : '#F5F3FF',
                          color: editingBatchId === batch._id ? '#FFFFFF' : '#7C3AED',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="bi bi-mortarboard" />
                      </div>

                      <div style={{ minWidth: 0 }}>
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

                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(batch)}
                        className="btn btn-sm d-inline-flex align-items-center gap-1"
                        title="Edit this batch"
                        style={{
                          background: editingBatchId === batch._id ? '#EDE9FE' : '#F4F4F5',
                          color: editingBatchId === batch._id ? '#6D28D9' : '#52525B',
                          border: editingBatchId === batch._id ? '1px solid #C4B5FD' : '1px solid #E4E4E7',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <i className="bi bi-pencil-square" style={{ fontSize: '12px' }} />
                        <span>{editingBatchId === batch._id ? 'Editing' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batch)}
                        disabled={deletingId === batch._id}
                        className="btn btn-sm d-inline-flex align-items-center justify-content-center text-danger"
                        title="Delete this batch (only empty batches)"
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          cursor: deletingId === batch._id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {deletingId === batch._id ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            style={{ width: '11px', height: '11px' }}
                          />
                        ) : (
                          <i className="bi bi-trash3" style={{ fontSize: '12px' }} />
                        )}
                      </button>
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
                      className="small mb-3"
                      style={{
                        color: '#71717A',
                        lineHeight: '1.6'
                      }}
                    >
                      {batch.description}
                    </p>
                  ) : (
                    <p
                      className="small mb-3"
                      style={{
                        color: '#A1A1AA',
                        fontStyle: 'italic'
                      }}
                    >
                      No description added.
                    </p>
                  )}

                  {/* Open Batch Space Link Button */}
                  <div className="pt-2 border-top">
                    <Link
                      to={`/institute/batches/${batch._id}`}
                      className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: '#F5F3FF',
                        border: '1px solid #DDD6FE',
                        borderRadius: '9px',
                        color: '#7C3AED',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '7px 12px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: '11px' }}></i>
                      <span>View Batch Space & Content</span>
                    </Link>
                  </div>

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