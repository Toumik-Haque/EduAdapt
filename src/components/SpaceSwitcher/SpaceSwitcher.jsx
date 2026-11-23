import { Link } from 'react-router-dom'
import { useSpaces } from '../../context/SpaceContext'
import { useAuth } from '../../context/AuthContext'

function SpaceSwitcher() {
  const { institutions } = useSpaces()
  const { user } = useAuth()

  // Only render switcher for learners and teachers who switch between individual & institution spaces
  if (!user || user.accountType === 'institute') {
    return null
  }

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
    ? 'Teacher Workspace'
    : 'Learner Workspace'

  const individualTitle = isTeacher
    ? 'Freelance & Private Courses'
    : 'Personal Study & Courses'

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 p-2 px-3 rounded-4 glass-panel shadow-sm">
      <div className="d-flex align-items-center gap-2">
        <span className="badge-pill-soft bg-primary-subtle text-primary">
          <i className="bi bi-layers-fill"></i> {spaceTitle}
        </span>
      </div>

      <div className="dropdown">
        <button
          className="btn btn-sm btn-brand-secondary rounded-pill px-3 py-2 dropdown-toggle d-flex align-items-center gap-2 shadow-none"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-arrow-repeat text-primary"></i>
          <span>Switch Mode / Institution</span>
        </button>

        <ul
          className="dropdown-menu dropdown-menu-end border-0 rounded-4 p-2 shadow-lg animate-fade-in"
          style={{ minWidth: '260px' }}
        >
          <li className="px-3 py-2 text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
            Personal Space
          </li>
          <li>
            <Link
              to={individualPath}
              className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
            >
              <div
                className="rounded-2 d-flex align-items-center justify-content-center text-primary bg-primary-subtle"
                style={{ width: '28px', height: '28px' }}
              >
                <i className="bi bi-person-workspace"></i>
              </div>
              <div className="lh-sm">
                <div className="fw-semibold small">{individualTitle}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Self-paced learning</div>
              </div>
            </Link>
          </li>

          <li><hr className="dropdown-divider my-2 opacity-50" /></li>

          <li className="px-3 py-2 text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
            Affiliated Institutions
          </li>

          {institutions && institutions.length > 0 ? (
            institutions.map((inst) => (
              <li key={inst._id || inst.id}>
                <Link
                  to={`${institutionPath}/${inst._id || inst.id}`}
                  className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                >
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center text-secondary bg-light border"
                    style={{ width: '28px', height: '28px' }}
                  >
                    <i className="bi bi-building"></i>
                  </div>
                  <span className="small fw-medium text-truncate">{inst.name || inst.instituteName}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-3 py-1 text-muted small fst-italic">
              No institutions enrolled yet
            </li>
          )}

          <li><hr className="dropdown-divider my-2 opacity-50" /></li>

          <li>
            <Link
              to={joinPath}
              className="dropdown-item rounded-3 py-2 text-primary fw-semibold small d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              <span>Discover & Join Institution</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SpaceSwitcher
