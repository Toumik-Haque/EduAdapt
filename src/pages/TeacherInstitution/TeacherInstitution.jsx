import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SpaceSwitcher from '../../components/SpaceSwitcher/SpaceSwitcher'

function TeacherInstitution() {
  const { instituteId } = useParams()
  const { token } = useAuth()

  const [institution, setInstitution] = useState(null)
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)

  const [activeSection, setActiveSection] = useState('subjects')

  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showSubjectForm, setShowSubjectForm] = useState(false)

  const [subjectName, setSubjectName] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [subjectDescription, setSubjectDescription] = useState('')

  const [creatingSubject, setCreatingSubject] = useState(false)
  const [createSubjectError, setCreateSubjectError] = useState('')
  const [createSubjectSuccess, setCreateSubjectSuccess] = useState('')

  const [learnerRequests, setLearnerRequests] = useState([])
  const [learnersLoading, setLearnersLoading] = useState(false)
  const [learnersError, setLearnersError] = useState('')

  const [learnerActionId, setLearnerActionId] = useState(null)
  const [learnerActionError, setLearnerActionError] = useState('')
  const [learnerActionSuccess, setLearnerActionSuccess] = useState('')

  const [approvedLearners, setApprovedLearners] = useState([])
  const [approvedLearnersLoading, setApprovedLearnersLoading] = useState(false)
  const [approvedLearnersError, setApprovedLearnersError] = useState('')

  /*
    ============================
    FETCH LEARNER REQUESTS
    ============================
  */

  const fetchLearnerRequests = async () => {
    try {
      setLearnersLoading(true)
      setLearnersError('')

      const response = await fetch(
        `${API_BASE_URL}/api/membership/teacher/learner-requests`,
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
          'Failed to load learner requests'
        )
      }

      setLearnerRequests(data.requests || [])
    } catch (error) {
      console.error(
        'Failed to load learner requests:',
        error
      )

      setLearnersError(error.message)
      setLearnerRequests([])
    } finally {
      setLearnersLoading(false)
    }
  }

  /*
    ============================
    APPROVE / REJECT LEARNER
    ============================
  */

  const handleLearnerAction = async (
    membershipId,
    action
  ) => {
    try {
      setLearnerActionId(membershipId)
      setLearnerActionError('')
      setLearnerActionSuccess('')

      const endpoint =
        action === 'approve'
          ? `${API_BASE_URL}/api/membership/teacher/learner-approve`
          : `${API_BASE_URL}/api/membership/teacher/learner-reject`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          membershipId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          `Failed to ${action} learner`
        )
      }

      setLearnerActionSuccess(
        data.message ||
        `Learner ${action}d successfully`
      )

      await fetchLearnerRequests()
      await fetchApprovedLearners()
    } catch (error) {
      console.error(
        `Learner ${action} error:`,
        error
      )

      setLearnerActionError(error.message)
    } finally {
      setLearnerActionId(null)
    }
  }

  /*
    ============================
    FETCH APPROVED LEARNERS
    ============================
  */

  const fetchApprovedLearners = async () => {
    if (!selectedBatch?.batchId) {
      setApprovedLearners([])
      return
    }

    try {
      setApprovedLearnersLoading(true)
      setApprovedLearnersError('')

      const response = await fetch(
        `${API_BASE_URL}/api/membership/teacher/learners?batchId=${selectedBatch.batchId}`,
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
          'Failed to load approved learners'
        )
      }

      setApprovedLearners(data.learners || [])
    } catch (error) {
      console.error(
        'Failed to load approved learners:',
        error
      )

      setApprovedLearnersError(error.message)
      setApprovedLearners([])
    } finally {
      setApprovedLearnersLoading(false)
    }
  }

  /*
    ============================
    FETCH SUBJECTS
    ============================
  */

  const fetchSubjects = async (batchId) => {
    if (!batchId) {
      setSubjects([])
      return
    }

    try {
      setSubjectsLoading(true)
      setSubjectsError('')

      const response = await fetch(
        `${API_BASE_URL}/api/subjects/batch/${batchId}`,
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
          'Failed to load subjects'
        )
      }

      setSubjects(data.subjects || [])
    } catch (error) {
      console.error(
        'Failed to load subjects:',
        error
      )

      setSubjectsError(error.message)
      setSubjects([])
    } finally {
      setSubjectsLoading(false)
    }
  }

  /*
    ============================
    CREATE SUBJECT
    ============================
  */

  const handleCreateSubject = async (e) => {
    e.preventDefault()

    if (!selectedBatch?.batchId) {
      return
    }

    if (!subjectName.trim()) {
      setCreateSubjectError(
        'Subject name is required'
      )
      return
    }

    try {
      setCreatingSubject(true)
      setCreateSubjectError('')
      setCreateSubjectSuccess('')

      const response = await fetch(
        `${API_BASE_URL}/api/subjects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            batchId: selectedBatch.batchId,
            name: subjectName.trim(),
            code: subjectCode.trim(),
            description: subjectDescription.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to create subject'
        )
      }

      setSubjectName('')
      setSubjectCode('')
      setSubjectDescription('')

      setCreateSubjectSuccess(
        'Subject created successfully'
      )

      setShowSubjectForm(false)

      await fetchSubjects(
        selectedBatch.batchId
      )
    } catch (error) {
      console.error(
        'Create subject error:',
        error
      )

      setCreateSubjectError(error.message)
    } finally {
      setCreatingSubject(false)
    }
  }

  /*
    ============================
    FETCH TEACHER BATCHES
    ============================
  */

  useEffect(() => {
    const fetchBatches = async () => {
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
            data.message ||
            'Failed to load teaching batches'
          )
        }

        const approvedBatches =
          (data.batches || []).filter(
            (batch) =>
              batch.status === 'approved' &&
              batch.institutionId === instituteId
          )

        setBatches(approvedBatches)

        if (approvedBatches.length > 0) {
          setSelectedBatch(approvedBatches[0])

          setInstitution({
            instituteName:
              approvedBatches[0].instituteName || '',
            instituteType:
              approvedBatches[0].instituteType || ''
          })
        }
      } catch (error) {
        console.error(
          'Failed to load teacher institution:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token && instituteId) {
      fetchBatches()
    }
  }, [token, instituteId])

  /*
    ============================
    LOAD DATA WHEN BATCH CHANGES
    ============================
  */

  useEffect(() => {
    if (
      token &&
      selectedBatch?.batchId
    ) {
      fetchSubjects(
        selectedBatch.batchId
      )

      fetchLearnerRequests()
      fetchApprovedLearners()
    }
  }, [token, selectedBatch])

  /*
    ============================
    LOADING
    ============================
  */

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 70px)',
          background:
            'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
        }}
      >
        <div className="container py-5 text-center">
          <div
            className="spinner-border"
            style={{
              color: '#7C3AED'
            }}
            role="status"
          ></div>

          <p className="text-secondary mt-3 mb-0">
            Loading teaching workspace...
          </p>
        </div>
      </div>
    )
  }

  /*
    ============================
    ERROR
    ============================
  */

  if (error) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 70px)',
          background:
            'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
        }}
      >
        <div className="container py-4 px-3">
          <div
            className="rounded-4 px-4 py-3"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C'
            }}
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background:
          'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
      }}
    >
      <div className="container py-4 px-3">

        <div className='d-flex justify-content-between'>

          {/* ================= HEADER ================= */}

          <div className="col-lg-8 mb-4">

            <h2
              className="fw-bold mb-2"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-1px'
              }}
            >
              {institution?.instituteName ||
                'Institution Teaching'}
            </h2>

            {institution?.instituteType && (
              <p
                className="text-secondary text-capitalize mb-0"
                style={{
                  fontSize: '1rem'
                }}
              >
                {institution.instituteType}
              </p>
            )}

          </div>

          {/* ================= LEARNING SPACE ================= */}

          <SpaceSwitcher />

        </div>

        {/* ================= NO BATCHES ================= */}

        {batches.length === 0 && (
          <div
            className="bg-white border rounded-4 p-4"
            style={{
              borderColor: '#E9D5FF',
              boxShadow:
                '0 4px 15px rgba(15, 23, 42, 0.03)'
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
              You don't have any approved teaching
              batches in this institution.
            </p>
          </div>
        )}

        {/* ================= BATCH WORKSPACE ================= */}

        {batches.length > 0 && (
          <>

            {/* ================= BATCH SELECTOR ================= */}

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
                  const batch =
                    batches.find(
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
                  {selectedBatch.department}

                  {selectedBatch.department &&
                    selectedBatch.academicYear &&
                    ' • '}

                  {selectedBatch.academicYear}
                </div>
              )}
            </div>

            {/* ================= SECTION TABS ================= */}

            <div
              className="d-flex align-items-center border-bottom mb-4"
              style={{
                borderColor: '#E9D5FF'
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveSection('subjects')
                }
                className="btn btn-sm rounded-0 border-0 px-3 py-2"
                style={{
                  color:
                    activeSection === 'subjects'
                      ? '#6D28D9'
                      : '#64748B',
                  fontWeight:
                    activeSection === 'subjects'
                      ? 600
                      : 500,
                  borderBottom:
                    activeSection === 'subjects'
                      ? '2px solid #7C3AED'
                      : '2px solid transparent'
                }}
              >
                Subjects
                <span
                  className="ms-2"
                  style={{
                    fontSize: '0.75rem',
                    color: '#94A3B8'
                  }}
                >
                  {subjects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveSection('requests')
                }
                className="btn btn-sm rounded-0 border-0 px-3 py-2"
                style={{
                  color:
                    activeSection === 'requests'
                      ? '#6D28D9'
                      : '#64748B',
                  fontWeight:
                    activeSection === 'requests'
                      ? 600
                      : 500,
                  borderBottom:
                    activeSection === 'requests'
                      ? '2px solid #7C3AED'
                      : '2px solid transparent'
                }}
              >
                Learner Requests
                <span
                  className="ms-2"
                  style={{
                    fontSize: '0.75rem',
                    color: '#94A3B8'
                  }}
                >
                  {
                    learnerRequests.filter(
                      (request) =>
                        request.batchId ===
                        selectedBatch?.batchId
                    ).length
                  }
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveSection('learners')
                }
                className="btn btn-sm rounded-0 border-0 px-3 py-2"
                style={{
                  color:
                    activeSection === 'learners'
                      ? '#6D28D9'
                      : '#64748B',
                  fontWeight:
                    activeSection === 'learners'
                      ? 600
                      : 500,
                  borderBottom:
                    activeSection === 'learners'
                      ? '2px solid #7C3AED'
                      : '2px solid transparent'
                }}
              >
                Approved Learners
                <span
                  className="ms-2"
                  style={{
                    fontSize: '0.75rem',
                    color: '#94A3B8'
                  }}
                >
                  {approvedLearners.length}
                </span>
              </button>
            </div>

            {/* ================================================== */}
            {/* ================= SUBJECTS ======================= */}
            {/* ================================================== */}

            {activeSection === 'subjects' && (
              <div>

                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">

                  <div>
                    <h5 className="fw-semibold mb-1">
                      Subjects
                    </h5>

                    <p
                      className="text-secondary mb-0"
                      style={{
                        fontSize: '0.8rem'
                      }}
                    >
                      Subjects for the selected batch
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm rounded-3 flex-shrink-0"
                    onClick={() => {
                      setShowSubjectForm(
                        !showSubjectForm
                      )
                      setCreateSubjectError('')
                      setCreateSubjectSuccess('')
                    }}
                    style={{
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Create Subject
                  </button>

                </div>

                {/* CREATE SUBJECT FORM */}

                {showSubjectForm && (
                  <div
                    className="bg-white border rounded-4 p-4 mb-4"
                    style={{
                      borderColor: '#E9D5FF',
                      boxShadow:
                        '0 4px 15px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <h6 className="fw-semibold mb-1">
                      Create Subject
                    </h6>

                    <p
                      className="text-secondary mb-3"
                      style={{
                        fontSize: '0.8rem'
                      }}
                    >
                      Create a subject for{' '}
                      <strong>
                        {selectedBatch?.batchName}
                      </strong>
                    </p>

                    {createSubjectError && (
                      <div
                        className="rounded-3 px-3 py-2 mb-3"
                        style={{
                          background: '#FEF2F2',
                          color: '#B91C1C',
                          fontSize: '0.85rem'
                        }}
                      >
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {createSubjectError}
                      </div>
                    )}

                    <form
                      onSubmit={handleCreateSubject}
                    >
                      <div className="row g-3">

                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Subject Name
                          </label>

                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="e.g. Data Structures"
                            value={subjectName}
                            onChange={(e) =>
                              setSubjectName(
                                e.target.value
                              )
                            }
                            required
                            style={{
                              borderColor: '#DDD6FE'
                            }}
                          />
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Subject Code
                            <span
                              className="text-secondary ms-1"
                              style={{
                                fontWeight: 400
                              }}
                            >
                              (optional)
                            </span>
                          </label>

                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="e.g. CS301"
                            value={subjectCode}
                            onChange={(e) =>
                              setSubjectCode(
                                e.target.value
                              )
                            }
                            style={{
                              borderColor: '#DDD6FE'
                            }}
                          />
                        </div>

                        <div className="col-12">
                          <label
                            className="form-label"
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Description
                            <span
                              className="text-secondary ms-1"
                              style={{
                                fontWeight: 400
                              }}
                            >
                              (optional)
                            </span>
                          </label>

                          <textarea
                            className="form-control rounded-3"
                            rows="3"
                            placeholder="Brief description of this subject"
                            value={subjectDescription}
                            onChange={(e) =>
                              setSubjectDescription(
                                e.target.value
                              )
                            }
                            style={{
                              borderColor: '#DDD6FE',
                              resize: 'vertical'
                            }}
                          ></textarea>
                        </div>

                      </div>

                      <div className="d-flex gap-2 mt-3">

                        <button
                          type="submit"
                          className="btn rounded-3"
                          disabled={
                            creatingSubject
                          }
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none'
                          }}
                        >
                          {creatingSubject ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg me-1"></i>
                              Create Subject
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-light rounded-3"
                          disabled={
                            creatingSubject
                          }
                          onClick={() => {
                            setShowSubjectForm(false)
                            setCreateSubjectError('')
                          }}
                        >
                          Cancel
                        </button>

                      </div>
                    </form>
                  </div>
                )}

                {createSubjectSuccess && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{
                      background: '#F0FDF4',
                      color: '#166534',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {createSubjectSuccess}
                  </div>
                )}

                {subjectsLoading && (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm"
                      style={{
                        color: '#7C3AED'
                      }}
                      role="status"
                    ></div>

                    <span
                      className="text-secondary ms-2"
                      style={{
                        fontSize: '0.85rem'
                      }}
                    >
                      Loading subjects...
                    </span>
                  </div>
                )}

                {!subjectsLoading &&
                  subjectsError && (
                    <div
                      className="rounded-3 px-3 py-2"
                      style={{
                        background: '#FEF2F2',
                        color: '#B91C1C',
                        fontSize: '0.85rem'
                      }}
                    >
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {subjectsError}
                    </div>
                  )}

                {!subjectsLoading &&
                  !subjectsError &&
                  subjects.length === 0 && (
                    <div
                      className="bg-white border rounded-4 p-4"
                      style={{
                        borderColor: '#E9D5FF'
                      }}
                    >
                      <h6 className="fw-semibold mb-1">
                        No subjects yet
                      </h6>

                      <p className="text-secondary mb-0">
                        No subjects have been created
                        for this batch yet.
                      </p>
                    </div>
                  )}

                {!subjectsLoading &&
                  !subjectsError &&
                  subjects.length > 0 && (
                    <div className="row g-3">

                      {subjects.map((subject) => (
                        <div
                          className="col-md-6 col-xl-4"
                          key={subject._id}
                        >
                          <div
                            className="bg-white rounded-4 border p-4 h-100"
                            style={{
                              borderColor: '#E9D5FF',
                              boxShadow:
                                '0 4px 15px rgba(15, 23, 42, 0.03)'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start">

                              <div>
                                <h6 className="fw-semibold mb-1">
                                  {subject.name}
                                </h6>

                                {subject.code && (
                                  <div
                                    className="text-secondary mb-2"
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    {subject.code}
                                  </div>
                                )}
                              </div>

                              <i
                                className="bi bi-book"
                                style={{
                                  color: '#8B5CF6'
                                }}
                              ></i>

                            </div>

                            {subject.description && (
                              <p
                                className="text-secondary mb-0"
                                style={{
                                  fontSize: '0.8rem'
                                }}
                              >
                                {subject.description}
                              </p>
                            )}

                          </div>
                        </div>
                      ))}

                    </div>
                  )}

              </div>
            )}

            {/* ================================================== */}
            {/* ================= LEARNER REQUESTS =============== */}
            {/* ================================================== */}

            {activeSection === 'requests' && (
              <div>

                <div className="mb-3">
                  <h5 className="fw-semibold mb-1">
                    Learner Requests
                  </h5>

                  <p
                    className="text-secondary mb-0"
                    style={{
                      fontSize: '0.8rem'
                    }}
                  >
                    Manage learner requests for this batch.
                  </p>
                </div>

                {learnersError && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {learnersError}
                  </div>
                )}

                {learnerActionError && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {learnerActionError}
                  </div>
                )}

                {learnerActionSuccess && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{
                      background: '#F0FDF4',
                      color: '#166534',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {learnerActionSuccess}
                  </div>
                )}

                {learnersLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm"
                      style={{
                        color: '#7C3AED'
                      }}
                      role="status"
                    ></div>

                    <span
                      className="text-secondary ms-2"
                      style={{
                        fontSize: '0.85rem'
                      }}
                    >
                      Loading learner requests...
                    </span>
                  </div>
                ) : learnerRequests.filter(
                  (request) =>
                    request.batchId ===
                    selectedBatch?.batchId
                ).length === 0 ? (
                  <div
                    className="bg-white border rounded-4 p-4"
                    style={{
                      borderColor: '#E9D5FF'
                    }}
                  >
                    <h6 className="fw-semibold mb-1">
                      No pending learner requests
                    </h6>

                    <p className="text-secondary mb-0">
                      New learner requests for this batch
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="row g-3">

                    {learnerRequests
                      .filter(
                        (request) =>
                          request.batchId ===
                          selectedBatch?.batchId
                      )
                      .map((request) => (
                        <div
                          key={request.membershipId}
                          className="col-12 col-md-6"
                        >
                          <div
                            className="bg-white border rounded-4 p-4 h-100"
                            style={{
                              borderColor: '#E9D5FF',
                              boxShadow:
                                '0 4px 15px rgba(15, 23, 42, 0.03)'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3">

                              <div>
                                <h6 className="fw-semibold mb-1">
                                  {request.learnerName}
                                </h6>

                                <p
                                  className="text-secondary mb-1"
                                  style={{
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {request.learnerEmail}
                                </p>

                                <span
                                  className="d-inline-flex align-items-center gap-2 rounded-pill px-2 py-1"
                                  style={{
                                    background: '#F5F3FF',
                                    color: '#7C3AED',
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: '#8B5CF6'
                                    }}
                                  ></span>
                                  Pending
                                </span>
                              </div>

                            </div>

                            <div className="d-flex gap-2 mt-3">

                              <button
                                type="button"
                                className="btn btn-sm rounded-3"
                                disabled={
                                  learnerActionId ===
                                  request.membershipId
                                }
                                onClick={() =>
                                  handleLearnerAction(
                                    request.membershipId,
                                    'approve'
                                  )
                                }
                                style={{
                                  background: '#F5F3FF',
                                  color: '#6D28D9',
                                  border:
                                    '1px solid #DDD6FE'
                                }}
                              >
                                {learnerActionId ===
                                  request.membershipId
                                  ? 'Processing...'
                                  : 'Approve'}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-3"
                                disabled={
                                  learnerActionId ===
                                  request.membershipId
                                }
                                onClick={() =>
                                  handleLearnerAction(
                                    request.membershipId,
                                    'reject'
                                  )
                                }
                              >
                                Reject
                              </button>

                            </div>

                          </div>
                        </div>
                      ))}

                  </div>
                )}

              </div>
            )}

            {/* ================================================== */}
            {/* ================= APPROVED LEARNERS ============== */}
            {/* ================================================== */}

            {activeSection === 'learners' && (
              <div>

                <div className="mb-3">
                  <h5 className="fw-semibold mb-1">
                    Approved Learners
                  </h5>

                  <p
                    className="text-secondary mb-0"
                    style={{
                      fontSize: '0.8rem'
                    }}
                  >
                    Learners who are approved for this batch.
                  </p>
                </div>

                {approvedLearnersError && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {approvedLearnersError}
                  </div>
                )}

                {approvedLearnersLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm"
                      style={{
                        color: '#7C3AED'
                      }}
                      role="status"
                    ></div>

                    <span
                      className="text-secondary ms-2"
                      style={{
                        fontSize: '0.85rem'
                      }}
                    >
                      Loading learners...
                    </span>
                  </div>
                ) : approvedLearners.length === 0 ? (
                  <div
                    className="bg-white border rounded-4 p-4"
                    style={{
                      borderColor: '#E9D5FF'
                    }}
                  >
                    <h6 className="fw-semibold mb-1">
                      No approved learners
                    </h6>

                    <p className="text-secondary mb-0">
                      No learners have been approved for
                      this batch yet.
                    </p>
                  </div>
                ) : (
                  <div className="row g-3">

                    {approvedLearners.map((learner) => (
                      <div
                        key={learner.membershipId}
                        className="col-12 col-md-6"
                      >
                        <div
                          className="bg-white border rounded-4 p-4 h-100"
                          style={{
                            borderColor: '#E9D5FF',
                            boxShadow:
                              '0 4px 15px rgba(15, 23, 42, 0.03)'
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">

                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: '40px',
                                height: '40px',
                                background: '#F5F3FF',
                                color: '#7C3AED',
                                flexShrink: 0
                              }}
                            >
                              <i className="bi bi-person"></i>
                            </div>

                            <div
                              className="min-width-0"
                              style={{
                                minWidth: 0
                              }}
                            >
                              <div className="fw-semibold">
                                {learner.learnerName}
                              </div>

                              <div
                                className="text-secondary"
                                style={{
                                  fontSize: '0.8rem',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {learner.learnerEmail}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                )}

              </div>
            )}

          </>
        )}

      </div>
    </div>
  )
}

export default TeacherInstitution
