import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [accountType, setAccountType] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Common fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Institute-specific field
  const [instituteType, setInstituteType] = useState('')

  const [error, setError] = useState('')

  const handleContinue = () => {
    if (!accountType) {
      setError('Please select an account type')
      return
    }

    setError('')
    setShowForm(true)
  }

  const handleBack = () => {
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (accountType === 'institute' && !instituteType) {
      setError('Please select an institute type')
      return
    }

    const registrationData = {
      accountType,
      name,
      email,
      password,
      confirmPassword
    }

    if (accountType === 'institute') {
      registrationData.instituteType = instituteType
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registrationData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      console.log('Registration successful:', data)

      alert('Registration successful!')
    } catch (error) {
      console.error('Registration error:', error)

      setError(
        'Unable to connect to the server. Please try again.'
      )
    }
  }

  const getAccountTitle = () => {
    if (accountType === 'institute') return 'Institute'
    if (accountType === 'teacher') return 'Teacher'
    return 'Learner'
  }

  const accountOptions = [
    {
      type: 'learner',
      icon: 'bi-mortarboard-fill',
      title: 'Learner',
      description:
        'Learn independently or through an institution with adaptive learning.'
    },
    {
      type: 'teacher',
      icon: 'bi-person-workspace',
      title: 'Teacher',
      description:
        'Teach independently or through an institution and track learner progress.'
    },
    {
      type: 'institute',
      icon: 'bi-building-fill',
      title: 'Institute',
      description:
        'Manage learners, teachers, courses, assessments and institutional learning.'
    }
  ]

  return (
    <main
      className="min-vh-100 py-4 bg-dark"
      style={{
        background:
          'linear-gradient(180deg, #faf8ff 0%, #ffffff 45%, #faf8ff 100%)'
      }}
    >
      <div className="container px-3">

        {!showForm ? (
          <>
            {/* Header */}
            <div className="text-center mb-5">
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
                JOIN EDUADAPT
              </div>

              <h1
                className="fw-bold mb-3"
                style={{
                  color: '#171321',
                  letterSpacing: '-1px'
                }}
              >
                Create your account
              </h1>

              <p
                className="mb-0 mx-auto"
                style={{
                  color: '#6B6575',
                  maxWidth: '560px',
                  fontSize: '1.05rem'
                }}
              >
                Choose how you want to use EduAdapt and start
                your personalized learning journey.
              </p>
            </div>

            {/* Account cards */}
            <div className="row g-4 justify-content-center  mb-5">

              {accountOptions.map((option) => {
                const selected = accountType === option.type

                return (
                  <div
                    className="col-md-4"
                    key={option.type}
                  >
                    <div
                      className="h-100 position-relative"
                      onClick={() => setAccountType(option.type)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '22px',
                        padding: '2px',
                        background: selected
                          ? 'linear-gradient(135deg, #6D28D9, #A78BFA)'
                          : 'transparent',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div
                        className="h-100 text-center"
                        style={{
                          background: '#ffffff',
                          border: selected
                            ? 'none'
                            : '1px solid #EDE9F7',
                          borderRadius: '20px',
                          padding: '32px 24px',
                          boxShadow: selected
                            ? '0 18px 40px rgba(109, 40, 217, 0.14)'
                            : '0 8px 25px rgba(39, 20, 70, 0.05)',
                          transform: selected
                            ? 'translateY(-4px)'
                            : 'translateY(0)',
                          transition: 'all 0.25s ease'
                        }}
                      >

                        {/* Icon */}
                        <div
                          className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-4"
                          style={{
                            width: '64px',
                            height: '64px',
                            background: selected
                              ? 'linear-gradient(135deg, #6D28D9, #8B5CF6)'
                              : '#F5F3FF',
                            color: selected
                              ? '#ffffff'
                              : '#7C3AED',
                            fontSize: '1.6rem',
                            boxShadow: selected
                              ? '0 10px 22px rgba(109, 40, 217, 0.20)'
                              : 'none'
                          }}
                        >
                          <i className={`bi ${option.icon}`}></i>
                        </div>

                        <h4
                          className="fw-bold mb-2"
                          style={{ color: '#211B2C' }}
                        >
                          {option.title}
                        </h4>

                        <p
                          className="mb-4"
                          style={{
                            color: '#746E7E',
                            fontSize: '0.92rem',
                            lineHeight: '1.65'
                          }}
                        >
                          {option.description}
                        </p>

                        {selected && (
                          <span
                            className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                            style={{
                              background: '#F3EEFF',
                              color: '#6D28D9',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            <i className="bi bi-check-circle-fill"></i>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>

            {error && (
              <div
                className="alert text-center mt-4 mx-auto border-0"
                style={{
                  maxWidth: '700px',
                  background: '#FEF2F2',
                  color: '#B91C1C',
                  borderRadius: '14px'
                }}
              >
                {error}
              </div>
            )}

            {accountType && (
              <div className="text-center">
                <button
                  className="btn text-white rounded-3 px-5 py-3"
                  onClick={handleContinue}
                  style={{
                    background:
                      'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                    border: 'none',
                    fontWeight: 700,
                    boxShadow:
                      '0 10px 24px rgba(109, 40, 217, 0.20)'
                  }}
                >
                  Continue
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Form Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
                style={{
                  background: '#F3EEFF',
                  color: '#6D28D9',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.6px'
                }}
              >
                <i className="bi bi-stars"></i>
                CREATE {accountType.toUpperCase()} ACCOUNT
              </div>

              <h1
                className="fw-bold mb-2"
                style={{
                  color: '#171321',
                  letterSpacing: '-0.8px'
                }}
              >
                Complete your registration
              </h1>

              <p
                className="mb-0"
                style={{ color: '#6B6575' }}
              >
                Create your {getAccountTitle().toLowerCase()} account.
              </p>
            </div>

            {/* Form */}
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">

                <div
                  className="border-0"
                  style={{
                    background: '#ffffff',
                    borderRadius: '22px',
                    boxShadow:
                      '0 15px 45px rgba(39, 20, 70, 0.08)',
                    border: '1px solid #EEEAF7'
                  }}
                >
                  <div className="p-4 p-md-5">

                    {/* Account indicator */}
                    <div
                      className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4"
                      style={{
                        background: '#FAF8FF',
                        border: '1px solid #EEE8FA'
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                          width: '42px',
                          height: '42px',
                          background:
                            'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                          color: '#ffffff'
                        }}
                      >
                        <i
                          className={`bi ${accountType === 'learner'
                              ? 'bi-mortarboard-fill'
                              : accountType === 'teacher'
                                ? 'bi-person-workspace'
                                : 'bi-building-fill'
                            }`}
                        ></i>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#817A8D'
                          }}
                        >
                          Account type
                        </div>

                        <div
                          className="fw-semibold"
                          style={{ color: '#302A3B' }}
                        >
                          {getAccountTitle()}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                      {/* Institute-specific fields */}
                      {accountType === 'institute' && (
                        <>
                          <div className="mb-3">
                            <label
                              className="form-label fw-semibold"
                              style={{ color: '#302A3B' }}
                            >
                              Institute Name
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter institute name"
                              value={name}
                              onChange={(event) =>
                                setName(event.target.value)
                              }
                              style={{
                                borderRadius: '12px',
                                padding: '12px 14px',
                                borderColor: '#E5E0EF'
                              }}
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              className="form-label fw-semibold"
                              style={{ color: '#302A3B' }}
                            >
                              Institute Type
                            </label>

                            <select
                              className="form-select"
                              value={instituteType}
                              onChange={(event) =>
                                setInstituteType(event.target.value)
                              }
                              style={{
                                borderRadius: '12px',
                                padding: '12px 14px',
                                borderColor: '#E5E0EF'
                              }}
                            >
                              <option value="">
                                Select institute type
                              </option>
                              <option value="school">
                                School
                              </option>
                              <option value="college">
                                College
                              </option>
                              <option value="university">
                                University
                              </option>
                              <option value="coaching">
                                Coaching / Training
                              </option>
                              <option value="other">
                                Other
                              </option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Teacher / Learner name */}
                      {accountType !== 'institute' && (
                        <div className="mb-3">
                          <label
                            className="form-label fw-semibold"
                            style={{ color: '#302A3B' }}
                          >
                            Full Name
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(event) =>
                              setName(event.target.value)
                            }
                            style={{
                              borderRadius: '12px',
                              padding: '12px 14px',
                              borderColor: '#E5E0EF'
                            }}
                          />
                        </div>
                      )}

                      {/* Email */}
                      <div className="mb-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ color: '#302A3B' }}
                        >
                          {accountType === 'institute'
                            ? 'Official Email Address'
                            : 'Email Address'}
                        </label>

                        <input
                          type="email"
                          className="form-control"
                          placeholder={
                            accountType === 'institute'
                              ? 'Enter official email'
                              : 'Enter your email'
                          }
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                          style={{
                            borderRadius: '12px',
                            padding: '12px 14px',
                            borderColor: '#E5E0EF'
                          }}
                        />
                      </div>

                      {/* Password */}
                      <div className="mb-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ color: '#302A3B' }}
                        >
                          Password
                        </label>

                        <input
                          type="password"
                          className="form-control"
                          placeholder="Minimum 6 characters"
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          style={{
                            borderRadius: '12px',
                            padding: '12px 14px',
                            borderColor: '#E5E0EF'
                          }}
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ color: '#302A3B' }}
                        >
                          Confirm Password
                        </label>

                        <input
                          type="password"
                          className="form-control"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          style={{
                            borderRadius: '12px',
                            padding: '12px 14px',
                            borderColor: '#E5E0EF'
                          }}
                        />
                      </div>

                      {error && (
                        <div
                          className="alert border-0"
                          style={{
                            background: '#FEF2F2',
                            color: '#B91C1C',
                            borderRadius: '12px'
                          }}
                        >
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn w-100 text-white py-3 rounded-3"
                        style={{
                          background:
                            'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                          border: 'none',
                          fontWeight: 700,
                          boxShadow:
                            '0 10px 24px rgba(109, 40, 217, 0.18)'
                        }}
                      >
                        Continue Registration
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>

                    </form>

                    <button
                      type="button"
                      className="btn w-100 mt-3"
                      onClick={handleBack}
                      style={{
                        color: '#6D28D9',
                        fontWeight: 600
                      }}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Change Account Type
                    </button>

                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {/* Login hint */}
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
            Already have an account?
          </span>

          <Link
            className="btn btn-link p-0 ms-2"
            to="/login"
            style={{
              color: '#6D28D9',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Login Now
          </Link>
        </div>

      </div>
    </main>
  )
}

export default Register