import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top bg-white"
      style={{
        borderBottom: '1px solid #eee9f7',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="container px-3">

        {/* ================= BRAND ================= */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          style={{
            fontSize: '1.35rem',
            letterSpacing: '-0.5px',
            color: '#171321',
          }}
        >

          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: '34px',
              height: '34px',
              background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
              color: 'white',
              boxShadow: '0 5px 14px rgba(109, 40, 217, 0.20)',
            }}
          >
            <i className="bi bi-stars"></i>
          </div>

          <span>
            <span style={{ color: '#7C3AED' }}>Edu</span>
            Adapt
          </span>

        </Link>


        {/* ================= MOBILE TOGGLER ================= */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#eduAdaptNavbar"
          aria-controls="eduAdaptNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span
            className="navbar-toggler-icon"
          ></span>
        </button>


        {/* ================= NAVIGATION ================= */}
        <div
          className="collapse navbar-collapse"
          id="eduAdaptNavbar"
        >

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-2">

            {/* <li className="nav-item">
              <Link
                className="nav-link px-3"
                to="/"
                style={{
                  color: '#4B4654',
                  fontWeight: 500,
                }}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <a
                className="nav-link px-3"
                href="/#ecosystem"
                style={{
                  color: '#4B4654',
                  fontWeight: 500,
                }}
              >
                Ecosystem
              </a>
            </li> */}

            {isAuthenticated && (
              <>
                {user?.accountType === 'learner' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link px-3"
                      to="/learner"
                      style={{
                        color: '#4B4654',
                        fontWeight: 500,
                      }}
                    >
                      Learning
                    </Link>
                  </li>
                )}

                {user?.accountType === 'teacher' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link px-3"
                      to="/teacher"
                      style={{
                        color: '#4B4654',
                        fontWeight: 500,
                      }}
                    >
                      Teaching
                    </Link>
                  </li>
                )}

                {user?.accountType === 'institute' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link px-3"
                      to="/institute"
                      style={{
                        color: '#4B4654',
                        fontWeight: 500,
                      }}
                    >
                      Institution
                    </Link>
                  </li>
                )}
              </>
            )}

          </ul>


          {/* ================= RIGHT SIDE ================= */}
          <div className="d-flex gap-2 align-items-center">

            {isAuthenticated ? (
              <>

                {/* User */}
                <div
                  className="d-none d-md-flex align-items-center gap-2 me-2"
                >

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      background: '#F5F3FF',
                      color: '#7C3AED',
                    }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>

                  <div className="lh-sm">

                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: '0.85rem',
                        color: '#2B2633',
                      }}
                    >
                      {user?.name || 'User'}
                    </div>

                    <div
                      className="text-secondary"
                      style={{
                        fontSize: '0.68rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user?.accountType}
                    </div>

                  </div>

                </div>

                {/* Logout */}
                <button
                  type="button"
                  className="btn rounded-3 px-3"
                  onClick={logout}
                  style={{
                    border: '1px solid #E9D5FF',
                    color: '#6D28D9',
                    background: '#FAF8FF',
                    fontWeight: 600,
                  }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className="btn rounded-3 px-3"
                  style={{
                    color: '#6D28D9',
                    border: '1px solid #DDD6FE',
                    background: 'white',
                    fontWeight: 600,
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn text-white rounded-3 px-3"
                  style={{
                    background:
                      'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow:
                      '0 5px 14px rgba(109, 40, 217, 0.18)',
                  }}
                >
                  Sign Up
                </Link>

              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
