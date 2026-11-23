import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] =
    useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [resettingPassword, setResettingPassword] =
    useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (resendCooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSendOTP = async () => {
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your registered email address')
      return
    }

    setSendingOTP(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/send-password-reset-otp',
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
        setError(
          data.message || 'Unable to send OTP'
        )
        return
      }

      setOtpSent(true)
      setOtp('')
      setResendCooldown(60)

      setSuccess(
        'OTP sent successfully. Check your email.'
      )
    } catch (error) {
      console.error(
        'Send password reset OTP error:',
        error
      )

      setError(
        'Unable to connect to the server. Please try again.'
      )
    } finally {
      setSendingOTP(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!otpSent) {
      setError('Please request an OTP first')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters'
      )
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match')
      return
    }

    setResettingPassword(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
            confirmNewPassword
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || 'Unable to reset password'
        )
        return
      }

      setSuccess(
        'Password reset successfully. Redirecting to login...'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      console.error(
        'Reset password error:',
        error
      )

      setError(
        'Unable to connect to the server. Please try again.'
      )
    } finally {
      setResettingPassword(false)
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
                minHeight: '600px',
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {/* Decorative circle */}
              <div
                style={{
                  position: 'absolute',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.14)',
                  right: '-100px',
                  top: '-80px'
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: '170px',
                  height: '170px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  left: '-80px',
                  bottom: '80px'
                }}
              />

              <div
                className="position-relative"
                style={{ zIndex: 1 }}
              >

                {/* Brand */}
                <div className="d-flex align-items-center gap-2 mb-5">

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background:
                        'rgba(255,255,255,0.16)',
                      border:
                        '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    <i className="bi bi-stars fs-5"></i>
                  </div>

                  <div>
                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '1.05rem'
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
                      background:
                        'rgba(255,255,255,0.12)',
                      border:
                        '1px solid rgba(255,255,255,0.14)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}
                  >
                    <i className="bi bi-shield-check"></i>
                    SECURE ACCOUNT RECOVERY
                  </div>

                  <h1
                    className="fw-bold mb-3"
                    style={{
                      fontSize: '2.3rem',
                      lineHeight: 1.12,
                      letterSpacing: '-1.2px'
                    }}
                  >
                    Get back to your learning journey.
                  </h1>

                  <p
                    className="mb-0"
                    style={{
                      color:
                        'rgba(255,255,255,0.78)',
                      lineHeight: 1.7,
                      fontSize: '0.94rem'
                    }}
                  >
                    Verify your registered email with an
                    OTP and securely create a new password
                    for your EduAdapt account.
                  </p>

                </div>

              </div>

              {/* Recovery steps */}
              <div
                className="position-relative"
                style={{ zIndex: 1 }}
              >

                <div
                  className="d-flex align-items-center gap-3 mb-3"
                  style={{ fontSize: '0.86rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background:
                        'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-envelope"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Verify your registered email
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-3 mb-3"
                  style={{ fontSize: '0.86rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background:
                        'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-key"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Confirm the email OTP
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-3"
                  style={{ fontSize: '0.86rem' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background:
                        'rgba(255,255,255,0.12)'
                    }}
                  >
                    <i className="bi bi-lock"></i>
                  </div>

                  <span style={{ opacity: 0.88 }}>
                    Create a new password
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Recovery Panel */}
          <div className="col-lg-5">

            <div
              className="h-100"
              style={{
                background: '#FFFFFF',
                border: '1px solid #EAE5F4',
                borderRadius: '0 24px 24px 0',
                boxShadow:
                  '0 18px 50px rgba(39, 20, 70, 0.07)'
              }}
            >

              <div className="p-4 p-md-5">

                {/* Mobile Brand */}
                {/* <div className="d-lg-none mb-4">

                  <div className="d-flex align-items-center gap-2">

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: '#F3EEFF',
                        color: '#6D28D9'
                      }}
                    >
                      <i className="bi bi-stars fs-5"></i>
                    </div>

                    <div>
                      <div
                        className="fw-bold"
                        style={{
                          color: '#18181B',
                          fontSize: '1.05rem'
                        }}
                      >
                        EduAdapt
                      </div>

                      <div
                        style={{
                          color: '#8A8494',
                          fontSize: '0.68rem',
                          letterSpacing: '0.7px'
                        }}
                      >
                        ADAPTIVE EDUCATION
                      </div>
                    </div>

                  </div>

                </div> */}

                {/* Header */}
                <div className="mb-4">

                  <div
                    className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
                    style={{
                      background: '#F5F3FF',
                      color: '#6D28D9',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}
                  >
                    <i className="bi bi-shield-lock"></i>
                    ACCOUNT RECOVERY
                  </div>

                  <h2
                    className="fw-bold mb-2"
                    style={{
                      color: '#18181B',
                      fontSize: '1.8rem',
                      letterSpacing: '-0.7px'
                    }}
                  >
                    Reset your password
                  </h2>

                  <p
                    className="mb-0"
                    style={{
                      color: '#71717A',
                      fontSize: '0.9rem',
                      lineHeight: 1.6
                    }}
                  >
                    Enter your registered email to begin
                    the secure recovery process.
                  </p>

                </div>

                {/* Status messages */}
                {error && (
                  <div
                    className="d-flex align-items-start gap-2 mb-3 p-3"
                    style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA',
                      borderRadius: '11px',
                      fontSize: '0.83rem'
                    }}
                  >
                    <i className="bi bi-exclamation-circle mt-1"></i>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div
                    className="d-flex align-items-start gap-2 mb-3 p-3"
                    style={{
                      background: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #BBF7D0',
                      borderRadius: '11px',
                      fontSize: '0.83rem'
                    }}
                  >
                    <i className="bi bi-check-circle mt-1"></i>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>

                  {/* Email */}
                  <div className="mb-4">

                    <label
                      className="form-label fw-semibold mb-2"
                      style={{
                        color: '#302A3B',
                        fontSize: '0.84rem'
                      }}
                    >
                      Registered Email Address <span className="required-star">*</span>
                    </label>

                    <div className="row g-2">

                      <div className="col">

                        <div className="position-relative">

                          <i
                            className="bi bi-envelope position-absolute"
                            style={{
                              left: '14px',
                              top: '50%',
                              transform:
                                'translateY(-50%)',
                              color: '#8B5CF6',
                              zIndex: 2
                            }}
                          />

                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value)
                              setOtpSent(false)
                              setOtp('')
                              setError('')
                              setSuccess('')
                            }}
                            required
                            style={inputStyle}
                          />

                        </div>

                      </div>

                      <div className="col-auto">

                        <button
                          type="button"
                          className="btn text-white h-100"
                          onClick={handleSendOTP}
                          disabled={
                            sendingOTP ||
                            resendCooldown > 0
                          }
                          style={{
                            background:
                              'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                            border: 'none',
                            borderRadius: '11px',
                            padding: '0 16px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {sendingOTP ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Sending...
                            </>
                          ) : otpSent ? (
                            <>
                              <i className="bi bi-check-lg me-1"></i>
                              Sent
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-1"></i>
                              Send OTP
                            </>
                          )}
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* Verification section */}
                  {otpSent && (
                    <div>

                      <div
                        className="d-flex align-items-center gap-2 mb-3 px-3 py-2"
                        style={{
                          background: '#F5F3FF',
                          border: '1px solid #E9D5FF',
                          borderRadius: '10px',
                          color: '#6D28D9',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        <i className="bi bi-patch-check-fill"></i>
                        Verification code sent to your email
                      </div>

                      {/* OTP */}
                      <div className="mb-3">

                        <label
                          className="form-label fw-semibold mb-2"
                          style={{
                            color: '#302A3B',
                            fontSize: '0.84rem'
                          }}
                        >
                          Email OTP <span className="required-star">*</span>
                        </label>

                        <div className="position-relative">

                          <i
                            className="bi bi-key position-absolute"
                            style={{
                              left: '14px',
                              top: '50%',
                              transform:
                                'translateY(-50%)',
                              color: '#8B5CF6',
                              zIndex: 2
                            }}
                          />

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
                              ...inputStyle,
                              paddingLeft: '42px',
                              letterSpacing: '4px',
                              fontWeight: 700
                            }}
                          />

                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">

                          <span
                            style={{
                              color: '#746E7E',
                              fontSize: '0.76rem'
                            }}
                          >
                            <i className="bi bi-clock me-1"></i>
                            Valid for 10 minutes
                          </span>

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
                                  ? '#9B95A7'
                                  : '#6D28D9',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : 'Resend OTP'}
                          </button>

                        </div>

                      </div>

                      {/* New Password */}
                      <div className="mb-3">

                        <label
                          className="form-label fw-semibold mb-2"
                          style={{
                            color: '#302A3B',
                            fontSize: '0.84rem'
                          }}
                        >
                          New Password <span className="required-star">*</span>
                        </label>

                        <div className="position-relative">

                          <i
                            className="bi bi-lock position-absolute"
                            style={{
                              left: '14px',
                              top: '50%',
                              transform:
                                'translateY(-50%)',
                              color: '#8B5CF6',
                              zIndex: 2
                            }}
                          />

                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Minimum 6 characters"
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(
                                event.target.value
                              )
                            }
                            style={{ ...inputStyle, paddingRight: '42px' }}
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="btn position-absolute border-0 p-0 text-secondary"
                            style={{
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 3
                            }}
                            title={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`bi ${showNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary`}></i>
                          </button>

                        </div>

                      </div>

                      {/* Confirm Password */}
                      <div className="mb-4">

                        <label
                          className="form-label fw-semibold mb-2"
                          style={{
                            color: '#302A3B',
                            fontSize: '0.84rem'
                          }}
                        >
                          Confirm New Password <span className="required-star">*</span>
                        </label>

                        <div className="position-relative">

                          <i
                            className="bi bi-shield-lock position-absolute"
                            style={{
                              left: '14px',
                              top: '50%',
                              transform:
                                'translateY(-50%)',
                              color: '#8B5CF6',
                              zIndex: 2
                            }}
                          />

                          <input
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Re-enter your new password"
                            value={confirmNewPassword}
                            onChange={(event) =>
                              setConfirmNewPassword(
                                event.target.value
                              )
                            }
                            style={{ ...inputStyle, paddingRight: '42px' }}
                          />

                          <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="btn position-absolute border-0 p-0 text-secondary"
                            style={{
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 3
                            }}
                            title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`bi ${showConfirmNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary`}></i>
                          </button>

                        </div>

                      </div>

                      {/* Reset button */}
                      <button
                        type="submit"
                        className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2"
                        disabled={resettingPassword}
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
                        {resettingPassword ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            ></span>

                            Resetting Password...
                          </>
                        ) : (
                          <>
                            Reset Password
                            <i className="bi bi-arrow-right"></i>
                          </>
                        )}
                      </button>

                    </div>
                  )}

                </form>

                {/* Back to Login */}
                <div
                  className="text-center mt-4 pt-4"
                  style={{
                    borderTop: '1px solid #F0ECF7'
                  }}
                >
                  <Link
                    to="/login"
                    style={{
                      color: '#6D28D9',
                      fontWeight: 700,
                      textDecoration: 'none',
                      fontSize: '0.84rem'
                    }}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Login
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

export default ForgotPassword