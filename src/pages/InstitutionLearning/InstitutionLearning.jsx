import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import SpaceSwitcher from '../../components/SpaceSwitcher/SpaceSwitcher'
import StudyMaterials from '../../components/StudyMaterials/StudyMaterials'
import { useAuth } from '../../context/AuthContext'

function InstitutionLearning() {
  const { instituteId } = useParams()
  const { token } = useAuth()

  const [institution, setInstitution] = useState(null)

  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)

  const [subjects, setSubjects] = useState([])

  const [loading, setLoading] = useState(true)
  const [subjectLoading, setSubjectLoading] = useState(false)

  const [error, setError] = useState('')

  // ================= FETCH INSTITUTION =================

  const fetchInstitution = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/membership/institutions/${instituteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load institution'
        )
      }

      setInstitution(data.institution)
    } catch (error) {
      console.error(
        'Failed to load institution:',
        error
      )

      throw error
    }
  }

  // ================= FETCH APPROVED BATCHES =================

  const fetchBatches = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/membership/my-memberships',
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
        (data.memberships || []).filter(
          (membership) =>
            membership.institutionId === instituteId &&
            membership.status === 'approved' &&
            membership.batchId
        )

      setBatches(approvedBatches)

      if (approvedBatches.length > 0) {
        setSelectedBatch(approvedBatches[0])
      } else {
        setSelectedBatch(null)
      }
    } catch (error) {
      console.error(
        'Failed to load batches:',
        error
      )

      throw error
    }
  }

  // ================= FETCH SUBJECTS =================

  const fetchSubjects = async (batchId) => {
    try {
      setSubjectLoading(true)
      setError('')

      const response = await fetch(
        `http://localhost:5000/api/subjects/batch/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load subjects'
        )
      }

      setSubjects(data.subjects || [])
    } catch (error) {
      console.error(
        'Failed to load subjects:',
        error
      )

      setError(error.message)
      setSubjects([])
    } finally {
      setSubjectLoading(false)
    }
  }

  // ================= INITIAL LOAD =================

  useEffect(() => {
    const loadInstitutionLearning = async () => {
      if (!token || !instituteId) {
        return
      }

      try {
        setLoading(true)
        setError('')

        await fetchInstitution()
        await fetchBatches()
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadInstitutionLearning()
  }, [token, instituteId])

  // ================= BATCH CHANGE =================

  useEffect(() => {
    if (
      selectedBatch &&
      selectedBatch.batchId
    ) {
      fetchSubjects(
        selectedBatch.batchId
      )
    }
  }, [selectedBatch])

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background:
          'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
      }}
    >

      <div className="container py-4 px-3">

        <SpaceSwitcher />

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="py-5 text-center">

            <div
              className="spinner-border"
              style={{
                color: '#7C3AED'
              }}
              role="status"
            ></div>

            <p className="text-secondary mt-3 mb-0">
              Loading institution...
            </p>

          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
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
        )}

        {/* ================= CONTENT ================= */}

        {!loading &&
          !error &&
          institution && (
            <>

              {/* INSTITUTION HEADER */}

              <div className="mb-4">

                <h2
                  className="fw-bold mb-1"
                  style={{
                    letterSpacing: '-0.5px'
                  }}
                >
                  {institution.instituteName}
                </h2>

                <p
                  className="text-secondary text-capitalize mb-0"
                  style={{
                    fontSize: '0.9rem'
                  }}
                >
                  {institution.instituteType}
                </p>

              </div>

              {/* ================= BATCH SWITCHER ================= */}

              {batches.length > 0 && (
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
                    Learning Batch
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

                    {batches.map(
                      (membership) => (
                        <option
                          key={
                            membership.membershipId
                          }
                          value={
                            membership.batchId
                          }
                        >
                          {membership.batchName}
                        </option>
                      )
                    )}

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
              )}

              {/* ================= NO BATCH ================= */}

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
                    You don't have an approved batch
                    in this institution yet.
                  </p>

                </div>
              )}

              {/* ================= SUBJECTS ================= */}

              {batches.length > 0 && (
                <div>

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
                      Subjects available in{' '}
                      <strong>
                        {selectedBatch?.batchName}
                      </strong>
                    </p>

                  </div>

                  {/* SUBJECT LOADING */}

                  {subjectLoading && (
                    <div className="py-5 text-center">

                      <div
                        className="spinner-border"
                        style={{
                          color: '#7C3AED'
                        }}
                        role="status"
                      ></div>

                      <p className="text-secondary mt-3 mb-0">
                        Loading subjects...
                      </p>

                    </div>
                  )}

                  {/* NO SUBJECTS */}

                  {!subjectLoading &&
                    subjects.length === 0 && (
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
                          <i className="bi bi-book"></i>
                        </div>

                        <h6 className="fw-semibold mb-1">
                          No subjects yet
                        </h6>

                        <p className="text-secondary mb-0">
                          Your teachers haven't added
                          any subjects to this batch yet.
                        </p>

                      </div>
                    )}

                  {/* SUBJECT LIST */}

                  {!subjectLoading &&
                    subjects.length > 0 && (
                      <div className="row g-3">

                        {subjects.map(
                          (subject) => (
                            <div
                              className="col-md-6 col-lg-4"
                              key={subject._id}
                            >

                              <div
                                className="bg-white border rounded-4 p-4 h-100"
                                style={{
                                  borderColor:
                                    '#E9D5FF',
                                  boxShadow:
                                    '0 4px 15px rgba(15, 23, 42, 0.03)',
                                  cursor:
                                    'pointer',
                                  transition:
                                    'all 0.2s ease'
                                }}
                                onMouseEnter={(
                                  e
                                ) => {
                                  e.currentTarget.style.transform =
                                    'translateY(-3px)'

                                  e.currentTarget.style.borderColor =
                                    '#C4B5FD'
                                }}
                                onMouseLeave={(
                                  e
                                ) => {
                                  e.currentTarget.style.transform =
                                    'translateY(0)'

                                  e.currentTarget.style.borderColor =
                                    '#E9D5FF'
                                }}
                              >

                                <div className="d-flex justify-content-between align-items-start">

                                  <div>

                                    <h6 className="fw-semibold mb-1">
                                      {
                                        subject.name
                                      }
                                    </h6>

                                    {subject.code && (
                                      <div
                                        className="text-secondary"
                                        style={{
                                          fontSize:
                                            '0.78rem'
                                        }}
                                      >
                                        {
                                          subject.code
                                        }
                                      </div>
                                    )}

                                  </div>

                                  <i
                                    className="bi bi-book"
                                    style={{
                                      color:
                                        '#A78BFA'
                                    }}
                                  ></i>

                                </div>

                                {subject.description && (
                                  <p
                                    className="text-secondary mt-3 mb-0"
                                    style={{
                                      fontSize:
                                        '0.8rem'
                                    }}
                                  >
                                    {
                                      subject.description
                                    }
                                  </p>
                                )}

                                <StudyMaterials
                                  subjectId={subject._id}
                                  batchId={selectedBatch?.batchId}
                                  isTeacher={false}
                                />

                              </div>

                            </div>
                          )
                        )}

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

export default InstitutionLearning