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

        setBatchOverview(batchData.batches)

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

  return (
    <div
      className="container py-4 py-md-5"
      style={{
        minHeight: 'calc(100vh - 70px)'
      }}
    >

      {/* Header */}
      <div className="mb-4">

        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

          <div>
            <h1
              className="fw-bold mb-2"
              style={{
                color: '#18181B'
              }}
            >
              Hi, {user?.profile?.instituteName}
            </h1>

            <p
              className="mb-0"
              style={{
                color: '#71717A'
              }}
            >
              Manage your institution's learning ecosystem.
            </p>
          </div>

          <Link
            to={`/institutions/${user._id}`}
            className="btn text-decoration-none flex-shrink-0"
            style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              border: '1px solid #E9D5FF',
              borderRadius: '10px',
              padding: '8px 14px',
              fontWeight: '500'
            }}
          >
            View Public Profile
          </Link>

        </div>

      </div>

      {/* Overview */}
      <div className="mb-4">

        <h5
          className="fw-bold mb-3"
          style={{
            color: '#18181B'
          }}
        >
          Institute Overview
        </h5>

        {loading && (
          <div className="text-secondary">
            Loading overview...
          </div>
        )}

        {error && (
          <div
            className="px-3 py-2"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              borderRadius: '10px'
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && overview && (
          <div className="row g-3">

            {/* Batches */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="small mb-2"
                    style={{
                      color: '#71717A'
                    }}
                  >
                    Batches
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '28px',
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
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="small mb-2"
                    style={{
                      color: '#71717A'
                    }}
                  >
                    Teachers
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '28px',
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
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="small mb-2"
                    style={{
                      color: '#71717A'
                    }}
                  >
                    Learners
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '28px',
                      color: '#18181B'
                    }}
                  >
                    {overview.learners}
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="small mb-2"
                    style={{
                      color: '#71717A'
                    }}
                  >
                    Pending Teacher Requests
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '28px',
                      color: '#18181B'
                    }}
                  >
                    {overview.pendingTeacherRequests}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Batch Overview */}
      <div className="mb-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5
            className="fw-bold mb-0"
            style={{
              color: '#18181B'
            }}
          >
            Batch Overview
          </h5>

          <Link
            to="/institute/batches"
            className="small text-decoration-none"
            style={{
              color: '#7C3AED',
              fontWeight: '500'
            }}
          >
            Manage Batches
          </Link>
        </div>

        {batchOverview.length === 0 ? (
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: '16px'
            }}
          >
            <div className="card-body p-4 text-center">

              <div
                className="fw-semibold mb-1"
                style={{
                  color: '#18181B'
                }}
              >
                No batches yet
              </div>

              <div
                className="small"
                style={{
                  color: '#71717A'
                }}
              >
                Create a batch to start organizing teachers
                and learners.
              </div>

            </div>
          </div>
        ) : (
          <div className="row g-3">

            {batchOverview.map(batch => (
              <div
                className="col-12 col-md-6"
                key={batch.batchId}
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: '16px'
                  }}
                >

                  <div className="card-body p-4">

                    <div className="mb-3">

                      <h6
                        className="fw-bold mb-1"
                        style={{
                          color: '#18181B'
                        }}
                      >
                        {batch.name}
                      </h6>

                      {(batch.department ||
                        batch.academicYear) && (
                          <div
                            className="small"
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

                    <div className="row g-2">

                      <div className="col-6">
                        <div
                          className="p-3"
                          style={{
                            background: '#F5F3FF',
                            borderRadius: '12px'
                          }}
                        >
                          <div
                            className="small"
                            style={{
                              color: '#71717A'
                            }}
                          >
                            Teachers
                          </div>

                          <div
                            className="fw-bold"
                            style={{
                              color: '#18181B',
                              fontSize: '22px'
                            }}
                          >
                            {batch.teachers}
                          </div>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="p-3"
                          style={{
                            background: '#F5F3FF',
                            borderRadius: '12px'
                          }}
                        >
                          <div
                            className="small"
                            style={{
                              color: '#71717A'
                            }}
                          >
                            Learners
                          </div>

                          <div
                            className="fw-bold"
                            style={{
                              color: '#18181B',
                              fontSize: '22px'
                            }}
                          >
                            {batch.learners}
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

      </div>

      {/* Existing Management */}
      <TeacherRequests />

      <BatchManagement />

    </div>
  )
}

export default Institute
