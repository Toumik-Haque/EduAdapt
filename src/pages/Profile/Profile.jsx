import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function Profile() {
  const navigate = useNavigate()
  const { showConfirm, showAlert } = useModal()

  const {
    token,
    user,
    updateProfile,
    updateUser,
    logout
  } = useAuth()

  const isInstitute =
    user?.accountType === 'institute'

  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [instituteType, setInstituteType] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setUsername(user?.username || '')
    if (isInstitute) {
      setName(
        user?.profile?.instituteName || ''
      )

      setInstituteType(
        user?.profile?.instituteType || ''
      )
    } else {
      setName(
        user?.profile?.fullName || ''
      )
    }

    setLoading(false)
  }, [user, isInstitute])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError(
        isInstitute
          ? 'Institute name is required'
          : 'Name is required'
      )
      return
    }

    if (trimmedName.length < 2) {
      setError(
        isInstitute
          ? 'Institute name must be at least 2 characters'
          : 'Name must be at least 2 characters'
      )
      return
    }

    if (
      isInstitute &&
      !instituteType
    ) {
      setError('Institute type is required')
      return
    }

    try {
      setSaving(true)

      const body = isInstitute
        ? {
            username: username.trim(),
            name: trimmedName,
            instituteType
          }
        : {
            username: username.trim(),
            name: trimmedName
          }

      const response = await fetch(
        'http://localhost:5000/api/auth/profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update profile'
        )
      }

      updateProfile(data.profile)
      if (data.username) {
        updateUser({ username: data.username })
      }

      setSuccess(
        'Profile updated successfully'
      )
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      )

      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (user?.accountType === 'learner') {
      navigate('/learner')
      return
    }

    if (user?.accountType === 'teacher') {
      navigate('/teacher')
      return
    }

    if (user?.accountType === 'institute') {
      navigate('/institute')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm(
      'Are you sure you want to permanently delete your EduAdapt account? All your data, enrollments, and profiles will be irreversibly erased. This cannot be undone.',
      'Delete Account',
      'danger',
      'Yes, Delete My Account',
      'Cancel'
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      const res = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete account')
      }

      await showAlert('Your account has been deleted permanently.', 'Account Deleted', 'success')
      logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Error deleting account', 'Error', 'danger')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '70vh' }}
      >
        <div className="text-secondary">
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div
      className="container py-4 py-md-5"
      style={{
        minHeight: 'calc(100vh - 70px)'
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '620px'
        }}
      >

        {/* Header */}
        <div className="mb-4">

          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            style={{
              color: '#7C3AED'
            }}
            onClick={handleBack}
          >
            ← Back
          </button>

          <h2
            className="fw-bold mt-3 mb-2"
            style={{
              color: '#18181B'
            }}
          >
            Edit Profile
          </h2>

          <p
            className="mb-0"
            style={{
              color: '#71717A'
            }}
          >
            Update your profile details.
          </p>

        </div>

        {/* Profile Card */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '18px',
            background: '#FFFFFF'
          }}
        >
          <div className="card-body p-4 p-md-5">

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="mb-4">

                <label
                  htmlFor="profileName"
                  className="form-label fw-semibold"
                >
                  {isInstitute
                    ? 'Institute Name'
                    : 'Full Name'} <span className="required-star">*</span>
                </label>

                <input
                  id="profileName"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={event =>
                    setName(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  style={{
                    borderRadius: '10px',
                    padding: '11px 13px'
                  }}
                />

              </div>

              {/* Institute Type */}
              {isInstitute && (
                <div className="mb-4">

                  <label
                    htmlFor="instituteType"
                    className="form-label fw-semibold"
                  >
                    Institute Type
                  </label>

                  <select
                    id="instituteType"
                    className="form-select"
                    value={instituteType}
                    onChange={event =>
                      setInstituteType(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    style={{
                      borderRadius: '10px',
                      padding: '11px 13px'
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
                      Coaching
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>

                </div>
              )}

              {/* Username */}
              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Username <span className="required-star">*</span>
                </label>

                <div className="input-group">
                  <span
                    className="input-group-text fw-semibold"
                    style={{
                      borderRadius: '10px 0 0 10px',
                      background: '#F4F4F5',
                      border: '1px solid #E4E4E7',
                      borderRight: 'none',
                      color: '#71717A',
                      padding: '11px 16px',
                      fontSize: '14px'
                    }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={saving}
                    required
                    style={{
                      borderRadius: '0 10px 10px 0',
                      border: '1px solid #E4E4E7',
                      padding: '11px 14px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <small className="text-secondary mt-1 d-block" style={{ fontSize: '12px' }}>
                  Unique handle across the EduAdapt ecosystem.
                </small>

              </div>

              {/* Email */}
              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{
                    borderRadius: '10px',
                    padding: '11px 13px',
                    background: '#F4F4F5'
                  }}
                />

                <small className="text-secondary">
                  Email cannot be changed here.
                </small>

              </div>

              {/* Account Type */}
              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Account Type
                </label>

                <input
                  type="text"
                  className="form-control text-capitalize"
                  value={
                    user?.accountType || ''
                  }
                  disabled
                  style={{
                    borderRadius: '10px',
                    padding: '11px 13px',
                    background: '#F4F4F5'
                  }}
                />

              </div>

              {/* Error */}
              {error && (
                <div
                  className="mb-3 px-3 py-2"
                  style={{
                    background: '#FEF2F2',
                    color: '#B91C1C',
                    borderRadius: '10px'
                  }}
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  className="mb-3 px-3 py-2"
                  style={{
                    background: '#F0FDF4',
                    color: '#15803D',
                    borderRadius: '10px'
                  }}
                >
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2">

                <button
                  type="button"
                  className="btn"
                  onClick={handleBack}
                  disabled={saving}
                  style={{
                    borderRadius: '10px',
                    padding: '10px 18px',
                    border:
                      '1px solid #E4E4E7',
                    background: '#FFFFFF'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn text-white"
                  disabled={saving}
                  style={{
                    borderRadius: '10px',
                    padding: '10px 20px',
                    background: '#7C3AED',
                    border: 'none'
                  }}
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

            {/* Danger Zone: Delete Account */}
            <div
              className="mt-5 p-4"
              style={{
                borderRadius: '16px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2'
              }}
            >
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: '#991B1B' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    Danger Zone
                  </h6>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.875rem' }}>
                    Permanently delete your EduAdapt account (@{user?.username || 'user'}), your profile, and all associated personal data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="btn btn-danger fw-semibold px-3 py-2 text-nowrap"
                  style={{
                    borderRadius: '10px',
                    background: '#DC2626',
                    border: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile
