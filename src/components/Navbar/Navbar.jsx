import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo/Logo'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isCurrent = (path) => location.pathname === path

  const closeMobile = () => setMobileMenuOpen(false)

  // Hide topbar inside all authenticated dashboard portals
  const isDashboardRoute =
    location.pathname.startsWith('/learner') ||
    location.pathname.startsWith('/teacher') ||
    location.pathname.startsWith('/institute') ||
    location.pathname.startsWith('/community')

  if (isDashboardRoute) {
    return null
  }

  return (
    <header className="sticky-top header-glass" style={{ height: '64px', zIndex: 1040 }}>
      <div className="container-fluid h-100 d-flex align-items-center justify-content-between px-3 px-lg-4 max-w-7xl">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobile} className="d-flex align-items-center">
          <Logo size={34} />
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="d-none d-md-flex align-items-center gap-1">
          {isAuthenticated ? (
            <>
              {user?.accountType === 'learner' && (
                <>
                  <Link
                    to="/learner"
                    className={`btn-ghost-action ${isCurrent('/learner') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-grid-1x2"></i>
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/learner/individual"
                    className={`btn-ghost-action ${isCurrent('/learner/individual') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-journal-bookmark"></i>
                    <span>Independent Study</span>
                  </Link>
                  <Link
                    to="/community"
                    className={`btn-ghost-action ${isCurrent('/community') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-chat-heart"></i>
                    <span>Community</span>
                  </Link>
                  <Link
                    to="/learner/institutions"
                    className={`btn-ghost-action ${isCurrent('/learner/institutions') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-buildings"></i>
                    <span>Institutions</span>
                  </Link>
                </>
              )}

              {user?.accountType === 'teacher' && (
                <>
                  <Link
                    to="/teacher"
                    className={`btn-ghost-action ${isCurrent('/teacher') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-mortarboard"></i>
                    <span>Campus Batches</span>
                  </Link>
                  <Link
                    to="/teacher/individual"
                    className={`btn-ghost-action ${isCurrent('/teacher/individual') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-folder2-open"></i>
                    <span>Freelance Studio</span>
                  </Link>
                  <Link
                    to="/community"
                    className={`btn-ghost-action ${isCurrent('/community') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-chat-heart"></i>
                    <span>Community</span>
                  </Link>
                </>
              )}

              {user?.accountType === 'institute' && (
                <>
                  <Link
                    to="/institute"
                    className={`btn-ghost-action ${isCurrent('/institute') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-speedometer2"></i>
                    <span>Campus Management</span>
                  </Link>
                  <Link
                    to="/community"
                    className={`btn-ghost-action ${isCurrent('/community') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-chat-heart"></i>
                    <span>Discussions</span>
                  </Link>
                  <Link
                    to="/institute/profile"
                    className={`btn-ghost-action ${isCurrent('/institute/profile') ? 'text-primary fw-bold' : ''}`}
                  >
                    <i className="bi bi-sliders2"></i>
                    <span>Profile</span>
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a href="/#ecosystem" className="btn-ghost-action">
                <span>Ecosystem</span>
              </a>
              <a href="/#features" className="btn-ghost-action">
                <span>Features</span>
              </a>
              <Link to="/test-logo" className="btn-ghost-action">
                <i className="bi bi-palette2"></i>
                <span>Brand Identity</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Session Actions */}
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <Link
                to={user?.accountType === 'institute' ? '/institute/profile' : `/${user?.accountType}/profile`}
                className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-light border text-decoration-none"
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '28px', height: '28px', backgroundColor: 'var(--brand-700)', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="small fw-semibold text-dark pe-1 d-none d-sm-inline">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={logout}
                className="btn btn-sm btn-light border rounded-pill px-3 text-secondary"
                title="Sign out"
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                <span className="d-none d-sm-inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn-ghost-action">
                Sign In
              </Link>
              <Link to="/register" className="btn-brand-solid">
                <span>Get Started</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-light d-md-none border-0 p-2 ms-1 rounded-3"
            aria-label="Toggle navigation"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div
          className="d-md-none bg-white border-top py-3 px-3 shadow-lg position-absolute w-100 start-0"
          style={{ top: '64px' }}
        >
          {isAuthenticated ? (
            <div className="d-flex flex-column gap-2">
              <div className="p-2 rounded bg-light mb-1">
                <div className="fw-bold small">{user?.name}</div>
                <div className="text-muted small text-capitalize">{user?.accountType} Account</div>
              </div>

              {user?.accountType === 'learner' && (
                <>
                  <Link to="/learner" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-grid-1x2"></i> Dashboard
                  </Link>
                  <Link to="/learner/individual" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-journal-bookmark"></i> Independent Study
                  </Link>
                  <Link to="/community" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-chat-heart"></i> Community Feed
                  </Link>
                  <Link to="/learner/institutions" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-buildings"></i> Institutions Catalog
                  </Link>
                </>
              )}

              {user?.accountType === 'teacher' && (
                <>
                  <Link to="/teacher" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-mortarboard"></i> Campus Batches
                  </Link>
                  <Link to="/teacher/individual" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-folder2-open"></i> Freelance Studio
                  </Link>
                  <Link to="/community" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-chat-heart"></i> Community Feed
                  </Link>
                </>
              )}

              {user?.accountType === 'institute' && (
                <>
                  <Link to="/institute" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-speedometer2"></i> Campus Dashboard
                  </Link>
                  <Link to="/community" onClick={closeMobile} className="btn-ghost-action w-100 justify-content-start">
                    <i className="bi bi-chat-heart"></i> Discussions
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  closeMobile()
                  logout()
                }}
                className="btn btn-outline-danger w-100 rounded-pill mt-2 py-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <Link to="/login" onClick={closeMobile} className="btn btn-light w-100 rounded-pill py-2">
                Sign In
              </Link>
              <Link to="/register" onClick={closeMobile} className="btn-brand-solid w-100 rounded-pill py-2 text-white">
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
