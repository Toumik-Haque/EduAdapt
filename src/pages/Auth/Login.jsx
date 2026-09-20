import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await loginUser(email, password)

      console.log('Login response:', data)

      login(data)

      if (data.user.accountType === 'learner') {
        navigate('/learner')
      } else if (data.user.accountType === 'teacher') {
        navigate('/teacher')
      } else if (data.user.accountType === 'institute') {
        navigate('/institute')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    borderRadius: '11px',
    padding: '11px 14px 11px 42px',
    border: '1px solid #E5E0EF',
    background: '#FFFFFF',
    color: '#18181B',
    boxShadow: 'none'
  }

  return (
    <main
      className="d-flex align-items-center py-5 py-lg-5"
      style={{
        background: '#F8F7FC'
      }}
    >
      <div className="container px-3">

        <div className="row justify-content-center align-items-stretch g-0">

          {/* Left Brand Panel */}
          <div className="col-lg-5 d-none d-lg-flex">
            <div
              className="w-100 d-flex flex-column justify-content-between p-5"
              style={{
                background:
                  'linear-gradient(145deg, #5B21B6 0%, #7C3AED 55%, #8B5CF6 100%)',
                borderRadius: '24px 0 0 24px',
                minHeight: '560px',
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {/* Decorative shapes */}
              <div
                style={{
                  position: 'absolute',
                  width: '230px',
                  height: '230px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.14)',
                  right: '-90px',
                  top: '-70px'
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  left: '-70px',
                  bottom: '70px'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Brand */}
                <div className="d-flex align-items-center gap-2 mb-5">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    <i className="bi bi-stars fs-5"></i>
                  </div>

                  <div>
                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '1.05rem',
                        letterSpacing: '-0.3px'
                      }}
                    >
                      EduAdapt
                    </div>

                    <div
                      style={{
                        fontSize: '0.7rem',
                        opacity: 0.75,
                        letterSpacing: '0.8px'
                      }}
                    >
                      ADAPTIVE EDUCATION
                    </div>
                  </div>
                </div>

                {/* Main message */}
                <div style={{ maxWidth: '390px' }}>
                  <div
                    className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <i className="bi bi-magic"></i>
                    ADAPTIVE EDUCATION ECOSYSTEM
                  </div>

                  <h1
                    className="fw-bold mb-3"
                    style={{
                      fontSize: '2.35rem',
                      lineHeight: 1.12,
                      letterSpacing: '-1.2px'
                    }}
                  >
                    Education that adapts to every journey.
                  </h1>

                  <p
                    className="mb-0"
                    style={{
                      color: 'rgba(255,255,255,0.78)',
                      lineHeight: 1.7,
                      fontSize: '0.95rem'
                    }}
                  >
                    Learn, teach, and manage education through one
                    connected ecosystem designed around individual needs.
                  </p>
                </div>
              </div>

              {/* Feature points */}
              <div
                className="position-relative"
                style={{ zIndex: 1 }}
              >
                <div
                  className="d-flex align-items-center gap-3 mb-3"
                  style={{ fontSize: '0.88rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-person-check"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Personalized learning experiences
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-3 mb-3"
                  style={{ fontSize: '0.88rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-mortarboard"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Connected learners and teachers
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-3"
                  style={{ fontSize: '0.88rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Data-driven progress and insights
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Login Panel */}
          <div className="col-lg-5">

            <div
              className="h-100"
              style={{
                background: '#FFFFFF',
                border: '1px solid #EAE5F4',
                borderRadius: '0 24px 24px 0',
                boxShadow: '0 18px 50px rgba(39, 20, 70, 0.07)'
              }}
            >
              <div className="p-4 p-md-5">

                {/* Header */}
                <div className="mb-4">

                  <div
                    className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
                    style={{
                      background: '#F5F3FF',
                      color: '#6D28D9',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.6px'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    WELCOME BACK
                  </div>

                  <h2
                    className="fw-bold mb-2"
                    style={{
                      color: '#18181B',
                      fontSize: '1.8rem',
                      letterSpacing: '-0.7px'
                    }}
                  >
                    Sign in to EduAdapt
                  </h2>

                  <p
                    className="mb-0"
                    style={{
                      color: '#71717A',
                      fontSize: '0.9rem',
                      lineHeight: 1.6
                    }}
                  >
                    Continue your personalized education journey.
                  </p>

                </div>

                {/* Error */}
                {error && (
                  <div
                    className="d-flex align-items-start gap-2 mb-4 p-3"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA',
                      borderRadius: '11px',
                      fontSize: '0.84rem'
                    }}
                  >
                    <i className="bi bi-exclamation-circle mt-1"></i>

                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* Email */}
                  <div className="mb-3">

                    <label
                      className="form-label mb-2 fw-semibold"
                      style={{
                        color: '#302A3B',
                        fontSize: '0.84rem'
                      }}
                    >
                      Email Address
                    </label>

                    <div className="position-relative">

                      <i
                        className="bi bi-envelope position-absolute"
                        style={{
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#8B5CF6',
                          zIndex: 2
                        }}
                      />

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        required
                        style={inputStyle}
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div className="mb-4">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                      <label
                        className="form-label mb-0 fw-semibold"
                        style={{
                          color: '#302A3B',
                          fontSize: '0.84rem'
                        }}
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        style={{
                          color: '#6D28D9',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="position-relative">

                      <i
                        className="bi bi-lock position-absolute"
                        style={{
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#8B5CF6',
                          zIndex: 2
                        }}
                      />

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        required
                        style={inputStyle}
                      />

                    </div>

                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                    style={{
                      minHeight: '46px',
                      borderRadius: '11px',
                      background:
                        'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow:
                        '0 8px 20px rgba(109, 40, 217, 0.16)'
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          aria-hidden="true"
                        ></span>

                        Logging in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>

                </form>

                {/* Register */}
                <div
                  className="d-flex justify-content-center align-items-center flex-wrap gap-1 mt-4 pt-4"
                  style={{
                    borderTop: '1px solid #F0ECF7',
                    fontSize: '0.84rem'
                  }}
                >
                  <span style={{ color: '#746E7E' }}>
                    Don't have an account?
                  </span>

                  <Link
                    to="/register"
                    style={{
                      color: '#6D28D9',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Create an account
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}

export default Login