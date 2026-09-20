import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import TeacherRequests from '../../components/TeacherRequests/TeacherRequests'
import BatchManagement from '../../components/BatchManagement/BatchManagement'

function Institute() {
  const {
    token,
    user
  } = useAuth()

  const [overview, setOverview] = useState(null)
  const [batchOverview, setBatchOverview] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/membership/institute/overview',
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

        const batchResponse = await fetch(
          'http://localhost:5000/api/membership/institute/batch-overview',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const batchData = await batchResponse.json()

        if (!batchResponse.ok) {
          throw new Error(
            batchData.message ||
            'Failed to load batch overview'
          )
        }

        setBatchOverview(batchData.batches || [])

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

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: '#FAF9FC'
      }}
    >
      <div className="container py-4 py-md-5">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-4">

          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">

            <div className="d-flex align-items-center gap-3">

              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#F5F3FF',
                  border: '1px solid #E9D5FF',
                  color: '#7C3AED'
                }}
              >
                <i
                  className="bi bi-building"
                  style={{
                    fontSize: '22px'
                  }}
                />
              </div>

              <div>
                <div
                  className="small mb-1"
                  style={{
                    color: '#8B5CF6',
                    fontWeight: '600'
                  }}
                >
                  INSTITUTE WORKSPACE
                </div>

                <h1
                  className="fw-bold mb-1"
                  style={{
                    color: '#18181B',
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    letterSpacing: '-0.5px'
                  }}
                >
                  {instituteName}
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: '#71717A',
                    fontSize: '14px'
                  }}
                >
                  Manage your learning ecosystem from one place.
                </p>
              </div>

            </div>

            <Link
              to={`/institutions/${user?._id}`}
              className="btn text-decoration-none d-flex align-items-center gap-2 flex-shrink-0"
              style={{
                background: '#7C3AED',
                color: '#FFFFFF',
                border: '1px solid #7C3AED',
                borderRadius: '10px',
                padding: '9px 15px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              <i className="bi bi-eye" />
              View Public Profile
            </Link>

          </div>

        </div>

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
                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                  }}
                >
                  <div className="card-body p-3">

                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
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
                </div>
              </div>

              {/* Teachers */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                  }}
                >
                  <div className="card-body p-3">

                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
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
                </div>
              </div>

              {/* Learners */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                  }}
                >
                  <div className="card-body p-3">

                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
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
                </div>
              </div>

              {/* Requests */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                  }}
                >
                  <div className="card-body p-3">

                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
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
                </div>
              </div>

            </div>

          ) : null}

        </section>

        {/* =====================================================
            BATCH OVERVIEW
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
                Learning Spaces
              </h5>

              <p
                className="mb-0"
                style={{
                  color: '#71717A',
                  fontSize: '13px'
                }}
              >
                Monitor teachers and learners across your batches.
              </p>
            </div>

            <Link
              to="/institute/batches"
              className="text-decoration-none d-flex align-items-center gap-1"
              style={{
                color: '#7C3AED',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Manage Batches
              <i className="bi bi-arrow-right" />
            </Link>

          </div>

          {loading ? (
            <div
              className="card border-0"
              style={{
                borderRadius: '14px',
                border: '1px solid #E4E4E7'
              }}
            >
              <div className="card-body p-4 text-center">
                <div
                  className="spinner-border spinner-border-sm"
                  style={{
                    color: '#7C3AED'
                  }}
                  role="status"
                />

                <div
                  className="small mt-2"
                  style={{
                    color: '#71717A'
                  }}
                >
                  Loading batches...
                </div>
              </div>
            </div>
          ) : batchOverview.length === 0 ? (

            <div
              className="card border-0"
              style={{
                borderRadius: '14px',
                border: '1px solid #E4E4E7',
                boxShadow: '0 2px 8px rgba(24, 24, 27, 0.03)'
              }}
            >
              <div className="card-body p-4 text-center">

                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#F5F3FF',
                    color: '#7C3AED'
                  }}
                >
                  <i
                    className="bi bi-collection"
                    style={{
                      fontSize: '20px'
                    }}
                  />
                </div>

                <div
                  className="fw-semibold mb-1"
                  style={{
                    color: '#18181B'
                  }}
                >
                  No learning spaces yet
                </div>

                <div
                  className="small mb-3"
                  style={{
                    color: '#71717A'
                  }}
                >
                  Create a batch to organize teachers and learners.
                </div>

                <Link
                  to="/institute/batches"
                  className="btn text-decoration-none"
                  style={{
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    borderRadius: '9px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <i className="bi bi-plus-lg me-1" />
                  Create Batch
                </Link>

              </div>
            </div>

          ) : (

            <div className="row g-3">

              {batchOverview.map(batch => (
                <div
                  className="col-12 col-md-6 col-xl-4"
                  key={batch.batchId}
                >
                  <div
                    className="card border-0 h-100"
                    style={{
                      borderRadius: '14px',
                      border: '1px solid #E4E4E7',
                      boxShadow: '0 2px 8px rgba(24, 24, 27, 0.04)'
                    }}
                  >

                    <div className="card-body p-3">

                      {/* Batch Header */}
                      <div className="d-flex align-items-start gap-3 mb-4">

                        <div
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#F5F3FF',
                            color: '#7C3AED'
                          }}
                        >
                          <i className="bi bi-mortarboard" />
                        </div>

                        <div
                          className="min-w-0"
                          style={{
                            minWidth: 0
                          }}
                        >
                          <h6
                            className="fw-bold mb-1 text-truncate"
                            style={{
                              color: '#18181B'
                            }}
                          >
                            {batch.name}
                          </h6>

                          {(batch.department ||
                            batch.academicYear) && (
                            <div
                              className="small text-truncate"
                              style={{
                                color: '#71717A'
                              }}
                            >
                              {batch.department}

                              {batch.department &&
                                batch.academicYear &&
                                ' • '}

                              {batch.academicYear}
                            </div>
                          )}

                        </div>

                      </div>

                      {/* Batch Stats */}
                      <div className="row g-2">

                        <div className="col-6">
                          <div
                            className="d-flex align-items-center gap-2 p-2"
                            style={{
                              background: '#FAFAFA',
                              border: '1px solid #F0F0F2',
                              borderRadius: '10px'
                            }}
                          >

                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: '#F5F3FF',
                                color: '#7C3AED'
                              }}
                            >
                              <i
                                className="bi bi-person-video3"
                                style={{
                                  fontSize: '13px'
                                }}
                              />
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: '18px',
                                  lineHeight: '1',
                                  fontWeight: '700',
                                  color: '#18181B'
                                }}
                              >
                                {batch.teachers}
                              </div>

                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#71717A',
                                  marginTop: '4px'
                                }}
                              >
                                Teachers
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="d-flex align-items-center gap-2 p-2"
                            style={{
                              background: '#FAFAFA',
                              border: '1px solid #F0F0F2',
                              borderRadius: '10px'
                            }}
                          >

                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: '#F5F3FF',
                                color: '#7C3AED'
                              }}
                            >
                              <i
                                className="bi bi-people"
                                style={{
                                  fontSize: '13px'
                                }}
                              />
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: '18px',
                                  lineHeight: '1',
                                  fontWeight: '700',
                                  color: '#18181B'
                                }}
                              >
                                {batch.learners}
                              </div>

                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#71717A',
                                  marginTop: '4px'
                                }}
                              >
                                Learners
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              ))}

            </div>

          )}

        </section>

        {/* =====================================================
            MANAGEMENT
        ===================================================== */}
        <section className="mb-4">

          <div className="mb-4">
            <h5
              className="fw-bold mb-1"
              style={{
                color: '#18181B'
              }}
            >
              Institute Management
            </h5>

            <p
              className="mb-0"
              style={{
                color: '#71717A',
                fontSize: '13px'
              }}
            >
              Manage your institution's teachers, requests and batches.
            </p>
          </div>

          <TeacherRequests />

          <div className="mt-4">
            <BatchManagement />
          </div>

        </section>

      </div>
    </div>
  )
}

export default Institute