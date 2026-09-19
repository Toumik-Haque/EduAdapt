import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function InstitutePublicProfile() {
  const { instituteId } = useParams()
  const { user } = useAuth()

  const [institute, setInstitute] = useState(null)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/membership/public/institute/${instituteId}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load institute'
          )
        }

        setInstitute(data.institute)

        const batchResponse = await fetch(
          `http://localhost:5000/api/membership/public/institute/${instituteId}/batches`
        )

        const batchData = await batchResponse.json()

        if (!batchResponse.ok) {
          throw new Error(
            batchData.message || 'Failed to load institute batches'
          )
        }

        setBatches(batchData.batches || [])

      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstitute()
  }, [instituteId])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        Loading institute profile...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    )
  }

  if (!institute) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Institute not found.
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">

      {/* Cover */}
      <div
        className="rounded-4 mb-4"
        style={{
          height: '220px',
          background: institute.coverPhoto?.url
            ? `url(${institute.coverPhoto.url}) center/cover`
            : 'linear-gradient(135deg, #6f42c1, #8e6de8)'
        }}
      />

      {/* Institute Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-end justify-content-between">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center"
              style={{
                width: '90px',
                height: '90px',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {institute.profilePhoto?.url ? (
                <img
                  src={institute.profilePhoto.url}
                  alt={institute.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span className="fs-2 text-secondary">
                  🏫
                </span>
              )}
            </div>

            <div>
              <h2 className="mb-1">
                {institute.name}
              </h2>

              <p className="text-muted mb-0 text-capitalize">
                {institute.type}
              </p>
            </div>

          </div>

          {user &&
            user.accountType === 'institute' &&
            user._id === institute.id && (
              <Link
                to="/institute/profile"
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
                Edit Profile
              </Link>
            )}

        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="mb-1">
                {institute.stats.batches}
              </h3>
              <small className="text-muted">
                Batches
              </small>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="mb-1">
                {institute.stats.teachers}
              </h3>
              <small className="text-muted">
                Teachers
              </small>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="mb-1">
                {institute.stats.learners}
              </h3>
              <small className="text-muted">
                Learners
              </small>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4">

        {/* About */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="mb-3">
                About
              </h5>

              <p className="text-muted mb-0">
                {institute.about ||
                  'This institute has not added an introduction yet.'}
              </p>

            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="mb-3">
                Contact
              </h5>

              {institute.contact.email && (
                <p className="mb-2">
                  <strong>Email:</strong><br />
                  {institute.contact.email}
                </p>
              )}

              {institute.contact.phone && (
                <p className="mb-2">
                  <strong>Phone:</strong><br />
                  {institute.contact.phone}
                </p>
              )}

              {institute.website && (
                <p className="mb-0">
                  <strong>Website:</strong><br />

                  <a
                    href={institute.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit website
                  </a>
                </p>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Programs & Batches */}
      <div className="mt-4">
        <div className="mb-3">
          <h5 className="mb-1">
            Programs & Batches
          </h5>

          <p className="text-muted mb-0">
            Explore the learning programs offered by this institute.
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-0">
                No public programs or batches have been added yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {batches.map(batch => (
              <div
                key={batch._id}
                className="col-md-6"
              >
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">

                    <h6 className="mb-2">
                      {batch.name}
                    </h6>

                    {batch.department && (
                      <p className="mb-1">
                        <strong>
                          Department:
                        </strong>{' '}
                        {batch.department}
                      </p>
                    )}

                    {batch.academicYear && (
                      <p className="text-muted mb-2">
                        Academic Year:{' '}
                        {batch.academicYear}
                      </p>
                    )}

                    {batch.description && (
                      <p className="text-muted mb-0">
                        {batch.description}
                      </p>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      {(institute.location?.address ||
        institute.location?.city ||
        institute.location?.state) && (
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">

              <h5 className="mb-3">
                Location
              </h5>

              <p className="text-muted mb-0">
                {[
                  institute.location.address,
                  institute.location.city,
                  institute.location.state,
                  institute.location.country
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>

            </div>
          </div>
        )}

      {/* Social Links */}
      {(institute.socialLinks?.facebook ||
        institute.socialLinks?.instagram ||
        institute.socialLinks?.linkedin ||
        institute.socialLinks?.youtube) && (
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">

              <h5 className="mb-3">
                Connect With Us
              </h5>

              <div className="d-flex flex-wrap gap-2">

                {institute.socialLinks.facebook && (
                  <a
                    href={institute.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary"
                  >
                    Facebook
                  </a>
                )}

                {institute.socialLinks.instagram && (
                  <a
                    href={institute.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary"
                  >
                    Instagram
                  </a>
                )}

                {institute.socialLinks.linkedin && (
                  <a
                    href={institute.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary"
                  >
                    LinkedIn
                  </a>
                )}

                {institute.socialLinks.youtube && (
                  <a
                    href={institute.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary"
                  >
                    YouTube
                  </a>
                )}

              </div>

            </div>
          </div>
        )}

    </div>
  )
}

export default InstitutePublicProfile