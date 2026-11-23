import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import GlobalSearchBar from '../../components/GlobalSearchBar/GlobalSearchBar'

export default function UserPublicProfile() {
  const { username, userId } = useParams()
  const userIdentifier = username || userId
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const [targetUser, setTargetUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`http://localhost:5000/api/auth/public/user/${userIdentifier}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load user profile')
        }

        // If this user is an institute, redirect to public institute page
        if (data.user?.accountType === 'institute') {
          navigate(`/institute/${data.user.username || data.user._id || userIdentifier}`, { replace: true })
          return
        }

        // Learners do not have a public profile
        if (data.user?.accountType === 'learner') {
          throw new Error('Public profile is not available for learner accounts')
        }

        setTargetUser(data.user)
        setProfile(data.profile)
        setMemberships(data.memberships || [])
      } catch (err) {
        console.error('Fetch public profile error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userIdentifier) {
      fetchUserProfile()
    }
  }, [userIdentifier, navigate])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-secondary small">Loading profile details...</p>
      </div>
    )
  }

  if (error || !targetUser) {
    return (
      <div className="container py-5">
        <div className="card-clean p-5 text-center bg-white border border-danger mx-auto" style={{ maxWidth: '520px' }}>
          <i className="bi bi-person-x fs-1 text-danger mb-2" />
          <h5 className="fw-bold text-dark">Profile Not Found</h5>
          <p className="text-muted small mb-3">{error || 'This user does not exist or has been removed.'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-primary rounded-pill px-4">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isTeacher = targetUser.accountType === 'teacher'
  const displayName = profile?.fullName || targetUser.username || 'EduAdapt Member'

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.045), transparent 28%), #fafafa',
        color: '#18181b'
      }}
    >
      <div className="container-fluid px-3 px-md-4 py-4 py-md-5" style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Top Navigation & Profile Search */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-pill px-3 py-2 text-decoration-none d-inline-flex align-items-center gap-2 text-secondary shadow-xs bg-white"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else if (currentUser?.accountType) {
                navigate(`/${currentUser.accountType}`)
              } else {
                navigate('/')
              }
            }}
          >
            <i className="bi bi-arrow-left" />
            <span className="fw-semibold">Back to Dashboard</span>
          </button>

          <div className="flex-grow-1 d-flex justify-content-end" style={{ maxWidth: '520px' }}>
            <GlobalSearchBar />
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="card-clean p-4 p-md-5 bg-white border shadow-sm mb-4 position-relative overflow-hidden rounded-4">
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '260px',
              height: '260px',
              background: isTeacher
                ? 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 position-relative">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-md flex-shrink-0"
              style={{
                width: '90px',
                height: '90px',
                fontSize: '32px',
                background: isTeacher ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="text-center text-sm-start flex-grow-1">
              <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 mb-1 flex-wrap">
                <h3 className="fw-bold text-dark mb-0">{displayName}</h3>
                <span className={`badge rounded-pill ${isTeacher ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`}>
                  {isTeacher ? 'Educator / Faculty' : 'Learner / Student'}
                </span>
              </div>

              {targetUser.username && (
                <div className="text-secondary fw-semibold mb-2" style={{ fontSize: '14px' }}>
                  @{targetUser.username}
                </div>
              )}

              <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-3 text-muted small flex-wrap">
                <span>
                  <i className="bi bi-calendar3 me-1" />
                  Joined {new Date(targetUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span>
                  <i className="bi bi-mortarboard me-1" />
                  {memberships.length} Active {isTeacher ? 'Teaching Affiliation(s)' : 'Enrolled Batch(es)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliated Batches & Programs */}
        <div className="card-clean p-4 bg-white border rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">
              {isTeacher ? 'Active Teaching Spaces & Batches' : 'Enrolled Learning Spaces'}
            </h5>
            <span className="badge-meta badge-meta-purple">{memberships.length} Programs</span>
          </div>

          {memberships.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 opacity-50 d-block mb-2" />
              No public academic batches or campus programs displayed yet.
            </div>
          ) : (
            <div className="row g-3">
              {memberships.map((m) => (
                <div key={m._id} className="col-12 col-md-6">
                  <div className="card h-100 border rounded-4 p-3 bg-light d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-white text-primary border">
                          <i className="bi bi-mortarboard-fill me-1" />
                          {m.batchId?.department || 'Academic Batch'}
                        </span>
                        {m.batchId?.academicYear && (
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            {m.batchId.academicYear}
                          </small>
                        )}
                      </div>

                      <h6 className="fw-bold text-dark mb-1">{m.batchId?.name || 'Classroom Batch'}</h6>
                      <p className="text-secondary small mb-2" style={{ fontSize: '12px' }}>
                        Institution: <strong>{m.institutionId?.username ? `@${m.institutionId.username}` : m.institutionId?.email}</strong>
                      </p>
                    </div>

                    {m.institutionId && (
                      <div className="pt-2 border-top text-end">
                        <Link
                          to={`/institute/${m.institutionId.username || m.institutionId._id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          style={{ fontSize: '11px' }}
                        >
                          View Institution Profile
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
