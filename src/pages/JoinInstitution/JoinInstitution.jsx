import { useEffect, useState } from 'react'
import SpaceSwitcher from '../../components/SpaceSwitcher/SpaceSwitcher'
import { useAuth } from '../../context/AuthContext'

function JoinInstitution() {
  const { token, user } = useAuth()

  const isTeacher =
    user?.accountType === 'teacher'

  const [institutions, setInstitutions] = useState([])
  const [memberships, setMemberships] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  // Batch selection
  const [selectedInstitution, setSelectedInstitution] = useState(null)

  const [batches, setBatches] = useState([])
  const [selectedBatchIds, setSelectedBatchIds] = useState([])

  const [batchLoading, setBatchLoading] = useState(false)
  const [institutionBatches, setInstitutionBatches] = useState({})

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
          data.message || 'Failed to load institutions'
        )
      }

      const institutionList = data.institutions || []

      setInstitutions(institutionList)

      await fetchInstitutionBatches(institutionList)
    } catch (error) {
      console.error(
        'Failed to load institutions:',
        error
      )

      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberships = async () => {
    try {
      const endpoint = isTeacher
        ? 'http://localhost:5000/api/membership/teacher/batches'
        : 'http://localhost:5000/api/membership/my-memberships'

      const response = await fetch(
        endpoint,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load memberships'
        )
      }

      setMemberships(
        isTeacher
          ? data.batches || []
          : data.memberships || []
      )
    } catch (error) {
      console.error(
        'Failed to load memberships:',
        error
      )
    }
  }

  const fetchInstitutionBatches = async (
    institutionList
  ) => {
    try {
      const results = await Promise.all(
        institutionList.map(
          async (institution) => {
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
                data.message ||
                'Failed to load batches'
              )
            }

            return {
              institutionId:
                institution.id,
              batches:
                data.batches || []
            }
          }
        )
      )

      const batchMap = {}

      results.forEach((item) => {
        batchMap[item.institutionId] =
          item.batches
      })

      setInstitutionBatches(batchMap)
    } catch (error) {
      console.error(
        'Failed to load institution batches:',
        error
      )
    }
  }

  useEffect(() => {
    if (!token) return

    fetchInstitutions()
    fetchMemberships()
  }, [token, search, isTeacher])

  const getMembershipsForInstitution = (
    institutionId
  ) => {
    return memberships.filter(
      (item) =>
        item.institutionId?.toString() ===
        institutionId?.toString()
    )
  }

  const getJoinedBatchCount = (
    institutionId
  ) => {
    return getMembershipsForInstitution(
      institutionId
    ).filter(
      (membership) =>
        membership.status === 'approved'
    ).length
  }

  const handleOpenBatchSelection = async (
    institution
  ) => {
    try {
      setSelectedInstitution(institution)
      setBatches([])
      setSelectedBatchIds([])
      setError('')
      setSuccess('')
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
          data.message ||
          'Failed to load batches'
        )
      }

      setBatches(data.batches || [])
    } catch (error) {
      console.error(
        'Failed to load institution batches:',
        error
      )

      setError(error.message)
      setSelectedInstitution(null)
    } finally {
      setBatchLoading(false)
    }
  }

  const toggleBatch = (batchId) => {
    setSelectedBatchIds((previous) => {
      if (previous.includes(batchId)) {
        return previous.filter(
          (id) => id !== batchId
        )
      }

      return [...previous, batchId]
    })
  }

  const handleJoin = async () => {
    if (!selectedInstitution) {
      return
    }

    if (selectedBatchIds.length === 0) {
      setError(
        'Please select at least one batch.'
      )

      return
    }

    try {
      setActionId(selectedInstitution.id)
      setError('')
      setSuccess('')

      const endpoint = isTeacher
        ? 'http://localhost:5000/api/membership/teacher/join'
        : 'http://localhost:5000/api/membership/join'

      const response = await fetch(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            institutionId:
              selectedInstitution.id,
            batchIds:
              selectedBatchIds
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to send join request'
        )
      }

      await fetchMemberships()

      setSuccess(
        isTeacher
          ? 'Teacher batch join request sent successfully.'
          : 'Batch join request sent successfully.'
      )

      setSelectedInstitution(null)
      setBatches([])
      setSelectedBatchIds([])
    } catch (error) {
      console.error(
        'Join institution error:',
        error
      )

      setError(error.message)
    } finally {
      setActionId(null)
    }
  }

  const handleCancel = async (
    membershipId
  ) => {
    try {
      setActionId(membershipId)
      setError('')
      setSuccess('')

      const endpoint = isTeacher
        ? 'http://localhost:5000/api/membership/teacher/cancel'
        : 'http://localhost:5000/api/membership/cancel'

      const response = await fetch(
        endpoint,
        {
          method: isTeacher
            ? 'POST'
            : 'DELETE',
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
          data.message ||
          'Failed to cancel request'
        )
      }

      await fetchMemberships()

      setSuccess(
        'Batch join request cancelled successfully.'
      )
    } catch (error) {
      console.error(
        'Cancel request error:',
        error
      )

      setError(error.message)
    } finally {
      setActionId(null)
    }
  }

  const handleLeave = async (
    membershipId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this batch?'
    )

    if (!confirmed) {
      return
    }

    try {
      setActionId(membershipId)
      setError('')
      setSuccess('')

      const endpoint = isTeacher
        ? 'http://localhost:5000/api/membership/teacher/leave'
        : 'http://localhost:5000/api/membership/leave'

      const response = await fetch(
        endpoint,
        {
          method: isTeacher
            ? 'POST'
            : 'DELETE',
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
          data.message ||
          'Failed to leave batch'
        )
      }

      await fetchMemberships()

      setSuccess(
        'You have left the batch successfully.'
      )
    } catch (error) {
      console.error(
        'Leave batch error:',
        error
      )

      setError(error.message)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 70px)',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
      }}
    >
      <div
        className="container py-4 px-3 d-flex flex-column"
        style={{
          height: '100%',
          minHeight: 0
        }}
      >
        {/* ================= FIXED SECTION ================= */}
        <div style={{ flexShrink: 0 }}>

          <div className='d-flex justify-content-between'>

            {/* ================= HEADER ================= */}
            <h2
              className="fw-bold mb-2"
              style={{
                letterSpacing: '-0.5px'
              }}
            >
              Join your Institution
            </h2>

            {/* ================= SPACE SWITCHER ================= */}
            <SpaceSwitcher />

          </div>

          <p
            className="text-secondary mb-4"
            style={{
              fontSize: '0.95rem',
              maxWidth: '600px'
            }}
          >
            {isTeacher
              ? 'Find your institution and select the batches where you want to teach.'
              : 'Find your institution and select the batches you want to join.'}
          </p>

          {/* ================= SEARCH ================= */}
          <div className="mb-4">

            <div
              className="position-relative"
              style={{ maxWidth: '650px' }}
            >

              <i
                className="bi bi-search position-absolute"
                style={{
                  left: '15px',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  color: '#8B5CF6'
                }}
              ></i>

              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Search institutions by name, campus type, or location..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  paddingLeft: '42px',
                  height: '46px',
                  borderColor: '#E9D5FF',
                  boxShadow: 'none'
                }}
              />

            </div>

          </div>

          {/* ================= SUCCESS ================= */}
          {success && (
            <div
              className="rounded-3 px-3 py-2 mb-4"
              style={{
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
                maxWidth: '650px',
                fontSize: '0.9rem'
              }}
            >
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          {/* ================= ERROR ================= */}
          {error && (
            <div
              className="rounded-3 px-3 py-2 mb-4"
              style={{
                background: '#FEF2F2',
                color: '#B91C1C',
                border: '1px solid #FECACA',
                maxWidth: '650px',
                fontSize: '0.9rem'
              }}
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="py-5 text-center">

              <div
                className="spinner-border"
                style={{
                  color: '#7C3AED',
                  width: '1.8rem',
                  height: '1.8rem'
                }}
                role="status"
              ></div>

              <p className="text-secondary mt-3 mb-0">
                Loading institutions...
              </p>

            </div>
          )}

        </div>

        {/* ================= SCROLLABLE INSTITUTIONS ================= */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '6px'
          }}
        >
          {!loading && (
            <>
              {institutions.length === 0 ? (

                <div
                  className="text-center py-5"
                  style={{
                    maxWidth: '650px'
                  }}
                >

                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: '#F5F3FF',
                      color: '#8B5CF6'
                    }}
                  >
                    <i className="bi bi-building fs-5"></i>
                  </div>

                  <p className="text-secondary mb-0">
                    No institutions found.
                  </p>

                </div>

              ) : (

                <div className="row g-3">

                  {institutions.map(
                    (institution) => {

                      const allBatches =
                        institutionBatches[
                        institution.id
                        ] || []

                      const joinedBatchCount =
                        getJoinedBatchCount(
                          institution.id
                        )

                      const isActionLoading =
                        actionId ===
                        institution.id

                      return (
                        <div
                          className="col-md-6 col-lg-4"
                          key={institution.id}
                        >

                          <div
                            className="bg-white rounded-4 border h-100 p-4"
                            style={{
                              transition:
                                'all 0.2s ease',
                              boxShadow:
                                '0 4px 15px rgba(15, 23, 42, 0.03)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                'translateY(-3px)'

                              e.currentTarget.style.borderColor =
                                '#C4B5FD'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform =
                                'translateY(0)'

                              e.currentTarget.style.borderColor =
                                '#dee2e6'
                            }}
                          >

                            {/* CARD HEADER */}
                            <div className="d-flex justify-content-between align-items-start">

                              <div>

                                <h5 className="fw-semibold mb-1">
                                  <Link
                                    to={`/institute/${institution.username || institution.id}`}
                                    className="text-dark text-decoration-none hover-primary"
                                    title="View Campus Public Profile"
                                  >
                                    {institution.instituteName}
                                  </Link>
                                </h5>

                                <p
                                  className="text-secondary text-capitalize mb-0"
                                  style={{
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  {institution.instituteType}
                                </p>

                              </div>

                              <i
                                className="bi bi-building"
                                style={{
                                  color: '#A78BFA',
                                  fontSize: '1.1rem'
                                }}
                              ></i>

                            </div>

                            {/* BATCH SUMMARY */}
                            <div
                              className="d-flex gap-4 mt-4"
                            >

                              <div>

                                <div
                                  className="text-secondary"
                                  style={{
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Total Batches
                                </div>

                                <div
                                  className="fw-semibold mt-1"
                                  style={{
                                    color: '#334155'
                                  }}
                                >
                                  {allBatches.length}
                                </div>

                              </div>

                              <div>

                                <div
                                  className="text-secondary"
                                  style={{
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Joined Batches
                                </div>

                                <div
                                  className="fw-semibold mt-1"
                                  style={{
                                    color: '#15803D'
                                  }}
                                >
                                  {joinedBatchCount}
                                </div>

                              </div>

                            </div>

                            {/* ACTION */}
                            <div className="mt-4">

                              <button
                                className="btn btn-sm rounded-3 w-100"
                                style={{
                                  background:
                                    '#F5F3FF',
                                  color:
                                    '#6D28D9',
                                  border:
                                    '1px solid #DDD6FE'
                                }}
                                onClick={() =>
                                  handleOpenBatchSelection(
                                    institution
                                  )
                                }
                                disabled={
                                  isActionLoading ||
                                  allBatches.length ===
                                  0
                                }
                              >
                                {isActionLoading
                                  ? 'Loading...'
                                  : allBatches.length ===
                                    0
                                    ? 'No Batches Available'
                                    : 'Send Join Request'}
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= BATCH SELECTION MODAL ================= */}
      {selectedInstitution && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              'rgba(15, 23, 42, 0.45)',
            zIndex: 1050,
            padding: '16px'
          }}
        >
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >

            {/* MODAL HEADER */}
            <div className="d-flex justify-content-between align-items-start mb-4">

              <div>

                <h5 className="fw-bold mb-1">
                  Select Batches
                </h5>

                <p
                  className="text-secondary mb-0"
                  style={{
                    fontSize: '0.85rem'
                  }}
                >
                  {selectedInstitution.instituteName}
                </p>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setSelectedInstitution(null)
                  setBatches([])
                  setSelectedBatchIds([])
                  setError('')
                }}
              ></button>

            </div>

            {/* BATCH LOADING */}
            {batchLoading && (
              <div className="text-center py-4">

                <div
                  className="spinner-border"
                  style={{
                    color: '#7C3AED'
                  }}
                  role="status"
                ></div>

                <p className="text-secondary mt-3 mb-0">
                  Loading batches...
                </p>

              </div>
            )}

            {/* NO BATCHES */}
            {!batchLoading &&
              batches.length === 0 && (
                <div className="text-center py-4">

                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: '#F5F3FF',
                      color: '#8B5CF6'
                    }}
                  >
                    <i className="bi bi-collection"></i>
                  </div>

                  <p className="text-secondary mb-0">
                    This institution has no batches
                    available yet.
                  </p>

                </div>
              )}

            {/* BATCH LIST */}
            {!batchLoading &&
              batches.length > 0 && (
                <div className="d-flex flex-column gap-2">

                  {batches.map((batch) => {

                    const membership =
                      getMembershipsForInstitution(
                        selectedInstitution.id
                      ).find(
                        (item) =>
                          item.batchId?.toString() ===
                          batch._id?.toString()
                      )

                    const alreadyJoined =
                      membership?.status ===
                      'approved'

                    const alreadyPending =
                      membership?.status ===
                      'pending'

                    const alreadyExists =
                      !!membership

                    const selected =
                      selectedBatchIds.includes(
                        batch._id
                      )

                    return (
                      <button
                        type="button"
                        key={batch._id}
                        className="text-start rounded-3 p-3"
                        onClick={() => {
                          if (!alreadyExists) {
                            toggleBatch(
                              batch._id
                            )
                          }
                        }}
                        disabled={alreadyExists}
                        style={{
                          border: selected
                            ? '1px solid #A78BFA'
                            : '1px solid #E5E7EB',

                          background:
                            alreadyExists
                              ? '#F8FAFC'
                              : selected
                                ? '#F5F3FF'
                                : '#FFFFFF',

                          color:
                            alreadyExists
                              ? '#94A3B8'
                              : '#334155',

                          cursor:
                            alreadyExists
                              ? 'not-allowed'
                              : 'pointer',

                          transition:
                            'all 0.15s ease'
                        }}
                      >

                        <div className="d-flex align-items-start gap-3">

                          <div
                            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                            style={{
                              width: '22px',
                              height: '22px',
                              border:
                                alreadyExists
                                  ? '1px solid #CBD5E1'
                                  : selected
                                    ? '1px solid #7C3AED'
                                    : '1px solid #CBD5E1',

                              background:
                                alreadyExists
                                  ? '#E2E8F0'
                                  : selected
                                    ? '#7C3AED'
                                    : '#FFFFFF',
                              color: '#FFFFFF',
                              marginTop: '1px'
                            }}
                          >
                            {selected &&
                              !alreadyExists && (
                                <i
                                  className="bi bi-check"
                                  style={{
                                    fontSize:
                                      '0.8rem'
                                  }}
                                ></i>
                              )}
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {batch.name}
                            </div>

                            {alreadyJoined && (
                              <div
                                className="mt-1"
                                style={{
                                  fontSize:
                                    '0.75rem',
                                  color:
                                    '#64748B',
                                  fontWeight: 500
                                }}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Joined
                              </div>
                            )}

                            {alreadyPending && (
                              <div
                                className="mt-1"
                                style={{
                                  fontSize:
                                    '0.75rem',
                                  color:
                                    '#7C3AED',
                                  fontWeight: 500
                                }}
                              >
                                <i className="bi bi-clock me-1"></i>
                                Request Pending
                              </div>
                            )}

                            {batch.department && (
                              <div
                                className="text-secondary"
                                style={{
                                  fontSize:
                                    '0.8rem'
                                }}
                              >
                                {
                                  batch.department
                                }
                              </div>
                            )}

                            {batch.academicYear && (
                              <div
                                className="text-secondary"
                                style={{
                                  fontSize:
                                    '0.8rem'
                                }}
                              >
                                Academic Year:{' '}
                                {
                                  batch.academicYear
                                }
                              </div>
                            )}
                          </div>

                        </div>

                      </button>
                    )
                  })}

                </div>
              )}

            {/* MODAL FOOTER */}
            {!batchLoading &&
              batches.length > 0 && (
                <div className="d-flex justify-content-end gap-2 mt-4">

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-3"
                    onClick={() => {
                      setSelectedInstitution(null)
                      setBatches([])
                      setSelectedBatchIds([])
                      setError('')
                    }}
                    disabled={
                      actionId !== null
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm rounded-3"
                    style={{
                      background:
                        selectedBatchIds.length >
                          0
                          ? '#7C3AED'
                          : '#E5E7EB',
                      color:
                        selectedBatchIds.length >
                          0
                          ? '#FFFFFF'
                          : '#94A3B8',
                      border: 'none'
                    }}
                    onClick={handleJoin}
                    disabled={
                      selectedBatchIds.length ===
                      0 ||
                      actionId !== null
                    }
                  >
                    {actionId !== null
                      ? 'Sending...'
                      : `Send Request${selectedBatchIds.length >
                        0
                        ? ` (${selectedBatchIds.length})`
                        : ''
                      }`}
                  </button>

                </div>
              )}

          </div>
        </div>
      )}
    </div>
  )
}

export default JoinInstitution