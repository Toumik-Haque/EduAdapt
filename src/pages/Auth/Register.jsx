import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [accountType, setAccountType] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Common fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Institute-specific field
  const [instituteType, setInstituteType] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    if (resendCooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

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

    setName('')
    setEmail('')
    setOtp('')
    setOtpSent(false)
    setPassword('')
    setConfirmPassword('')
    setInstituteType('')
  }

  const handleSendOTP = async () => {
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setSendingOTP(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/send-registration-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to send OTP')
        return
      }

      setOtpSent(true)
      setOtp('')
      setResendCooldown(60)
    } catch (error) {
      console.error('Send OTP error:', error)

      setError(
        'Unable to connect to the server. Please try again.'
      )
    } finally {
      setSendingOTP(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (!otpSent) {
      setError('Please verify your email by sending an OTP')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
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
      confirmPassword,
      otp
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

      alert(
        'Registration successful! Please login to continue.'
      )

      window.location.href = '/login'
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

  const getAccountIcon = () => {
    if (accountType === 'learner') {
      return 'bi-mortarboard'
    }

    if (accountType === 'teacher') {
      return 'bi-person-workspace'
    }

    return 'bi-building'
  }

  const accountOptions = [
    {
      type: 'learner',
      icon: 'bi-mortarboard',
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
      icon: 'bi-building',
      title: 'Institute',
      description:
        'Manage learners, teachers, batches and institutional learning.'
    }
  ]

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FAF9FC',
        color: '#18181B'
      }}
    >

      {/* =====================================================
          TOP BRAND
      ===================================================== */}
      <div className="container px-3">

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}
        <div
          className="py-5"
          style={{
            maxWidth: '980px',
            margin: '0 auto'
          }}
        >

          {!showForm ? (

            <>
              {/* =============================================
                  STEP HEADER
              ============================================= */}
              <div className="text-center mb-4">

                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-3"
                  style={{
                    background: '#F5F3FF',
                    border: '1px solid #E9D5FF',
                    color: '#7C3AED',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.6px'
                  }}
                >
                  STEP

                  <span
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '10px'
                    }}
                  >
                    1
                  </span>

                  ACCOUNT TYPE
                </div>

                <h1
                  className="fw-bold mb-2"
                  style={{
                    color: '#18181B',
                    fontSize: 'clamp(26px, 4vw, 34px)',
                    letterSpacing: '-0.8px'
                  }}
                >
                  Create your EduAdapt account
                </h1>

                <p
                  className="mb-0 mx-auto"
                  style={{
                    maxWidth: '570px',
                    color: '#71717A',
                    fontSize: '14px',
                    lineHeight: '1.7'
                  }}
                >
                  Choose how you want to use EduAdapt.
                  Your account experience will adapt to your role.
                </p>

              </div>

              {/* =============================================
                  ACCOUNT OPTIONS
              ============================================= */}
              <div className="row g-3">

                {accountOptions.map((option) => {
                  const selected =
                    accountType === option.type

                  return (
                    <div
                      className="col-12 col-md-4"
                      key={option.type}
                    >

                      <button
                        type="button"
                        onClick={() => {
                          setAccountType(option.type)
                          setError('')
                        }}
                        className="w-100 text-start h-100"
                        style={{
                          background: '#FFFFFF',
                          border: selected
                            ? '1.5px solid #7C3AED'
                            : '1px solid #E4E4E7',
                          borderRadius: '15px',
                          padding: '20px',
                          boxShadow: selected
                            ? '0 8px 24px rgba(124, 58, 237, 0.10)'
                            : '0 2px 8px rgba(24, 24, 27, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >

                        <div className="d-flex align-items-start justify-content-between">

                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '11px',
                              background: selected
                                ? '#7C3AED'
                                : '#F5F3FF',
                              color: selected
                                ? '#FFFFFF'
                                : '#7C3AED'
                            }}
                          >
                            <i
                              className={`bi ${option.icon}`}
                              style={{
                                fontSize: '18px'
                              }}
                            />
                          </div>

                          {selected && (
                            <i
                              className="bi bi-check-circle-fill"
                              style={{
                                color: '#7C3AED',
                                fontSize: '17px'
                              }}
                            />
                          )}

                        </div>

                        <h5
                          className="fw-semibold mt-4 mb-2"
                          style={{
                            color: '#18181B',
                            fontSize: '16px'
                          }}
                        >
                          {option.title}
                        </h5>

                        <p
                          className="mb-0"
                          style={{
                            color: '#71717A',
                            fontSize: '12px',
                            lineHeight: '1.65'
                          }}
                        >
                          {option.description}
                        </p>

                      </button>

                    </div>
                  )
                })}

              </div>

              {/* =============================================
                  ERROR
              ============================================= */}
              {error && (
                <div
                  className="d-flex align-items-center gap-2 mt-3 px-3 py-2"
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#B91C1C',
                    borderRadius: '10px',
                    fontSize: '13px'
                  }}
                >
                  <i className="bi bi-exclamation-circle" />
                  {error}
                </div>
              )}

              {/* =============================================
                  CONTINUE
              ============================================= */}
              <div className="d-flex justify-content-center mt-4">

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!accountType}
                  className="btn d-flex align-items-center justify-content-center gap-2"
                  style={{
                    minWidth: '170px',
                    background: accountType
                      ? '#7C3AED'
                      : '#E4E4E7',
                    color: accountType
                      ? '#FFFFFF'
                      : '#A1A1AA',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Continue
                  <i className="bi bi-arrow-right" />
                </button>

              </div>

            </>

          ) : (

            <>
              {/* =============================================
                  FORM HEADER
              ============================================= */}
              <div className="text-center mb-4">

                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-3"
                  style={{
                    background: '#F5F3FF',
                    border: '1px solid #E9D5FF',
                    color: '#7C3AED',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.6px'
                  }}
                >
                  STEP

                  <span
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '10px'
                    }}
                  >
                    2
                  </span>

                  ACCOUNT DETAILS
                </div>

                <h1
                  className="fw-bold mb-2"
                  style={{
                    color: '#18181B',
                    fontSize: 'clamp(25px, 4vw, 32px)',
                    letterSpacing: '-0.7px'
                  }}
                >
                  Complete your registration
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: '#71717A',
                    fontSize: '14px'
                  }}
                >
                  Set up your {getAccountTitle().toLowerCase()} account.
                </p>

              </div>

              {/* =============================================
                  FORM LAYOUT
              ============================================= */}
              <div className="row justify-content-center">

                <div className="col-12 col-md-9 col-lg-7">

                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E4E4E7',
                      borderRadius: '16px',
                      boxShadow:
                        '0 4px 18px rgba(24, 24, 27, 0.04)'
                    }}
                  >

                    <div className="p-3 p-md-4">

                      {/* Account Type */}
                      <div
                        className="d-flex align-items-center justify-content-between mb-4 p-3"
                        style={{
                          background: '#FAF9FC',
                          border: '1px solid #EDEAF2',
                          borderRadius: '11px'
                        }}
                      >

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: '#F5F3FF',
                              color: '#7C3AED'
                            }}
                          >
                            <i className={`bi ${getAccountIcon()}`} />
                          </div>

                          <div>

                            <div
                              style={{
                                color: '#A1A1AA',
                                fontSize: '11px',
                                marginBottom: '2px'
                              }}
                            >
                              Account type
                            </div>

                            <div
                              className="fw-semibold"
                              style={{
                                color: '#18181B',
                                fontSize: '14px'
                              }}
                            >
                              {getAccountTitle()}
                            </div>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={handleBack}
                          className="btn btn-sm"
                          style={{
                            color: '#7C3AED',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Change
                        </button>

                      </div>

                      <form onSubmit={handleSubmit}>

                        {/* =====================================
                            INSTITUTE
                        ===================================== */}
                        {accountType === 'institute' && (
                          <>
                            <div className="mb-3">

                              <label
                                className="form-label"
                                style={{
                                  color: '#3F3F46',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                Institute Name
                              </label>

                              <div className="input-group">

                                <span
                                  className="input-group-text"
                                  style={{
                                    background: '#FAFAFA',
                                    borderColor: '#E4E4E7',
                                    color: '#7C3AED'
                                  }}
                                >
                                  <i className="bi bi-building" />
                                </span>

                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter institute name"
                                  value={name}
                                  onChange={(event) =>
                                    setName(event.target.value)
                                  }
                                  style={{
                                    borderColor: '#E4E4E7',
                                    fontSize: '13px',
                                    padding: '10px 12px'
                                  }}
                                />

                              </div>

                            </div>

                            <div className="mb-3">

                              <label
                                className="form-label"
                                style={{
                                  color: '#3F3F46',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
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
                                  borderColor: '#E4E4E7',
                                  borderRadius: '9px',
                                  fontSize: '13px',
                                  padding: '10px 12px'
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

                        {/* =====================================
                            NAME
                        ===================================== */}
                        {accountType !== 'institute' && (
                          <div className="mb-3">

                            <label
                              className="form-label"
                              style={{
                                color: '#3F3F46',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              Full Name
                            </label>

                            <div className="input-group">

                              <span
                                className="input-group-text"
                                style={{
                                  background: '#FAFAFA',
                                  borderColor: '#E4E4E7',
                                  color: '#7C3AED'
                                }}
                              >
                                <i className="bi bi-person" />
                              </span>

                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(event) =>
                                  setName(event.target.value)
                                }
                                style={{
                                  borderColor: '#E4E4E7',
                                  fontSize: '13px',
                                  padding: '10px 12px'
                                }}
                              />

                            </div>

                          </div>
                        )}

                        {/* =====================================
                            EMAIL
                        ===================================== */}
                        <div className="mb-3">

                          <label
                            className="form-label"
                            style={{
                              color: '#3F3F46',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            {accountType === 'institute'
                              ? 'Official Email Address'
                              : 'Email Address'}
                          </label>

                          <div className="d-flex gap-2">

                            <div className="input-group">

                              <span
                                className="input-group-text d-none d-sm-flex"
                                style={{
                                  background: '#FAFAFA',
                                  borderColor: '#E4E4E7',
                                  color: '#7C3AED'
                                }}
                              >
                                <i className="bi bi-envelope" />
                              </span>

                              <input
                                type="email"
                                className="form-control"
                                placeholder={
                                  accountType === 'institute'
                                    ? 'Enter official email'
                                    : 'Enter your email'
                                }
                                value={email}
                                onChange={(event) => {
                                  setEmail(event.target.value)
                                  setOtpSent(false)
                                  setOtp('')
                                  setResendCooldown(0)
                                }}
                                style={{
                                  borderColor: '#E4E4E7',
                                  fontSize: '13px',
                                  padding: '10px 12px'
                                }}
                              />

                            </div>

                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={sendingOTP}
                              className="btn d-flex align-items-center justify-content-center gap-1"
                              style={{
                                background: '#F5F3FF',
                                color: '#7C3AED',
                                border: '1px solid #DDD6FE',
                                borderRadius: '9px',
                                padding: '0 13px',
                                fontSize: '12px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >

                              {sendingOTP ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    style={{
                                      width: '12px',
                                      height: '12px'
                                    }}
                                  />
                                  Sending
                                </>
                              ) : otpSent ? (
                                <>
                                  <i className="bi bi-check-circle" />
                                  Sent
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-send" />
                                  Send OTP
                                </>
                              )}

                            </button>

                          </div>

                        </div>

                        {/* =====================================
                            OTP
                        ===================================== */}
                        {otpSent && (
                          <div
                            className="mb-3 p-3"
                            style={{
                              background: '#FAF9FC',
                              border: '1px solid #EDEAF2',
                              borderRadius: '11px'
                            }}
                          >

                            <label
                              className="form-label"
                              style={{
                                color: '#3F3F46',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              Email Verification Code
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(event) =>
                                setOtp(
                                  event.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6)
                                )
                              }
                              maxLength={6}
                              inputMode="numeric"
                              style={{
                                borderColor: '#DDD6FE',
                                borderRadius: '9px',
                                padding: '10px 12px',
                                fontSize: '16px',
                                letterSpacing: '5px',
                                fontWeight: '700',
                                textAlign: 'center'
                              }}
                            />

                            <div
                              className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2"
                            >

                              <div
                                style={{
                                  color: '#71717A',
                                  fontSize: '11px'
                                }}
                              >
                                <i className="bi bi-shield-check me-1" />
                                Code sent to {email}
                              </div>

                              <button
                                type="button"
                                className="btn btn-link p-0"
                                onClick={handleSendOTP}
                                disabled={
                                  sendingOTP ||
                                  resendCooldown > 0
                                }
                                style={{
                                  color:
                                    resendCooldown > 0
                                      ? '#A1A1AA'
                                      : '#7C3AED',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textDecoration: 'none'
                                }}
                              >
                                {resendCooldown > 0
                                  ? `Resend in ${resendCooldown}s`
                                  : 'Resend OTP'}
                              </button>

                            </div>

                          </div>
                        )}

                        {/* =====================================
                            PASSWORD
                        ===================================== */}
                        <div className="mb-3">

                          <label
                            className="form-label"
                            style={{
                              color: '#3F3F46',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            Password
                          </label>

                          <div className="input-group">

                            <span
                              className="input-group-text"
                              style={{
                                background: '#FAFAFA',
                                borderColor: '#E4E4E7',
                                color: '#7C3AED'
                              }}
                            >
                              <i className="bi bi-lock" />
                            </span>

                            <input
                              type="password"
                              className="form-control"
                              placeholder="Minimum 6 characters"
                              value={password}
                              onChange={(event) =>
                                setPassword(event.target.value)
                              }
                              style={{
                                borderColor: '#E4E4E7',
                                fontSize: '13px',
                                padding: '10px 12px'
                              }}
                            />

                          </div>

                        </div>

                        {/* =====================================
                            CONFIRM PASSWORD
                        ===================================== */}
                        <div className="mb-3">

                          <label
                            className="form-label"
                            style={{
                              color: '#3F3F46',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            Confirm Password
                          </label>

                          <div className="input-group">

                            <span
                              className="input-group-text"
                              style={{
                                background: '#FAFAFA',
                                borderColor: '#E4E4E7',
                                color: '#7C3AED'
                              }}
                            >
                              <i className="bi bi-lock-fill" />
                            </span>

                            <input
                              type="password"
                              className="form-control"
                              placeholder="Re-enter your password"
                              value={confirmPassword}
                              onChange={(event) =>
                                setConfirmPassword(event.target.value)
                              }
                              style={{
                                borderColor: '#E4E4E7',
                                fontSize: '13px',
                                padding: '10px 12px'
                              }}
                            />

                          </div>

                        </div>

                        {/* =====================================
                            ERROR
                        ===================================== */}
                        {error && (
                          <div
                            className="d-flex align-items-start gap-2 mb-3 px-3 py-2"
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#B91C1C',
                              borderRadius: '9px',
                              fontSize: '12px'
                            }}
                          >
                            <i className="bi bi-exclamation-circle" />
                            <span>{error}</span>
                          </div>
                        )}

                        {/* =====================================
                            SUBMIT
                        ===================================== */}
                        <button
                          type="submit"
                          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '9px',
                            padding: '11px 16px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          Create {getAccountTitle()} Account
                          <i className="bi bi-arrow-right" />
                        </button>

                      </form>

                    </div>

                  </div>

                </div>

              </div>
            </>
          )}

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div
          className="small mb-3 text-center"
          style={{
            color: '#71717A'
          }}
        >
          Already registered?

          <Link
            to="/login"
            className="text-decoration-none ms-1"
            style={{
              color: '#7C3AED',
              fontWeight: '600'
            }}
          >
            Login
          </Link>
        </div>

        <div
          className="text-center py-4"
          style={{
            borderTop: '1px solid #EDEAF2'
          }}
        >
          <span
            style={{
              color: '#A1A1AA',
              fontSize: '11px'
            }}
          >
            By creating an account, you can access EduAdapt's
            adaptive learning ecosystem.
          </span>
        </div>

      </div>
    </main>
  )
}

export default Register