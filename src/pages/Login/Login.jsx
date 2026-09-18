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

  return (
    <main
      className="min-vh-100 py-5"
      style={{
        background:
          'linear-gradient(180deg, #faf8ff 0%, #ffffff 45%, #faf8ff 100%)'
      }}
    >
      <div className="container px-3">

        {/* Header */}
        <div className="text-center mb-4">

          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
            style={{
              background: '#F3EEFF',
              color: '#6D28D9',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.7px'
            }}
          >
            <i className="bi bi-stars"></i>
            WELCOME BACK
          </div>

          <h1
            className="fw-bold mb-2"
            style={{
              color: '#171321',
              letterSpacing: '-1px'
            }}
          >
            Welcome back to EduAdapt
          </h1>

          <p
            className="mb-0"
            style={{
              color: '#6B6575',
              fontSize: '1rem'
            }}
          >
            Sign in to continue your personalized learning journey.
          </p>

        </div>

        {/* Login Card */}
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-7 col-lg-5">

            <div
              style={{
                background: '#ffffff',
                borderRadius: '22px',
                border: '1px solid #EEEAF7',
                boxShadow:
                  '0 15px 45px rgba(39, 20, 70, 0.08)'
              }}
            >
              <div className="p-4 p-md-5">

                {error && (
                  <div
                    className="alert border-0 mb-4"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      borderRadius: '12px'
                    }}
                  >
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* Email */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: '#302A3B' }}
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
                          color: '#8B5CF6'
                        }}
                      ></i>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        required
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px 12px 42px',
                          borderColor: '#E5E0EF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: '#302A3B' }}
                    >
                      Password
                    </label>

                    <div className="position-relative">
                      <i
                        className="bi bi-lock position-absolute"
                        style={{
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#8B5CF6'
                        }}
                      ></i>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        required
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px 12px 42px',
                          borderColor: '#E5E0EF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white py-3 rounded-3"
                    disabled={loading}
                    style={{
                      background:
                        'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                      border: 'none',
                      fontWeight: 700,
                      boxShadow:
                        '0 10px 24px rgba(109, 40, 217, 0.18)'
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </button>

                </form>

                {/* Register hint */}
                <div
                  className="d-flex justify-content-center mt-4 pt-4"
                  style={{
                    borderTop: '1px solid #F0ECF7'
                  }}
                >
                  <span
                    style={{
                      color: '#746E7E',
                      fontSize: '0.9rem'
                    }}
                  >
                    Don't have an account?
                  </span>

                  <Link
                    className="btn btn-link p-0 ms-2"
                    to="/register"
                    style={{
                      color: '#6D28D9',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Register Now
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