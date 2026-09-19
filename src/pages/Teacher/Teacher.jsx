import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Teacher() {
  const { token, user } = useAuth()

  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeacherBatches = async () => {
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
            data.message ||
            'Failed to load teaching spaces'
          )
        }

        const approvedBatches =
          (data.batches || []).filter(
            (batch) =>
              batch.status === 'approved'
          )

        /*
          Group approved batches by institution.
          Each institution will appear only once.
        */
        const institutionMap = {}

        approvedBatches.forEach((batch) => {
          const institutionId =
            batch.institutionId

          if (!institutionId) {
            return
          }

          if (!institutionMap[institutionId]) {
            institutionMap[institutionId] = {
              id: institutionId,
              instituteName:
                batch.instituteName || '',
              instituteType:
                batch.instituteType || '',
              batchCount: 0
            }
          }

          institutionMap[institutionId].batchCount += 1
        })

        setInstitutions(
          Object.values(institutionMap)
        )
      } catch (error) {
        console.error(
          'Failed to load teaching spaces:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTeacherBatches()
    }
  }, [token])

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background:
          'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
      }}
    >

      <div className="container py-4 px-3">

        <div className='d-flex justify-content-between mb-3'>

          <div
            className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2"
            style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              border: '1px solid #E9D5FF',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <i className="bi bi-stars"></i>
            TEACHING ECOSYSTEM
          </div>

          <Link
            to="/teacher/profile"
            className="btn text-decoration-none"
            style={{
              background: '#7C3AED',
              color: '#F5F3FF',
              border: '1px solid #E9D5FF',
              borderRadius: '10px',
              padding: '6px 14px',
              fontWeight: '500'
            }}
          >
            Edit Profile
          </Link>

        </div>

        {/* ================= HEADER ================= */}
        <div className="col-lg-8 mb-4">

          <h2
            className="fw-bold mb-2"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              letterSpacing: '-1px'
            }}
          >
            Hi, {user?.profile?.fullName}
          </h2>

          <p
            className="text-secondary mb-0"
            style={{
              fontSize: '1.05rem',
              maxWidth: '650px'
            }}
          >
            Choose a teaching space and continue your
            journey with EduAdapt.
          </p>

        </div>


        {/* ================= LOADING ================= */}
        {loading && (
          <div className="text-center py-5">

            <div
              className="spinner-border"
              style={{ color: '#7C3AED' }}
              role="status"
            ></div>

            <p className="text-secondary mt-3 mb-0">
              Loading your teaching spaces...
            </p>

          </div>
        )}


        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div
            className="alert border-0 rounded-4"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C'
            }}
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}


        {/* ================= TEACHING SPACES ================= */}
        {!loading && !error && (
          <>

            <div className="row g-3">

              {/* ================= INDIVIDUAL ================= */}
              <div className="col-md-6 col-xl-4">

                <Link
                  to="/teacher/individual"
                  className="text-decoration-none text-dark"
                >

                  <div
                    className="bg-white rounded-4 border p-4"
                    style={{
                      transition: 'all 0.2s ease',
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

                    <div className="d-flex justify-content-between align-items-start">

                      <div>

                        <h5 className="fw-semibold mb-2">
                          Individual Teaching
                        </h5>

                        <p
                          className="text-secondary mb-0"
                          style={{
                            fontSize: '0.9rem'
                          }}
                        >
                          Teach independently
                        </p>

                      </div>

                      <i
                        className="bi bi-arrow-up-right"
                        style={{
                          color: '#8B5CF6',
                          fontSize: '1.1rem'
                        }}
                      ></i>

                    </div>

                  </div>

                </Link>

              </div>


              {/* ================= INSTITUTIONS ================= */}
              {institutions.map((institution) => (

                <div
                  className="col-md-6 col-xl-4"
                  key={institution.id}
                >

                  <Link
                    to={`/teacher/institute/${institution.id}`}
                    className="text-decoration-none text-dark"
                  >

                    <div
                      className="bg-white rounded-4 border p-4"
                      style={{
                        transition: 'all 0.2s ease',
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

                      <div className="d-flex justify-content-between align-items-start">

                        <div>

                          <h5 className="fw-semibold mb-2">
                            {institution.instituteName ||
                              'Institution'}
                          </h5>

                          <p
                            className="text-secondary text-capitalize mb-1"
                            style={{
                              fontSize: '0.9rem'
                            }}
                          >
                            {institution.instituteType}
                          </p>

                        </div>

                        <i
                          className="bi bi-arrow-up-right"
                          style={{
                            color: '#8B5CF6',
                            fontSize: '1.1rem'
                          }}
                        ></i>

                      </div>

                    </div>

                  </Link>

                </div>

              ))}


              {/* ================= JOIN INSTITUTION ================= */}
              <div className="col-md-6 col-xl-4">

                <Link
                  to="/teacher/join-institute"
                  className="text-decoration-none text-dark"
                >

                  <div
                    className="rounded-4 border p-4"
                    style={{
                      background: '#FAF8FF',
                      borderColor: '#E9D5FF',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-3px)'
                      e.currentTarget.style.borderColor =
                        '#8B5CF6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0)'
                      e.currentTarget.style.borderColor =
                        '#E9D5FF'
                    }}
                  >

                    <div className="d-flex justify-content-between align-items-start">

                      <div>

                        <h5
                          className="fw-semibold mb-2"
                          style={{
                            color: '#6D28D9'
                          }}
                        >
                          + Join Institution
                        </h5>

                        <p
                          className="text-secondary mb-0"
                          style={{
                            fontSize: '0.9rem'
                          }}
                        >
                          Find an institution
                        </p>

                      </div>

                      <i
                        className="bi bi-arrow-up-right"
                        style={{
                          color: '#8B5CF6',
                          fontSize: '1.1rem'
                        }}
                      ></i>

                    </div>

                  </div>

                </Link>

              </div>

            </div>


            {/* ================= BOTTOM MESSAGE ================= */}
            <div className="text-center mt-4">

              <span
                className="text-secondary"
                style={{
                  fontSize: '0.8rem'
                }}
              >
                Your teaching journey can grow with
                every learner you guide.
              </span>

            </div>

          </>
        )}

      </div>
    </div>
  )
}

export default Teacher
