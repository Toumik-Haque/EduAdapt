import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function InstituteProfileEdit() {
  const { token } = useAuth()

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
          instituteType: data.profile.instituteType || 'college',
          about: data.profile.about || '',
          phone: data.profile.contact?.phone || '',
          address: data.profile.location?.address || '',
          city: data.profile.location?.city || '',
          state: data.profile.location?.state || '',
          country: data.profile.location?.country || 'India',
          website: data.profile.website || '',
          facebook: data.profile.socialLinks?.facebook || '',
          instagram: data.profile.socialLinks?.instagram || '',
          linkedin: data.profile.socialLinks?.linkedin || '',
          youtube: data.profile.socialLinks?.youtube || ''
        })

        setProfilePhoto(
          data.profile.profilePhoto || {
            url: '',
            publicId: ''
          }
        )
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    }
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setMessage('')
    setError('')

    try {
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
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePhotoUpload = async () => {
    if (!profilePhotoFile) {
      return
    }

    try {
      setUploadingProfilePhoto(true)
      setError('')
      setMessage('')

      const formData = new FormData()
      formData.append('profilePhoto', profilePhotoFile)

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
          data.message || 'Failed to upload profile photo'
        )
      }

      setProfilePhoto(data.profilePhoto)

      setProfilePhotoFile(null)
      setMessage('Profile photo uploaded successfully')
    } catch (error) {
      setError(error.message)
    } finally {
      setUploadingProfilePhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="mb-1">Edit Institute Profile</h2>
        <p className="text-muted mb-0">
          Manage the information shown on your public institute profile.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Profile Photo
          </label>

          {profilePhoto.url && (
            <div className="mb-3">
              <img
                src={profilePhoto.url}
                alt="Institute profile"
                className="rounded-circle"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) =>
              setProfilePhotoFile(e.target.files[0] || null)
            }
          />

          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleProfilePhotoUpload}
            disabled={!profilePhotoFile || uploadingProfilePhoto}
          >
            {uploadingProfilePhoto
              ? 'Uploading...'
              : 'Upload Profile Photo'}
          </button>
        </div>


        {/* Basic Information */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Basic Information</h5>

            <div className="mb-3">
              <label className="form-label">
                Institute Name
              </label>

              <input
                type="text"
                name="instituteName"
                className="form-control"
                value={form.instituteName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Institute Type
              </label>

              <select
                name="instituteType"
                className="form-select"
                value={form.instituteType}
                onChange={handleChange}
              >
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="coaching">Coaching</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                About
              </label>

              <textarea
                name="about"
                className="form-control"
                rows="5"
                value={form.about}
                onChange={handleChange}
                placeholder="Tell learners and teachers about your institute..."
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Contact Information</h5>

            <div className="mb-3">
              <label className="form-label">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Website
              </label>

              <input
                type="url"
                name="website"
                className="form-control"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Location</h5>

            <div className="mb-3">
              <label className="form-label">
                Address
              </label>

              <input
                type="text"
                name="address"
                className="form-control"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  className="form-control"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Social Links</h5>

            <div className="mb-3">
              <label className="form-label">
                Facebook
              </label>

              <input
                type="url"
                name="facebook"
                className="form-control"
                value={form.facebook}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Instagram
              </label>

              <input
                type="url"
                name="instagram"
                className="form-control"
                value={form.instagram}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                LinkedIn
              </label>

              <input
                type="url"
                name="linkedin"
                className="form-control"
                value={form.linkedin}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                YouTube
              </label>

              <input
                type="url"
                name="youtube"
                className="form-control"
                value={form.youtube}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default InstituteProfileEdit