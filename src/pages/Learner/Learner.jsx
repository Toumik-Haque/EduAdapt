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
            data.message ||
            'Failed to load institutions'
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
        background:
          'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 55%)'
      }}
    >

      <div className="container py-4 px-3">

        {/* ================= HEADER ================= */}
        <div className="col-lg-8 mb-4">

          <div
            className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-3"
            style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              border: '1px solid #E9D5FF',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <i className="bi bi-stars"></i>
            LEARNING ECOSYSTEM
          </div>

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
            Choose a learning space and continue your journey
            with EduAdapt.
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
              Loading your learning spaces...
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


        {/* ================= LEARNING SPACES ================= */}
        {!loading && !error && (
          <>
            <div className="row g-3">

              {/* ================= INDIVIDUAL ================= */}
              <div className="col-md-6 col-xl-4">

                <Link
                  to="/learner/individual"
                  className="text-decoration-none text-dark"
                >

                  <div
                    className="bg-white rounded-4 border p-4"
                    style={{
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.borderColor = '#C4B5FD'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = '#dee2e6'
                    }}
                  >

                    <div className="d-flex justify-content-between align-items-start">

                      <div>

                        <h5 className="fw-semibold mb-2">
                          Individual Learning
                        </h5>

                        <p
                          className="text-secondary mb-0"
                          style={{ fontSize: '0.9rem' }}
                        >
                          Learn independently
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
                  key={institution.id || institution._id}
                >

                  <Link
                    to={`/learner/institute/${institution.id || institution._id
                      }`}
                    className="text-decoration-none text-dark"
                  >

                    <div
                      className="bg-white rounded-4 border p-4"
                      style={{
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.borderColor = '#C4B5FD'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = '#dee2e6'
                      }}
                    >

                      <div className="d-flex justify-content-between align-items-start">

                        <div>

                          <h5 className="fw-semibold mb-2">
                            {institution.instituteName}
                          </h5>

                          <p
                            className="text-secondary text-capitalize mb-0"
                            style={{ fontSize: '0.9rem' }}
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
                  to="/learner/institutions"
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
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.borderColor = '#8B5CF6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = '#E9D5FF'
                    }}
                  >

                    <div className="d-flex justify-content-between align-items-start">

                      <div>

                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: '#6D28D9' }}
                        >
                          + Join Institution
                        </h5>

                        <p
                          className="text-secondary mb-0"
                          style={{ fontSize: '0.9rem' }}
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
                style={{ fontSize: '0.8rem' }}
              >
                Your learning journey can adapt as you grow.
              </span>

            </div>

          </>
        )}

      </div>
    </div>
  )
}

export default Learner