import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function TeacherInstitutionSpaces() {
  const { token } = useAuth()

  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/membership/teacher/batches',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load institutions'
        )
      }

      const batches = data.batches || []

      // Group approved batches by institution
      const institutionMap = {}

      batches
        .filter(
          (batch) => batch.status === 'approved'
        )
        .forEach((batch) => {
          const institutionId =
            batch.institutionId

          if (!institutionMap[institutionId]) {
            institutionMap[institutionId] = {
              institutionId,
              instituteName:
                batch.instituteName || '',
              instituteType:
                batch.instituteType || '',
              batches: []
            }
          }

          institutionMap[
            institutionId
          ].batches.push(batch)
        })

      setInstitutions(
        Object.values(institutionMap)
      )
    } catch (error) {
      console.error(
        'Failed to load teacher institutions:',
        error
      )

      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      return
    }

    fetchInstitutions()
  }, [token])

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div
          className="spinner-border"
          style={{
            color: '#7C3AED'
          }}
          role="status"
        ></div>

        <p className="text-secondary mt-3 mb-0">
          Loading your institutions...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-3 px-3 py-2"
        style={{
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA'
        }}
      >
        <i className="bi bi-exclamation-circle me-2"></i>
        {error}
      </div>
    )
  }

  if (institutions.length === 0) {
    return (
      <div
        className="bg-white border rounded-4 p-4"
        style={{
          borderColor: '#E9D5FF'
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-3 mb-3"
          style={{
            width: '44px',
            height: '44px',
            background: '#F5F3FF',
            color: '#7C3AED'
          }}
        >
          <i className="bi bi-building"></i>
        </div>

        <h6 className="fw-semibold mb-1">
          No approved institutions
        </h6>

        <p className="text-secondary mb-0">
          You don't have any approved teaching
          institution yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2
          className="fw-bold mb-1"
          style={{
            letterSpacing: '-0.5px'
          }}
        >
          Institution Teaching
        </h2>

        <p
          className="text-secondary mb-0"
          style={{
            fontSize: '0.9rem'
          }}
        >
          Select an institution to manage your
          teaching workspace.
        </p>
      </div>

      <div className="row g-3">
        {institutions.map((institution) => (
          <div
            className="col-md-6 col-lg-4"
            key={institution.institutionId}
          >
            <Link
              to={`/teacher/institute/${institution.institutionId}`}
              className="text-decoration-none"
            >
              <div
                className="bg-white border rounded-4 p-4 h-100"
                style={{
                  borderColor: '#E9D5FF',
                  boxShadow:
                    '0 4px 15px rgba(15, 23, 42, 0.03)',
                  transition:
                    'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-3px)'
                  e.currentTarget.style.borderColor =
                    '#C4B5FD'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(0)'
                  e.currentTarget.style.borderColor =
                    '#E9D5FF'
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: '#F5F3FF',
                    color: '#7C3AED'
                  }}
                >
                  <i className="bi bi-building"></i>
                </div>

                <h5 className="fw-semibold mb-1">
                  {institution.instituteName ||
                    'Institution'}
                </h5>

                {institution.instituteType && (
                  <p
                    className="text-secondary text-capitalize mb-3"
                    style={{
                      fontSize: '0.8rem'
                    }}
                  >
                    {institution.instituteType}
                  </p>
                )}

                <div
                  className="text-secondary"
                  style={{
                    fontSize: '0.8rem'
                  }}
                >
                  <i className="bi bi-collection me-2"></i>
                  {institution.batches.length}{' '}
                  approved{' '}
                  {institution.batches.length === 1
                    ? 'batch'
                    : 'batches'}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherInstitutionSpaces