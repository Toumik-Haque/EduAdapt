import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Learner() {
  const { token, user } = useAuth()

  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/membership/my-institutions',
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

        setInstitutions(data.institutions)
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

    if (token) {
      fetchInstitutions()
    }
  }, [token])

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: '#F8F7FC'
      }}
    >
      <div className="container py-4 py-md-5 px-3">

        {/* ================= HEADER ================= */}
        <div className="mb-4">

          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">

            {/* Section label */}
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{
                background: '#F5F3FF',
                color: '#6D28D9',
                border: '1px solid #E9D5FF',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.6px'
              }}
            >
              <i className="bi bi-stars"></i>
              LEARNING ECOSYSTEM
            </div>

            {/* Profile */}
            <Link
              to="/learner/profile"
              className="d-inline-flex align-items-center gap-2 text-decoration-none"
              style={{
                background: '#FFFFFF',
                color: '#5B21B6',
                border: '1px solid #E9E5F0',
                borderRadius: '10px',
                padding: '7px 13px',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C4B5FD'
                e.currentTarget.style.background = '#FAF8FF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E9E5F0'
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              <i className="bi bi-person-circle"></i>
              Edit Profile
            </Link>

          </div>

          <div style={{ maxWidth: '700px' }}>

            <h1
              className="fw-bold mb-2"
              style={{
                color: '#18181B',
                fontSize: 'clamp(1.8rem, 3vw, 2.45rem)',
                letterSpacing: '-1px',
                lineHeight: 1.15
              }}
            >
              Hi, {user?.profile?.fullName}
            </h1>

            <p
              className="mb-0"
              style={{
                color: '#71717A',
                fontSize: '0.94rem',
                lineHeight: 1.6
              }}
            >
              Choose a learning space and continue your journey
              with EduAdapt.
            </p>

          </div>

        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div
            className="bg-white rounded-4 border text-center py-5"
            style={{
              borderColor: '#EAE5F4',
              boxShadow: '0 5px 20px rgba(39, 20, 70, 0.03)'
            }}
          >
            <div
              className="spinner-border spinner-border-sm"
              style={{ color: '#7C3AED' }}
              role="status"
            ></div>

            <p
              className="mt-3 mb-0"
              style={{
                color: '#71717A',
                fontSize: '0.85rem'
              }}
            >
              Loading your learning spaces...
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div
            className="d-flex align-items-start gap-2 p-3 rounded-3"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontSize: '0.85rem'
            }}
          >
            <i className="bi bi-exclamation-circle mt-1"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ================= LEARNING SPACES ================= */}
        {!loading && !error && (
          <>

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>
                <h5
                  className="fw-semibold mb-1"
                  style={{
                    color: '#18181B',
                    fontSize: '1rem'
                  }}
                >
                  Your Learning Spaces
                </h5>

                <p
                  className="mb-0"
                  style={{
                    color: '#8A8494',
                    fontSize: '0.78rem'
                  }}
                >
                  Select where you want to learn today.
                </p>
              </div>

              <span
                className="d-none d-sm-inline-flex align-items-center px-2 py-1 rounded-pill"
                style={{
                  background: '#F4F4F5',
                  color: '#71717A',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                {institutions.length + 1} spaces
              </span>

            </div>

            <div className="row g-3">

              {/* ================= INDIVIDUAL ================= */}
              <div className="col-md-6 col-xl-4">

                <Link
                  to="/learner/individual"
                  className="text-decoration-none"
                >

                  <div
                    className="h-100 bg-white rounded-4 border p-4"
                    style={{
                      borderColor: '#E9E5F0',
                      boxShadow:
                        '0 5px 18px rgba(39, 20, 70, 0.035)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-3px)'
                      e.currentTarget.style.borderColor =
                        '#C4B5FD'
                      e.currentTarget.style.boxShadow =
                        '0 10px 25px rgba(109, 40, 217, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0)'
                      e.currentTarget.style.borderColor =
                        '#E9E5F0'
                      e.currentTarget.style.boxShadow =
                        '0 5px 18px rgba(39, 20, 70, 0.035)'
                    }}
                  >

                    <div className="d-flex justify-content-between align-items-start">

                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: '#F5F3FF',
                          color: '#6D28D9',
                          marginBottom: '18px'
                        }}
                      >
                        <i className="bi bi-person-workspace fs-5"></i>
                      </div>

                      <i
                        className="bi bi-arrow-up-right"
                        style={{
                          color: '#A78BFA',
                          fontSize: '1rem'
                        }}
                      ></i>

                    </div>

                    <h5
                      className="fw-semibold mb-1"
                      style={{
                        color: '#18181B',
                        fontSize: '0.98rem'
                      }}
                    >
                      Individual Learning
                    </h5>

                    <p
                      className="mb-3"
                      style={{
                        color: '#71717A',
                        fontSize: '0.82rem',
                        lineHeight: 1.5
                      }}
                    >
                      Learn independently at your own pace.
                    </p>

                    <span
                      className="d-inline-flex align-items-center gap-1"
                      style={{
                        color: '#6D28D9',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                    >
                      Open learning space
                      <i className="bi bi-arrow-right"></i>
                    </span>

                  </div>

                </Link>

              </div>

              {/* ================= INSTITUTIONS ================= */}
              {institutions.map((institution) => {

                const institutionId =
                  institution.id || institution._id

                return (
                  <div
                    className="col-md-6 col-xl-4"
                    key={institutionId}
                  >

                    <Link
                      to={`/learner/institute/${institutionId}`}
                      className="text-decoration-none"
                    >

                      <div
                        className="h-100 bg-white rounded-4 border p-4"
                        style={{
                          borderColor: '#E9E5F0',
                          boxShadow:
                            '0 5px 18px rgba(39, 20, 70, 0.035)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            'translateY(-3px)'
                          e.currentTarget.style.borderColor =
                            '#C4B5FD'
                          e.currentTarget.style.boxShadow =
                            '0 10px 25px rgba(109, 40, 217, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform =
                            'translateY(0)'
                          e.currentTarget.style.borderColor =
                            '#E9E5F0'
                          e.currentTarget.style.boxShadow =
                            '0 5px 18px rgba(39, 20, 70, 0.035)'
                        }}
                      >

                        <div className="d-flex justify-content-between align-items-start">

                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: '#F5F3FF',
                              color: '#6D28D9',
                              marginBottom: '18px'
                            }}
                          >
                            <i className="bi bi-building fs-5"></i>
                          </div>

                          <i
                            className="bi bi-arrow-up-right"
                            style={{
                              color: '#A78BFA',
                              fontSize: '1rem'
                            }}
                          ></i>

                        </div>

                        <h5
                          className="fw-semibold mb-1 text-truncate"
                          title={institution.instituteName}
                          style={{
                            color: '#18181B',
                            fontSize: '0.98rem'
                          }}
                        >
                          {institution.instituteName}
                        </h5>

                        <p
                          className="text-capitalize mb-3"
                          style={{
                            color: '#71717A',
                            fontSize: '0.82rem'
                          }}
                        >
                          {institution.instituteType}
                        </p>

                        <span
                          className="d-inline-flex align-items-center gap-1"
                          style={{
                            color: '#6D28D9',
                            fontSize: '0.76rem',
                            fontWeight: 700
                          }}
                        >
                          Open institution
                          <i className="bi bi-arrow-right"></i>
                        </span>

                      </div>

                    </Link>

                  </div>
                )
              })}

              {/* ================= JOIN INSTITUTION ================= */}
              <div className="col-md-6 col-xl-4">

                <Link
                  to="/learner/institutions"
                  className="text-decoration-none"
                >

                  <div
                    className="h-100 rounded-4 border p-4"
                    style={{
                      background: '#FBF9FF',
                      borderColor: '#E9D5FF',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-3px)'
                      e.currentTarget.style.borderColor =
                        '#A78BFA'
                      e.currentTarget.style.background =
                        '#F8F5FF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0)'
                      e.currentTarget.style.borderColor =
                        '#E9D5FF'
                      e.currentTarget.style.background =
                        '#FBF9FF'
                    }}
                  >

                    <div className="d-flex justify-content-between align-items-start">

                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: '#F0EAFE',
                          color: '#6D28D9',
                          marginBottom: '18px'
                        }}
                      >
                        <i className="bi bi-plus-lg fs-5"></i>
                      </div>

                      <i
                        className="bi bi-arrow-up-right"
                        style={{
                          color: '#8B5CF6',
                          fontSize: '1rem'
                        }}
                      ></i>

                    </div>

                    <h5
                      className="fw-semibold mb-1"
                      style={{
                        color: '#5B21B6',
                        fontSize: '0.98rem'
                      }}
                    >
                      Join an Institution
                    </h5>

                    <p
                      className="mb-3"
                      style={{
                        color: '#71717A',
                        fontSize: '0.82rem',
                        lineHeight: 1.5
                      }}
                    >
                      Find and join a new learning community.
                    </p>

                    <span
                      className="d-inline-flex align-items-center gap-1"
                      style={{
                        color: '#6D28D9',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                    >
                      Find institution
                      <i className="bi bi-arrow-right"></i>
                    </span>

                  </div>

                </Link>

              </div>

            </div>

            {/* ================= BOTTOM MESSAGE ================= */}
            <div className="d-flex justify-content-center mt-4">

              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #ECE8F2',
                  color: '#8A8494',
                  fontSize: '0.74rem'
                }}
              >
                <i
                  className="bi bi-arrow-repeat"
                  style={{ color: '#8B5CF6' }}
                ></i>

                Your learning journey can adapt as you grow.
              </div>

            </div>

          </>
        )}

      </div>
    </div>
  )
}

export default Learner