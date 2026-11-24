import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import TeacherRequests from '../../components/TeacherRequests/TeacherRequests'
import InteractiveNoticeBoard from '../../components/InteractiveNoticeBoard/InteractiveNoticeBoard'

function Institute() {
  const {
    token,
    user
  } = useAuth()

  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noticeAction, setNoticeAction] = useState(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/membership/institute/overview`,
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
            'Failed to load institute overview'
          )
        }

        setOverview(data.overview)
      } catch (error) {
        console.error(
          'Institute overview error:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOverview()
    }
  }, [token])

  const instituteName =
    user?.profile?.instituteName || 'Your Institute'
  const username = user?.username || ''

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: '#FAF9FC'
      }}
    >
      <div className="container-fluid px-0">

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div
            className="d-flex align-items-start gap-2 mb-4 px-3 py-3"
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              borderRadius: '12px',
              fontSize: '14px'
            }}
          >
            <i className="bi bi-exclamation-circle mt-1" />

            <div>
              <div className="fw-semibold mb-1">
                Unable to load institute data
              </div>

              <div>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            OVERVIEW
        ===================================================== */}
        <section className="mb-5">

          <div className="d-flex justify-content-between align-items-end mb-3">

            <div>
              <h5
                className="fw-bold mb-1"
                style={{
                  color: '#18181B'
                }}
              >
                Overview
              </h5>

              <p
                className="mb-0"
                style={{
                  color: '#71717A',
                  fontSize: '13px'
                }}
              >
                A quick look at your institution.
              </p>
            </div>

          </div>

          {loading ? (
            <div className="row g-3">

              {[1, 2, 3, 4].map(item => (
                <div
                  className="col-12 col-sm-6 col-lg-3"
                  key={item}
                >
                  <div
                    className="card border-0 h-100"
                    style={{
                      borderRadius: '14px',
                      border: '1px solid #E4E4E7',
                      boxShadow: 'none'
                    }}
                  >
                    <div className="card-body p-3">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: '#F4F4F5',
                          marginBottom: '14px'
                        }}
                      />

                      <div
                        style={{
                          width: '80px',
                          height: '10px',
                          borderRadius: '5px',
                          background: '#F4F4F5',
                          marginBottom: '10px'
                        }}
                      />

                      <div
                        style={{
                          width: '50px',
                          height: '24px',
                          borderRadius: '5px',
                          background: '#F4F4F5'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            </div>
          ) : overview ? (

            <div className="row g-3">

              {/* Batches */}
              <div className="col-12 col-sm-6 col-lg-3">
                <Link
                  to="/institute/batches"
                  className="card border-0 h-100 text-decoration-none text-reset stat-btn-card"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'block'
                  }}
                >
                  <div className="card-body p-3">

                    <div className="d-flex align-items-center justify-content-between mb-3">
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
                        <i className="bi bi-collection" />
                      </div>

                      <span
                        className="small d-flex align-items-center gap-1 text-muted stat-action-link"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        View Batches <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                      </span>
                    </div>

                    <div
                      className="small mb-1"
                      style={{
                        color: '#71717A'
                      }}
                    >
                      Batches
                    </div>

                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '26px',
                        lineHeight: '1.2',
                        color: '#18181B'
                      }}
                    >
                      {overview.batches}
                    </div>

                  </div>
                </Link>
              </div>

              {/* Teachers */}
              <div className="col-12 col-sm-6 col-lg-3">
                <Link
                  to="/institute/teachers"
                  className="card border-0 h-100 text-decoration-none text-reset stat-btn-card"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'block'
                  }}
                >
                  <div className="card-body p-3">

                    <div className="d-flex align-items-center justify-content-between mb-3">
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
                        <i className="bi bi-person-video3" />
                      </div>

                      <span
                        className="small d-flex align-items-center gap-1 text-muted stat-action-link"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        View Teachers <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                      </span>
                    </div>

                    <div
                      className="small mb-1"
                      style={{
                        color: '#71717A'
                      }}
                    >
                      Teachers
                    </div>

                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '26px',
                        lineHeight: '1.2',
                        color: '#18181B'
                      }}
                    >
                      {overview.teachers}
                    </div>

                  </div>
                </Link>
              </div>

              {/* Learners */}
              <div className="col-12 col-sm-6 col-lg-3">
                <Link
                  to="/institute/students"
                  className="card border-0 h-100 text-decoration-none text-reset stat-btn-card"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'block'
                  }}
                >
                  <div className="card-body p-3">

                    <div className="d-flex align-items-center justify-content-between mb-3">
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
                        <i className="bi bi-people" />
                      </div>

                      <span
                        className="small d-flex align-items-center gap-1 text-muted stat-action-link"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        View Learners <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                      </span>
                    </div>

                    <div
                      className="small mb-1"
                      style={{
                        color: '#71717A'
                      }}
                    >
                      Learners
                    </div>

                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '26px',
                        lineHeight: '1.2',
                        color: '#18181B'
                      }}
                    >
                      {overview.learners}
                    </div>

                  </div>
                </Link>
              </div>

              {/* Requests */}
              <div className="col-12 col-sm-6 col-lg-3">
                <a
                  href="#teacher-requests-section"
                  className="card border-0 h-100 text-decoration-none text-reset stat-btn-card"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'block'
                  }}
                >
                  <div className="card-body p-3">

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: '#FFF7ED',
                          color: '#EA580C'
                        }}
                      >
                        <i className="bi bi-person-plus" />
                      </div>

                      <span
                        className="small d-flex align-items-center gap-1 text-muted stat-action-link"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        Review <i className="bi bi-arrow-down-short" style={{ fontSize: '13px' }}></i>
                      </span>
                    </div>

                    <div
                      className="small mb-1"
                      style={{
                        color: '#71717A'
                      }}
                    >
                      Pending Requests
                    </div>

                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '26px',
                        lineHeight: '1.2',
                        color: '#18181B'
                      }}
                    >
                      {overview.pendingTeacherRequests}
                    </div>

                  </div>
                </a>
              </div>

            </div>

          ) : null}

        </section>

        {/* =====================================================
            MANAGEMENT & NOTICE BOARD (Side by Side)
        ===================================================== */}
        <section id="teacher-requests-section" className="mb-4">
          <div className="row g-4 align-items-start">
            {/* Left: Teachers Requests & Invitations */}
            <div className="col-12 col-xl-6">
              <div className="mb-3">
                <h5
                  className="fw-bold mb-1"
                  style={{
                    color: '#18181B'
                  }}
                >
                  Teachers Requests & Invitations
                </h5>
                <p
                  className="mb-0"
                  style={{
                    color: '#71717A',
                    fontSize: '13px'
                  }}
                >
                  Review and manage educators requesting to join batches.
                </p>
              </div>
              <TeacherRequests />
            </div>

            {/* Right: Campus Announcement */}
            <div className="col-12 col-xl-6">
              <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <h5
                    className="fw-bold mb-1"
                    style={{
                      color: '#18181B'
                    }}
                  >
                    Campus Announcement
                  </h5>
                  <p
                    className="mb-0"
                    style={{
                      color: '#71717A',
                      fontSize: '13px'
                    }}
                  >
                    Broadcast notifications and essential updates campus-wide.
                  </p>
                </div>
                {noticeAction && (
                  <div className="flex-shrink-0">
                    {noticeAction}
                  </div>
                )}
              </div>
              <InteractiveNoticeBoard
                institutionId={user?.userId || user?._id}
                renderAction={setNoticeAction}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Institute