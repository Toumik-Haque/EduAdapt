import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function InstituteProfileEdit() {
  const { token, user } = useAuth()

  const [form, setForm] = useState({
    instituteName: '',
    instituteType: 'college',
    about: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    website: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [profilePhoto, setProfilePhoto] = useState({
    url: '',
    publicId: ''
  })

  const [profilePhotoFile, setProfilePhotoFile] = useState(null)
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false)

  const [coverPhoto, setCoverPhoto] = useState({
    url: '',
    publicId: ''
  })

  const [coverPhotoFile, setCoverPhotoFile] = useState(null)
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false)

  /*
    ============================
    FETCH PROFILE
  ============================
  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/membership/institute/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load profile'
          )
        }

        setForm({
          instituteName: data.profile.instituteName || '',
          instituteType:
            data.profile.instituteType || 'college',
          about: data.profile.about || '',
          phone: data.profile.contact?.phone || '',
          address: data.profile.location?.address || '',
          city: data.profile.location?.city || '',
          state: data.profile.location?.state || '',
          country:
            data.profile.location?.country || 'India',
          website: data.profile.website || '',
          facebook:
            data.profile.socialLinks?.facebook || '',
          instagram:
            data.profile.socialLinks?.instagram || '',
          linkedin:
            data.profile.socialLinks?.linkedin || '',
          youtube:
            data.profile.socialLinks?.youtube || ''
        })

        setProfilePhoto(
          data.profile.profilePhoto || {
            url: '',
            publicId: ''
          }
        )

        setCoverPhoto(
          data.profile.coverPhoto || {
            url: '',
            publicId: ''
          }
        )
      } catch (error) {
        console.error(
          'Failed to load profile:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    }
  }, [token])

  /*
    ============================
    HANDLE CHANGE
  ============================
  */

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  /*
    ============================
    SAVE PROFILE
  ============================
  */

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/membership/institute/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update profile'
        )
      }

      setMessage('Profile updated successfully')

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error(
        'Update profile error:',
        error
      )

      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  /*
    ============================
    PROFILE PHOTO UPLOAD
  ============================
  */

  const handleProfilePhotoUpload = async () => {
    if (!profilePhotoFile) return

    try {
      setUploadingProfilePhoto(true)
      setError('')
      setMessage('')

      const formData = new FormData()

      formData.append(
        'profilePhoto',
        profilePhotoFile
      )

      const response = await fetch(
        'http://localhost:5000/api/membership/institute/profile/photo',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to upload profile photo'
        )
      }

      setProfilePhoto(data.profilePhoto)
      setProfilePhotoFile(null)

      setMessage(
        'Profile photo uploaded successfully'
      )
    } catch (error) {
      console.error(
        'Profile photo upload error:',
        error
      )

      setError(error.message)
    } finally {
      setUploadingProfilePhoto(false)
    }
  }

  /*
    ============================
    COVER PHOTO UPLOAD
  ============================
  */

  const handleCoverPhotoUpload = async () => {
    if (!coverPhotoFile) return

    try {
      setUploadingCoverPhoto(true)
      setError('')
      setMessage('')

      const formData = new FormData()

      formData.append(
        'coverPhoto',
        coverPhotoFile
      )

      const response = await fetch(
        'http://localhost:5000/api/membership/institute/profile/cover',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to upload cover photo'
        )
      }

      setCoverPhoto(data.coverPhoto)
      setCoverPhotoFile(null)

      setMessage(
        'Cover photo uploaded successfully'
      )
    } catch (error) {
      console.error(
        'Cover photo upload error:',
        error
      )

      setError(error.message)
    } finally {
      setUploadingCoverPhoto(false)
    }
  }

  /*
    ============================
    LOADING
  ============================
  */

  if (loading) {
    return (
      <div className="edu-edit-page">
        <div className="edu-edit-loading">
          <div className="edu-spinner" />
          <p>Loading institute profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          .edu-edit-page {
            --edu-primary: #7C3AED;
            --edu-primary-dark: #6D28D9;
            --edu-primary-soft: #F5F3FF;
            --edu-primary-border: #E9D5FF;

            --edu-text: #18181B;
            --edu-secondary: #52525B;
            --edu-muted: #71717A;

            --edu-border: #E4E4E7;
            --edu-background: #FAFAFA;

            min-height: calc(100vh - 70px);
            background:
              radial-gradient(
                circle at 85% 0%,
                rgba(124, 58, 237, 0.055),
                transparent 28%
              ),
              var(--edu-background);

            color: var(--edu-text);
          }

          .edu-edit-container {
            max-width: 1080px;
            margin: 0 auto;
          }

          /* ================= HEADER ================= */

          .edu-edit-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 24px;
          }

          .edu-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            padding: 6px 10px;
            border-radius: 8px;

            background: var(--edu-primary-soft);
            border: 1px solid var(--edu-primary-border);

            color: var(--edu-primary-dark);

            font-size: 11px;
            font-weight: 650;
            letter-spacing: .5px;
          }

          .edu-edit-title {
            margin: 11px 0 5px;

            font-size: 27px;
            line-height: 1.2;
            font-weight: 650;
            letter-spacing: -.7px;
          }

          .edu-edit-description {
            max-width: 620px;
            margin: 0;

            color: var(--edu-muted);
            font-size: 13px;
            line-height: 1.6;
          }

          .edu-preview-link {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            padding: 9px 13px;

            border: 1px solid var(--edu-border);
            border-radius: 10px;

            background: white;
            color: var(--edu-secondary);

            font-size: 12px;
            font-weight: 500;

            text-decoration: none;
            white-space: nowrap;

            transition: .2s ease;
          }

          .edu-preview-link:hover {
            color: var(--edu-primary);
            border-color: var(--edu-primary-border);
            background: var(--edu-primary-soft);
          }

          /* ================= ALERTS ================= */

          .edu-alert {
            display: flex;
            align-items: center;
            gap: 11px;

            padding: 12px 15px;
            margin-bottom: 18px;

            border-radius: 12px;

            font-size: 12px;
          }

          .edu-alert-success {
            color: #166534;
            background: #F0FDF4;
            border: 1px solid #DCFCE7;
          }

          .edu-alert-error {
            color: #991B1B;
            background: #FEF2F2;
            border: 1px solid #FECACA;
          }

          .edu-alert-icon {
            width: 30px;
            height: 30px;
            min-width: 30px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 8px;
          }

          .edu-alert-success .edu-alert-icon {
            background: #DCFCE7;
          }

          .edu-alert-error .edu-alert-icon {
            background: #FEE2E2;
          }

          /* ================= MEDIA EDITOR ================= */

          .edu-media-layout {
            display: grid;
            grid-template-columns: 330px minmax(0, 1fr);
            gap: 14px;
            margin-bottom: 14px;
          }

          .edu-panel {
            background: white;
            border: 1px solid var(--edu-border);
            border-radius: 17px;
          }

          .edu-panel-padding {
            padding: 20px;
          }

          .edu-panel-header {
            margin-bottom: 17px;
          }

          .edu-panel-title {
            margin: 0 0 4px;

            font-size: 14px;
            font-weight: 650;
          }

          .edu-panel-description {
            margin: 0;

            color: var(--edu-muted);
            font-size: 11px;
            line-height: 1.5;
          }

          /* ================= AVATAR ================= */

          .edu-avatar-upload {
            display: flex;
            align-items: center;
            gap: 17px;
          }

          .edu-avatar-preview {
            width: 86px;
            height: 86px;
            min-width: 86px;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: hidden;

            border-radius: 18px;

            background: var(--edu-primary-soft);
            border: 1px solid var(--edu-primary-border);
          }

          .edu-avatar-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .edu-avatar-preview i {
            color: var(--edu-primary);
            font-size: 28px;
          }

          .edu-upload-controls {
            min-width: 0;
            flex: 1;
          }

          .edu-file-input {
            width: 100%;

            padding: 7px 9px;

            border: 1px solid var(--edu-border);
            border-radius: 9px;

            background: #FAFAFA;

            font-size: 10px;
          }

          .edu-upload-button {
            width: 100%;
            margin-top: 7px;

            padding: 8px 11px;

            border: 1px solid var(--edu-primary-border);
            border-radius: 9px;

            background: var(--edu-primary-soft);
            color: var(--edu-primary-dark);

            font-size: 11px;
            font-weight: 550;

            transition: .2s ease;
          }

          .edu-upload-button:hover:not(:disabled) {
            background: #EDE9FE;
          }

          .edu-upload-button:disabled {
            opacity: .55;
            cursor: not-allowed;
          }

          /* ================= COVER ================= */

          .edu-cover-preview {
            position: relative;

            height: 128px;
            overflow: hidden;

            margin-bottom: 11px;

            border-radius: 13px;

            background:
              linear-gradient(
                120deg,
                #4C1D95,
                #7C3AED,
                #A78BFA
              );
          }

          .edu-cover-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .edu-cover-placeholder {
            position: absolute;
            inset: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-direction: column;

            color: white;
          }

          .edu-cover-placeholder i {
            font-size: 25px;
            margin-bottom: 6px;
          }

          .edu-cover-placeholder span {
            font-size: 10px;
            opacity: .8;
          }

          .edu-cover-controls {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 100px;
            gap: 7px;
          }

          /* ================= FORM ================= */

          .edu-form-section {
            margin-top: 14px;
            padding: 21px;

            background: white;

            border: 1px solid var(--edu-border);
            border-radius: 17px;
          }

          .edu-form-section-header {
            display: flex;
            align-items: flex-start;
            gap: 11px;

            margin-bottom: 20px;
          }

          .edu-section-icon {
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

          .edu-form-section-title {
            margin: 0 0 3px;

            font-size: 14px;
            font-weight: 650;
          }

          .edu-form-section-description {
            margin: 0;

            color: var(--edu-muted);
            font-size: 11px;
          }

          .edu-label {
            display: block;

            margin-bottom: 6px;

            color: #3F3F46;

            font-size: 11px;
            font-weight: 600;
          }

          .edu-input,
          .edu-select,
          .edu-textarea {
            display: block;
            width: 100%;

            padding: 9px 11px;

            border: 1px solid #D4D4D8;
            border-radius: 9px;

            background: white;

            color: var(--edu-text);

            font-size: 12px;

            outline: none;

            transition:
              border-color .15s ease,
              box-shadow .15s ease;
          }

          .edu-input::placeholder,
          .edu-textarea::placeholder {
            color: #A1A1AA;
          }

          .edu-input:focus,
          .edu-select:focus,
          .edu-textarea:focus {
            border-color: #A78BFA;

            box-shadow:
              0 0 0 3px rgba(124, 58, 237, .08);
          }

          .edu-textarea {
            min-height: 125px;
            resize: vertical;
            line-height: 1.6;
          }

          .edu-input-group {
            position: relative;
          }

          .edu-input-icon {
            position: absolute;
            left: 11px;
            top: 50%;

            transform: translateY(-50%);

            color: #A1A1AA;
            font-size: 12px;

            pointer-events: none;
          }

          .edu-input-with-icon {
            padding-left: 32px;
          }

          /* ================= SOCIAL ================= */

          .edu-social-input {
            position: relative;
          }

          .edu-social-icon {
            position: absolute;
            left: 11px;
            top: 50%;

            transform: translateY(-50%);

            color: #71717A;

            font-size: 13px;
          }

          .edu-social-input input {
            padding-left: 34px;
          }

          /* ================= SAVE BAR ================= */

          .edu-save-bar {
            position: sticky;
            bottom: 14px;
            z-index: 20;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;

            margin-top: 18px;
            padding: 12px 14px;

            background: rgba(255,255,255,.92);
            border: 1px solid var(--edu-border);
            border-radius: 14px;

            box-shadow:
              0 8px 30px rgba(24,24,27,.10);

            backdrop-filter: blur(14px);
          }

          .edu-save-info {
            display: flex;
            align-items: center;
            gap: 9px;

            color: var(--edu-muted);

            font-size: 11px;
          }

          .edu-save-info i {
            color: var(--edu-primary);
          }

          .edu-save-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;

            min-width: 125px;

            padding: 9px 16px;

            border: none;
            border-radius: 9px;

            background: var(--edu-primary);
            color: white;

            font-size: 12px;
            font-weight: 550;

            transition: .2s ease;
          }

          .edu-save-button:hover:not(:disabled) {
            background: var(--edu-primary-dark);
          }

          .edu-save-button:disabled {
            opacity: .7;
            cursor: not-allowed;
          }

          /* ================= LOADING ================= */

          .edu-edit-loading {
            min-height: 500px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-direction: column;

            color: var(--edu-muted);

            gap: 11px;
          }

          .edu-spinner {
            width: 28px;
            height: 28px;

            border: 3px solid #EDE9FE;
            border-top-color: var(--edu-primary);

            border-radius: 50%;

            animation: edu-spin .8s linear infinite;
          }

          @keyframes edu-spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* ================= RESPONSIVE ================= */

          @media (max-width: 850px) {

            .edu-media-layout {
              grid-template-columns: 1fr;
            }

            .edu-edit-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .edu-preview-link {
              width: 100%;
              justify-content: center;
            }

          }

          @media (max-width: 576px) {

            .edu-edit-container {
              padding-left: 12px;
              padding-right: 12px;
            }

            .edu-edit-title {
              font-size: 23px;
            }

            .edu-form-section {
              padding: 16px;
              border-radius: 15px;
            }

            .edu-panel-padding {
              padding: 16px;
            }

            .edu-avatar-upload {
              align-items: flex-start;
            }

            .edu-avatar-preview {
              width: 72px;
              height: 72px;
              min-width: 72px;
              border-radius: 14px;
            }

            .edu-cover-controls {
              grid-template-columns: 1fr;
            }

            .edu-save-bar {
              bottom: 8px;
            }

            .edu-save-info {
              display: none;
            }

            .edu-save-button {
              width: 100%;
            }

            .edu-save-bar {
              justify-content: stretch;
            }

          }
        `}
      </style>

      <div className="edu-edit-page">

        <div className="edu-edit-container py-3 py-md-4">

          {/* ================= HEADER ================= */}

          <header className="edu-edit-header">

            <div>

              <div className="edu-eyebrow">
                <i className="bi bi-building" />
                INSTITUTE PROFILE
              </div>

              <h1 className="edu-edit-title">
                Edit your institute profile
              </h1>

              <p className="edu-edit-description">
                Manage the information learners and teachers
                see when they discover your institution on
                EduAdapt.
              </p>

            </div>

            <Link
              to={`/institutions/${user._id}`}
              className="edu-preview-link"
            >
              <i className="bi bi-eye" />
              View public profile
              <i className="bi bi-arrow-up-right" />
            </Link>

          </header>

          {/* ================= ALERTS ================= */}

          {message && (
            <div className="edu-alert edu-alert-success">

              <div className="edu-alert-icon">
                <i className="bi bi-check-lg" />
              </div>

              <div>
                {message}
              </div>

            </div>
          )}

          {error && (
            <div className="edu-alert edu-alert-error">

              <div className="edu-alert-icon">
                <i className="bi bi-exclamation-lg" />
              </div>

              <div>
                {error}
              </div>

            </div>
          )}

          {/* ================= MEDIA ================= */}

          <div className="edu-media-layout">

            {/* PROFILE PHOTO */}

            <div className="edu-panel edu-panel-padding">

              <div className="edu-panel-header">

                <h2 className="edu-panel-title">
                  Profile photo
                </h2>

                <p className="edu-panel-description">
                  Your institution's identity image.
                </p>

              </div>

              <div className="edu-avatar-upload">

                <div className="edu-avatar-preview">

                  {profilePhoto.url ? (
                    <img
                      src={profilePhoto.url}
                      alt="Institute profile"
                    />
                  ) : (
                    <i className="bi bi-building" />
                  )}

                </div>

                <div className="edu-upload-controls">

                  <input
                    type="file"
                    className="edu-file-input"
                    accept="image/*"
                    onChange={(e) =>
                      setProfilePhotoFile(
                        e.target.files[0] || null
                      )
                    }
                  />

                  <button
                    type="button"
                    className="edu-upload-button"
                    onClick={
                      handleProfilePhotoUpload
                    }
                    disabled={
                      !profilePhotoFile ||
                      uploadingProfilePhoto
                    }
                  >
                    {uploadingProfilePhoto ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Uploading
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1" />
                        Upload photo
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>

            {/* COVER PHOTO */}

            <div className="edu-panel edu-panel-padding">

              <div className="edu-panel-header">

                <h2 className="edu-panel-title">
                  Cover photo
                </h2>

                <p className="edu-panel-description">
                  This image appears at the top of your public
                  profile.
                </p>

              </div>

              <div className="edu-cover-preview">

                {coverPhoto.url ? (
                  <img
                    src={coverPhoto.url}
                    alt="Institute cover"
                  />
                ) : (
                  <div className="edu-cover-placeholder">

                    <i className="bi bi-image" />

                    <span>
                      No cover photo added
                    </span>

                  </div>
                )}

              </div>

              <div className="edu-cover-controls">

                <input
                  type="file"
                  className="edu-file-input"
                  accept="image/*"
                  onChange={(e) =>
                    setCoverPhotoFile(
                      e.target.files[0] || null
                    )
                  }
                />

                <button
                  type="button"
                  className="edu-upload-button mt-0"
                  onClick={
                    handleCoverPhotoUpload
                  }
                  disabled={
                    !coverPhotoFile ||
                    uploadingCoverPhoto
                  }
                >
                  {uploadingCoverPhoto ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      />
                      Uploading
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-1" />
                      Upload
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>

            {/* BASIC INFORMATION */}

            <section className="edu-form-section">

              <div className="edu-form-section-header">

                <div className="edu-section-icon">
                  <i className="bi bi-building" />
                </div>

                <div>
                  <h2 className="edu-form-section-title">
                    Basic information
                  </h2>

                  <p className="edu-form-section-description">
                    Introduce your institution to the EduAdapt
                    community.
                  </p>
                </div>

              </div>

              <div className="row g-3">

                <div className="col-md-8">

                  <label className="edu-label">
                    Institute name
                  </label>

                  <input
                    type="text"
                    name="instituteName"
                    className="edu-input"
                    value={form.instituteName}
                    onChange={handleChange}
                    placeholder="Enter institute name"
                    required
                  />

                </div>

                <div className="col-md-4">

                  <label className="edu-label">
                    Institute type
                  </label>

                  <select
                    name="instituteType"
                    className="edu-select"
                    value={form.instituteType}
                    onChange={handleChange}
                  >
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
                      Coaching
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>

                </div>

                <div className="col-12">

                  <label className="edu-label">
                    About your institute
                  </label>

                  <textarea
                    name="about"
                    className="edu-textarea"
                    value={form.about}
                    onChange={handleChange}
                    placeholder="Describe your institution, its learning environment, programs, or educational focus..."
                  />

                </div>

              </div>

            </section>

            {/* CONTACT */}

            <section className="edu-form-section">

              <div className="edu-form-section-header">

                <div className="edu-section-icon">
                  <i className="bi bi-chat-left-text" />
                </div>

                <div>
                  <h2 className="edu-form-section-title">
                    Contact information
                  </h2>

                  <p className="edu-form-section-description">
                    Give learners and teachers a way to reach
                    your institution.
                  </p>
                </div>

              </div>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="edu-label">
                    Phone
                  </label>

                  <div className="edu-input-group">

                    <i className="bi bi-telephone edu-input-icon" />

                    <input
                      type="text"
                      name="phone"
                      className="edu-input edu-input-with-icon"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Institute contact number"
                    />

                  </div>

                </div>

                <div className="col-md-6">

                  <label className="edu-label">
                    Website
                  </label>

                  <div className="edu-input-group">

                    <i className="bi bi-globe2 edu-input-icon" />

                    <input
                      type="url"
                      name="website"
                      className="edu-input edu-input-with-icon"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* LOCATION */}

            <section className="edu-form-section">

              <div className="edu-form-section-header">

                <div className="edu-section-icon">
                  <i className="bi bi-geo-alt" />
                </div>

                <div>
                  <h2 className="edu-form-section-title">
                    Location
                  </h2>

                  <p className="edu-form-section-description">
                    Help people find your institution.
                  </p>
                </div>

              </div>

              <div className="row g-3">

                <div className="col-12">

                  <label className="edu-label">
                    Address
                  </label>

                  <div className="edu-input-group">

                    <i className="bi bi-pin-map edu-input-icon" />

                    <input
                      type="text"
                      name="address"
                      className="edu-input edu-input-with-icon"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address"
                    />

                  </div>

                </div>

                <div className="col-md-4">

                  <label className="edu-label">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    className="edu-input"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />

                </div>

                <div className="col-md-4">

                  <label className="edu-label">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    className="edu-input"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                  />

                </div>

                <div className="col-md-4">

                  <label className="edu-label">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    className="edu-input"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />

                </div>

              </div>

            </section>

            {/* SOCIAL LINKS */}

            <section className="edu-form-section">

              <div className="edu-form-section-header">

                <div className="edu-section-icon">
                  <i className="bi bi-share" />
                </div>

                <div>
                  <h2 className="edu-form-section-title">
                    Social links
                  </h2>

                  <p className="edu-form-section-description">
                    Connect your institution's social presence
                    with EduAdapt.
                  </p>
                </div>

              </div>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="edu-label">
                    Facebook
                  </label>

                  <div className="edu-social-input">

                    <i className="bi bi-facebook edu-social-icon" />

                    <input
                      type="url"
                      name="facebook"
                      className="edu-input"
                      value={form.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                    />

                  </div>

                </div>

                <div className="col-md-6">

                  <label className="edu-label">
                    Instagram
                  </label>

                  <div className="edu-social-input">

                    <i className="bi bi-instagram edu-social-icon" />

                    <input
                      type="url"
                      name="instagram"
                      className="edu-input"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/..."
                    />

                  </div>

                </div>

                <div className="col-md-6">

                  <label className="edu-label">
                    LinkedIn
                  </label>

                  <div className="edu-social-input">

                    <i className="bi bi-linkedin edu-social-icon" />

                    <input
                      type="url"
                      name="linkedin"
                      className="edu-input"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/..."
                    />

                  </div>

                </div>

                <div className="col-md-6">

                  <label className="edu-label">
                    YouTube
                  </label>

                  <div className="edu-social-input">

                    <i className="bi bi-youtube edu-social-icon" />

                    <input
                      type="url"
                      name="youtube"
                      className="edu-input"
                      value={form.youtube}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* ================= SAVE ================= */}

            <div className="edu-save-bar">

              <div className="edu-save-info">

                <i className="bi bi-shield-check" />

                Changes will appear on your public profile.

              </div>

              <button
                type="submit"
                className="edu-save-button"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    Save changes
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>
    </>
  )
}

export default InstituteProfileEdit
