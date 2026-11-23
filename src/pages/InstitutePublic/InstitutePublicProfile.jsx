import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import GlobalSearchBar from '../../components/GlobalSearchBar/GlobalSearchBar'

function InstitutePublicProfile() {
  const { username, instituteId } = useParams()
  const instituteIdentifier = username || instituteId
  const { user } = useAuth()
  const navigate = useNavigate()

  const [institute, setInstitute] = useState(null)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/membership/public/institute/${instituteIdentifier}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load institute'
          )
        }

        setInstitute(data.institute)

        const batchResponse = await fetch(
          `http://localhost:5000/api/membership/public/institute/${instituteIdentifier}/batches`
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
  }, [instituteIdentifier])

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return (
      <div className="container py-5">
        <div className="edu-profile-loading">
          <div className="edu-spinner" />
          <p>Loading institute profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="edu-error">
          <div className="edu-error-icon">
            <i className="bi bi-exclamation-circle" />
          </div>

          <div>
            <h6 className="mb-1">
              Unable to load profile
            </h6>

            <p className="mb-0">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!institute) {
    return (
      <div className="container py-5">
        <div className="edu-error">
          <div className="edu-error-icon">
            <i className="bi bi-building-x" />
          </div>

          <div>
            <h6 className="mb-1">
              Institute not found
            </h6>

            <p className="mb-0">
              This institute profile could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isOwner =
    user &&
    user.accountType === 'institute' &&
    user._id === institute.id

  return (
    <>
      <style>
        {`
          .edu-profile-page {
            --edu-primary: #7c3aed;
            --edu-primary-dark: #6d28d9;
            --edu-primary-soft: #f5f3ff;
            --edu-primary-border: #e9d5ff;
            --edu-text: #18181b;
            --edu-muted: #71717a;
            --edu-border: #e4e4e7;
            --edu-surface: #ffffff;
            --edu-background: #fafafa;
          }

          .edu-profile-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 80% 0%,
                rgba(124, 58, 237, 0.045),
                transparent 28%
              ),
              var(--edu-background);
            color: var(--edu-text);
          }

          .edu-profile-container {
            max-width: 1160px;
            margin: 0 auto;
          }

          /* ================= COVER ================= */

          .edu-cover {
            position: relative;
            height: 290px;
            overflow: hidden;
            border-radius: 24px;
            background:
              linear-gradient(
                120deg,
                #4c1d95 0%,
                #6d28d9 45%,
                #8b5cf6 100%
              );
          }

          .edu-cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .edu-cover-overlay {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(
                to bottom,
                rgba(24, 24, 27, 0.04) 0%,
                rgba(24, 24, 27, 0.10) 45%,
                rgba(24, 24, 27, 0.48) 100%
              );
          }

          .edu-cover-pattern {
            position: absolute;
            width: 360px;
            height: 360px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.10);
            right: -120px;
            top: -160px;
          }

          .edu-cover-pattern-two {
            position: absolute;
            width: 230px;
            height: 230px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.08);
            right: 100px;
            bottom: -160px;
          }

          .edu-cover-content {
            position: absolute;
            left: 32px;
            bottom: 28px;
            z-index: 2;
            color: white;
          }

          .edu-cover-label {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 12px;
            border-radius: 999px;
            background: rgba(255,255,255,0.14);
            border: 1px solid rgba(255,255,255,0.16);
            backdrop-filter: blur(12px);
            font-size: 12px;
            font-weight: 500;
          }

          /* ================= PROFILE HEADER ================= */

          .edu-profile-header {
            position: relative;
            margin-top: -52px;
            z-index: 5;
            padding: 22px;
            background: var(--edu-surface);
            border: 1px solid var(--edu-border);
            border-radius: 22px;
            box-shadow:
              0 10px 30px rgba(24, 24, 27, 0.07);
          }

          .edu-profile-main {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
          }

          .edu-profile-identity {
            display: flex;
            align-items: center;
            gap: 18px;
            min-width: 0;
          }

          .edu-profile-avatar {
            width: 94px;
            height: 94px;
            min-width: 94px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: var(--edu-primary-soft);
            border: 4px solid white;
            border-radius: 20px;
            box-shadow:
              0 5px 20px rgba(24, 24, 27, 0.12);
          }

          .edu-profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .edu-profile-avatar i {
            font-size: 34px;
            color: var(--edu-primary);
          }

          .edu-profile-name {
            margin: 0;
            font-size: 25px;
            line-height: 1.2;
            font-weight: 650;
            letter-spacing: -0.6px;
          }

          .edu-profile-type {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 7px;
            padding: 5px 9px;
            border-radius: 7px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary-dark);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }

          .edu-profile-location {
            margin-top: 7px;
            color: var(--edu-muted);
            font-size: 13px;
          }

          .edu-edit-button {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 10px 15px;
            border-radius: 10px;
            background: var(--edu-primary);
            color: white;
            border: none;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            transition: 0.2s ease;
          }

          .edu-edit-button:hover {
            background: var(--edu-primary-dark);
            color: white;
            transform: translateY(-1px);
          }

          /* ================= STATS ================= */

          .edu-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-top: 16px;
          }

          .edu-stat {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 18px;
            background: white;
            border: 1px solid var(--edu-border);
            border-radius: 16px;
          }

          .edu-stat-icon {
            width: 42px;
            height: 42px;
            min-width: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary);
            font-size: 18px;
          }

          .edu-stat-value {
            font-size: 21px;
            line-height: 1;
            font-weight: 650;
            letter-spacing: -0.3px;
          }

          .edu-stat-label {
            margin-top: 5px;
            color: var(--edu-muted);
            font-size: 12px;
          }

          /* ================= CONTENT ================= */

          .edu-content {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 340px;
            gap: 18px;
            margin-top: 18px;
          }

          .edu-section {
            background: white;
            border: 1px solid var(--edu-border);
            border-radius: 18px;
            padding: 22px;
          }

          .edu-section + .edu-section {
            margin-top: 18px;
          }

          .edu-section-heading {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 17px;
          }

          .edu-section-heading-icon {
            width: 35px;
            height: 35px;
            min-width: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary);
            font-size: 15px;
          }

          .edu-section-title {
            margin: 0;
            font-size: 15px;
            font-weight: 650;
          }

          .edu-section-description {
            color: var(--edu-muted);
            font-size: 12px;
            margin-top: 2px;
          }

          .edu-about {
            color: #52525b;
            font-size: 14px;
            line-height: 1.8;
            margin: 0;
          }

          /* ================= PROGRAMS ================= */

          .edu-programs-heading {
            margin-bottom: 13px;
          }

          .edu-program-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .edu-program {
            padding: 17px;
            border: 1px solid var(--edu-border);
            border-radius: 15px;
            background: #fff;
            transition: 0.2s ease;
          }

          .edu-program:hover {
            border-color: #d8b4fe;
            box-shadow:
              0 6px 20px rgba(124, 58, 237, 0.07);
            transform: translateY(-2px);
          }

          .edu-program-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
          }

          .edu-program-icon {
            width: 39px;
            height: 39px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary);
            font-size: 17px;
          }

          .edu-program-year {
            padding: 5px 8px;
            border-radius: 7px;
            background: #fafafa;
            border: 1px solid #eeeeef;
            color: var(--edu-muted);
            font-size: 10px;
            white-space: nowrap;
          }

          .edu-program-name {
            margin: 14px 0 6px;
            font-size: 14px;
            font-weight: 600;
          }

          .edu-program-meta {
            color: var(--edu-muted);
            font-size: 11px;
            margin-bottom: 7px;
          }

          .edu-program-description {
            color: var(--edu-muted);
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
          }

          /* ================= INFO ================= */

          .edu-info-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .edu-info-item {
            display: flex;
            gap: 11px;
          }

          .edu-info-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary);
            font-size: 14px;
          }

          .edu-info-label {
            color: var(--edu-muted);
            font-size: 11px;
            margin-bottom: 2px;
          }

          .edu-info-value {
            color: #27272a;
            font-size: 12px;
            line-height: 1.5;
            word-break: break-word;
          }

          .edu-info-link {
            color: var(--edu-primary);
            text-decoration: none;
            font-weight: 500;
          }

          .edu-info-link:hover {
            color: var(--edu-primary-dark);
          }

          /* ================= SOCIAL ================= */

          .edu-social-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
          }

          .edu-social {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 11px;
            border-radius: 9px;
            background: #fafafa;
            border: 1px solid #e4e4e7;
            color: #52525b;
            text-decoration: none;
            font-size: 11px;
            transition: 0.2s ease;
          }

          .edu-social:hover {
            background: var(--edu-primary-soft);
            border-color: var(--edu-primary-border);
            color: var(--edu-primary);
          }

          /* ================= EMPTY ================= */

          .edu-empty {
            padding: 30px 20px;
            text-align: center;
            border: 1px dashed #d8b4fe;
            border-radius: 15px;
            background: #fcfaff;
          }

          .edu-empty-icon {
            width: 44px;
            height: 44px;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: var(--edu-primary-soft);
            color: var(--edu-primary);
            font-size: 19px;
          }

          .edu-empty p {
            color: var(--edu-muted);
            font-size: 12px;
            margin: 0;
          }

          /* ================= LOADING ================= */

          .edu-profile-loading {
            min-height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: var(--edu-muted);
            gap: 12px;
          }

          .edu-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #ede9fe;
            border-top-color: var(--edu-primary);
            border-radius: 50%;
            animation: edu-spin 0.8s linear infinite;
          }

          @keyframes edu-spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* ================= ERROR ================= */

          .edu-error {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 18px;
            border: 1px solid #fecaca;
            background: #fffafa;
            border-radius: 15px;
            color: #7f1d1d;
          }

          .edu-error-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: #fef2f2;
            color: #dc2626;
          }

          .edu-error h6 {
            font-size: 13px;
          }

          .edu-error p {
            color: #991b1b;
            font-size: 12px;
          }

          /* ================= MOBILE ================= */

          @media (max-width: 991px) {
            .edu-content {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 767px) {
            .edu-profile-container {
              padding-left: 12px;
              padding-right: 12px;
            }

            .edu-cover {
              height: 220px;
              border-radius: 18px;
            }

            .edu-cover-content {
              left: 18px;
              bottom: 18px;
            }

            .edu-profile-header {
              margin-top: -35px;
              padding: 16px;
              border-radius: 17px;
            }

            .edu-profile-main {
              align-items: flex-start;
              flex-direction: column;
            }

            .edu-profile-identity {
              width: 100%;
              gap: 13px;
            }

            .edu-profile-avatar {
              width: 76px;
              height: 76px;
              min-width: 76px;
              border-radius: 16px;
            }

            .edu-profile-avatar i {
              font-size: 27px;
            }

            .edu-profile-name {
              font-size: 20px;
            }

            .edu-edit-button {
              width: 100%;
              justify-content: center;
            }

            .edu-stats {
              gap: 8px;
            }

            .edu-stat {
              flex-direction: column;
              text-align: center;
              padding: 13px 7px;
              gap: 8px;
            }

            .edu-stat-icon {
              width: 35px;
              height: 35px;
              min-width: 35px;
              font-size: 15px;
            }

            .edu-stat-value {
              font-size: 18px;
            }

            .edu-stat-label {
              font-size: 10px;
            }

            .edu-content {
              margin-top: 14px;
              gap: 14px;
            }

            .edu-section {
              padding: 17px;
              border-radius: 16px;
            }

            .edu-program-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 420px) {
            .edu-profile-name {
              font-size: 18px;
            }

            .edu-profile-location {
              font-size: 11px;
            }

            .edu-stat {
              padding: 11px 4px;
            }

            .edu-stat-value {
              font-size: 17px;
            }

            .edu-stat-label {
              font-size: 9px;
            }
          }
        `}
      </style>

      <div className="edu-profile-page">
        <div className="edu-profile-container py-3 py-md-4">

          {/* ================= TOP NAVIGATION & SEARCH ================= */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <button
              type="button"
              className="btn btn-sm btn-white border rounded-pill px-3 py-2 text-decoration-none d-inline-flex align-items-center gap-2 text-secondary shadow-xs bg-white"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1)
                } else if (user?.accountType) {
                  navigate(`/${user.accountType}`)
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

          {/* ================= COVER ================= */}

          <div className="edu-cover">

            {institute.coverPhoto?.url ? (
              <img
                src={institute.coverPhoto.url}
                alt=""
                className="edu-cover-image"
              />
            ) : (
              <>
                <div className="edu-cover-pattern" />
                <div className="edu-cover-pattern-two" />
              </>
            )}

            <div className="edu-cover-overlay" />  

          </div>

          {/* ================= PROFILE HEADER ================= */}

          <div className="edu-profile-header">

            <div className="edu-profile-main">

              <div className="edu-profile-identity">

                <div className="edu-profile-avatar">
                  {institute.profilePhoto?.url ? (
                    <img
                      src={institute.profilePhoto.url}
                      alt={institute.name}
                    />
                  ) : (
                    <i className="bi bi-building" />
                  )}
                </div>

                <div className="min-w-0">

                  <h1 className="edu-profile-name">
                    {institute.name}
                  </h1>

                  <div className="edu-profile-type">
                    <i className="bi bi-buildings" />
                    {institute.type}
                  </div>

                  {(institute.location?.city ||
                    institute.location?.state) && (
                    <div className="edu-profile-location">
                      <i className="bi bi-geo-alt me-1" />

                      {[
                        institute.location.city,
                        institute.location.state
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}

                </div>

              </div>

              {isOwner && (
                <Link
                  to="/institute/profile"
                  className="edu-edit-button"
                >
                  <i className="bi bi-pencil-square" />
                  Edit profile
                </Link>
              )}

            </div>

          </div>

          {/* ================= STATS ================= */}

          <div className="edu-stats">

            <div className="edu-stat">
              <div className="edu-stat-icon">
                <i className="bi bi-collection" />
              </div>

              <div>
                <div className="edu-stat-value">
                  {institute.stats?.batches || 0}
                </div>

                <div className="edu-stat-label">
                  Programs & batches
                </div>
              </div>
            </div>

            <div className="edu-stat">
              <div className="edu-stat-icon">
                <i className="bi bi-person-video3" />
              </div>

              <div>
                <div className="edu-stat-value">
                  {institute.stats?.teachers || 0}
                </div>

                <div className="edu-stat-label">
                  Teachers
                </div>
              </div>
            </div>

            <div className="edu-stat">
              <div className="edu-stat-icon">
                <i className="bi bi-people" />
              </div>

              <div>
                <div className="edu-stat-value">
                  {institute.stats?.learners || 0}
                </div>

                <div className="edu-stat-label">
                  Learners
                </div>
              </div>
            </div>

          </div>

          {/* ================= CONTENT ================= */}

          <div className="edu-content">

            {/* LEFT COLUMN */}

            <div>

              {/* ABOUT */}

              <section className="edu-section">

                <div className="edu-section-heading">
                  <div className="edu-section-heading-icon">
                    <i className="bi bi-info-lg" />
                  </div>

                  <div>
                    <h2 className="edu-section-title">
                      About
                    </h2>

                    <div className="edu-section-description">
                      About this institution
                    </div>
                  </div>
                </div>

                <p className="edu-about">
                  {institute.about ||
                    'This institute has not added an introduction yet.'}
                </p>

              </section>

              {/* PROGRAMS */}

              <section className="edu-section">

                <div className="edu-programs-heading">

                  <div className="edu-section-heading mb-1">
                    <div className="edu-section-heading-icon">
                      <i className="bi bi-journal-bookmark" />
                    </div>

                    <div>
                      <h2 className="edu-section-title">
                        Programs & batches
                      </h2>

                      <div className="edu-section-description">
                        Learning opportunities offered by this institution
                      </div>
                    </div>
                  </div>

                </div>

                {batches.length === 0 ? (
                  <div className="edu-empty">

                    <div className="edu-empty-icon">
                      <i className="bi bi-journal-x" />
                    </div>

                    <p>
                      No public programs or batches have been added yet.
                    </p>

                  </div>
                ) : (
                  <div className="edu-program-grid">

                    {batches.map(batch => (
                      <div
                        key={batch._id}
                        className="edu-program"
                      >

                        <div className="edu-program-top">

                          <div className="edu-program-icon">
                            <i className="bi bi-book" />
                          </div>

                          {batch.academicYear && (
                            <span className="edu-program-year">
                              {batch.academicYear}
                            </span>
                          )}

                        </div>

                        <h3 className="edu-program-name">
                          {batch.name}
                        </h3>

                        {batch.department && (
                          <div className="edu-program-meta">
                            <i className="bi bi-diagram-3 me-1" />

                            {batch.department}
                          </div>
                        )}

                        {batch.description && (
                          <p className="edu-program-description">
                            {batch.description}
                          </p>
                        )}

                      </div>
                    ))}

                  </div>
                )}

              </section>

            </div>

            {/* RIGHT COLUMN */}

            <aside>

              {/* CONTACT */}

              <section className="edu-section">

                <div className="edu-section-heading">
                  <div className="edu-section-heading-icon">
                    <i className="bi bi-chat-left-text" />
                  </div>

                  <div>
                    <h2 className="edu-section-title">
                      Contact
                    </h2>

                    <div className="edu-section-description">
                      Get in touch with the institution
                    </div>
                  </div>
                </div>

                <div className="edu-info-list">

                  {institute.contact?.email && (
                    <div className="edu-info-item">

                      <div className="edu-info-icon">
                        <i className="bi bi-envelope" />
                      </div>

                      <div>
                        <div className="edu-info-label">
                          Email
                        </div>

                        <div className="edu-info-value">
                          {institute.contact.email}
                        </div>
                      </div>

                    </div>
                  )}

                  {institute.contact?.phone && (
                    <div className="edu-info-item">

                      <div className="edu-info-icon">
                        <i className="bi bi-telephone" />
                      </div>

                      <div>
                        <div className="edu-info-label">
                          Phone
                        </div>

                        <div className="edu-info-value">
                          {institute.contact.phone}
                        </div>
                      </div>

                    </div>
                  )}

                  {institute.website && (
                    <div className="edu-info-item">

                      <div className="edu-info-icon">
                        <i className="bi bi-globe2" />
                      </div>

                      <div>
                        <div className="edu-info-label">
                          Website
                        </div>

                        <a
                          href={institute.website}
                          target="_blank"
                          rel="noreferrer"
                          className="edu-info-value edu-info-link"
                        >
                          Visit website
                          <i className="bi bi-arrow-up-right ms-1" />
                        </a>
                      </div>

                    </div>
                  )}

                  {!institute.contact?.email &&
                    !institute.contact?.phone &&
                    !institute.website && (
                      <div className="text-muted small">
                        No contact information has been added yet.
                      </div>
                    )}

                </div>

              </section>

              {/* LOCATION */}

              {(institute.location?.address ||
                institute.location?.city ||
                institute.location?.state ||
                institute.location?.country) && (
                <section className="edu-section">

                  <div className="edu-section-heading">
                    <div className="edu-section-heading-icon">
                      <i className="bi bi-geo-alt" />
                    </div>

                    <div>
                      <h2 className="edu-section-title">
                        Location
                      </h2>

                      <div className="edu-section-description">
                        Institution location
                      </div>
                    </div>
                  </div>

                  <div className="edu-info-item">

                    <div className="edu-info-icon">
                      <i className="bi bi-pin-map" />
                    </div>

                    <div className="edu-info-value">
                      {[
                        institute.location.address,
                        institute.location.city,
                        institute.location.state,
                        institute.location.country
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>

                  </div>

                </section>
              )}

              {/* SOCIAL */}

              {(institute.socialLinks?.facebook ||
                institute.socialLinks?.instagram ||
                institute.socialLinks?.linkedin ||
                institute.socialLinks?.youtube) && (
                <section className="edu-section">

                  <div className="edu-section-heading">
                    <div className="edu-section-heading-icon">
                      <i className="bi bi-share" />
                    </div>

                    <div>
                      <h2 className="edu-section-title">
                        Connect
                      </h2>

                      <div className="edu-section-description">
                        Follow this institution
                      </div>
                    </div>
                  </div>

                  <div className="edu-social-grid">

                    {institute.socialLinks.facebook && (
                      <a
                        href={institute.socialLinks.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="edu-social"
                      >
                        <i className="bi bi-facebook" />
                        Facebook
                      </a>
                    )}

                    {institute.socialLinks.instagram && (
                      <a
                        href={institute.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="edu-social"
                      >
                        <i className="bi bi-instagram" />
                        Instagram
                      </a>
                    )}

                    {institute.socialLinks.linkedin && (
                      <a
                        href={institute.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="edu-social"
                      >
                        <i className="bi bi-linkedin" />
                        LinkedIn
                      </a>
                    )}

                    {institute.socialLinks.youtube && (
                      <a
                        href={institute.socialLinks.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="edu-social"
                      >
                        <i className="bi bi-youtube" />
                        YouTube
                      </a>
                    )}

                  </div>

                </section>
              )}

            </aside>

          </div>

        </div>
      </div>
    </>
  )
}

export default InstitutePublicProfile

