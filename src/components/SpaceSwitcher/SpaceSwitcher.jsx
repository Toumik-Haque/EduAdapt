import { Link } from 'react-router-dom'
import { useSpaces } from '../../context/SpaceContext'
import { useAuth } from '../../context/AuthContext'

function SpaceSwitcher() {
  const { institutions } = useSpaces()
  const { user } = useAuth()

  const isTeacher = user?.accountType === 'teacher'

  const individualPath = isTeacher
    ? '/teacher/individual'
    : '/learner/individual'

  const institutionPath = isTeacher
    ? '/teacher/institute'
    : '/learner/institute'

  const joinPath = isTeacher
    ? '/teacher/join-institute'
    : '/learner/institutions'

  const spaceTitle = isTeacher
    ? 'Teaching Space'
    : 'Learning Space'

  const individualTitle = isTeacher
    ? 'Individual Teaching'
    : 'Individual Learning'

  const institutionTitle = isTeacher
    ? 'Institution Teaching'
    : 'Institution Learning'

  return (
    <div className="mb-3">

      <div className="dropdown">

        <button
          className="btn dropdown-toggle rounded-pill px-3 py-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{
            background: '#F5F3FF',
            color: '#6D28D9',
            border: '1px solid #E9D5FF',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <i className="bi bi-grid me-2"></i>
          {spaceTitle}
        </button>

        <ul
          className="dropdown-menu border-0 rounded-4 p-2"
          style={{
            minWidth: '230px',
            boxShadow:
              '0 10px 30px rgba(15, 23, 42, 0.10)'
          }}
        >

          {/* ================= INDIVIDUAL ================= */}

          <li>
            <Link
              to={individualPath}
              className="dropdown-item rounded-3 py-2"
            >
              <i
                className="bi bi-person-workspace me-2"
                style={{ color: '#7C3AED' }}
              ></i>

              {individualTitle}
            </Link>
          </li>


          {/* ================= INSTITUTIONS ================= */}

          {institutions.map((institution) => (
            <li key={institution.id}>

              <Link
                to={`${institutionPath}/${institution.id}`}
                className="dropdown-item rounded-3 py-2"
              >
                <i
                  className="bi bi-building me-2"
                  style={{ color: '#8B5CF6' }}
                ></i>

                {institution.instituteName}

              </Link>

            </li>
          ))}


          {/* ================= DIVIDER ================= */}

          <li>
            <hr className="dropdown-divider my-2" />
          </li>


          {/* ================= JOIN ================= */}

          <li>
            <Link
              to={joinPath}
              className="dropdown-item rounded-3 py-2"
              style={{
                color: '#6D28D9'
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>

              Join New Institution

            </Link>
          </li>

        </ul>

      </div>

    </div>
  )
}

export default SpaceSwitcher

