import { API_BASE_URL } from '../../config/api'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SpaceSwitcher from '../SpaceSwitcher/SpaceSwitcher'
import Logo from '../Logo/Logo'
import NotificationBell from '../NotificationBell/NotificationBell'
import GlobalSearchBar from '../GlobalSearchBar/GlobalSearchBar'

function DashboardLayout({ children }) {
  const { user, token, logout, updateProfile } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [instituteProfile, setInstituteProfile] = useState(null)

  const isLearner = user?.accountType === 'learner'
  const isTeacher = user?.accountType === 'teacher'
  const isInstitute = user?.accountType === 'institute'

  // If institute, fetch fresh profile info (photo, instituteName) if not already synced
  useEffect(() => {
    if (isInstitute && token) {
      fetch(`${API_BASE_URL}/api/membership/institute/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setInstituteProfile(data.profile)
            if (updateProfile) {
              updateProfile(data.profile)
            }
          }
        })
        .catch(err => console.warn('Could not fetch institute profile:', err))
    }
  }, [isInstitute, token])

  const isActive = (path) => {
    if (path === '/learner' || path === '/teacher' || path === '/institute') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const navLearner = [
    { label: 'Overview', path: '/learner', icon: 'bi-grid-1x2' },
    { label: 'Community Feed', path: '/community', icon: 'bi-chat-heart' },
    { label: 'Independent Study', path: '/learner/individual', icon: 'bi-journal-bookmark' },
    { label: 'Institutions', path: '/learner/institutions', icon: 'bi-buildings' },
    { label: 'Account Profile', path: '/learner/profile', icon: 'bi-person-gear' },
  ]

  const navTeacher = [
    { label: 'Campus Batches', path: '/teacher', icon: 'bi-mortarboard' },
    { label: 'Community Feed', path: '/community', icon: 'bi-chat-heart' },
    { label: 'Freelance Studio', path: '/teacher/individual', icon: 'bi-folder2-open' },
    { label: 'Affiliated Institutes', path: '/teacher/join-institute', icon: 'bi-buildings' },
    { label: 'Teacher Profile', path: '/teacher/profile', icon: 'bi-person-badge' },
  ]

  const navInstitute = [
    { label: 'Overview', path: '/institute', icon: 'bi-speedometer2' },
    { label: 'Manage Batches', path: '/institute/batches', icon: 'bi-diagram-3-fill' },
    { label: 'Manage Teachers', path: '/institute/teachers', icon: 'bi-person-video3' },
    { label: 'Manage Students', path: '/institute/students', icon: 'bi-people-fill' },
    { label: 'Discussions Hub', path: '/community', icon: 'bi-chat-heart' },
    { label: 'Campus Settings', path: '/institute/profile', icon: 'bi-sliders2' },
  ]

  const navItems = isLearner ? navLearner : isTeacher ? navTeacher : navInstitute

  const roleBadge = isLearner
    ? { title: 'Student Workspace', color: 'badge-meta-purple' }
    : isTeacher
    ? { title: 'Educator Studio', color: 'badge-meta-sky' }
    : { title: 'Campus Admin', color: 'badge-meta-emerald' }

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Mobile Top App Bar (Only on small screens) */}
      <div className="d-flex d-lg-none align-items-center justify-content-between p-3 bg-white border-bottom">
        <Link to="/" className="text-decoration-none">
          <Logo size={30} />
        </Link>
        <div className="d-flex align-items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="btn btn-sm btn-light border p-2"
          >
            <i className={`bi ${mobileDrawerOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer */}
      {mobileDrawerOpen && (
        <div className="d-lg-none bg-white border-bottom p-3 shadow-sm animate-fade-in">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <span className={`badge-meta ${roleBadge.color}`}>
              {roleBadge.title}
            </span>
            <span className="small fw-bold text-dark">{user?.name}</span>
          </div>

          <div className="d-flex flex-column gap-1 mb-3">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`d-flex align-items-center gap-2 p-2 rounded-3 text-decoration-none ${
                  isActive(item.path) ? 'bg-primary text-white fw-bold' : 'text-secondary'
                }`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span className="small">{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => {
              setMobileDrawerOpen(false)
              logout()
            }}
            className="btn btn-sm btn-outline-danger w-100 rounded-pill"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      )}

      {/* Desktop Left Rail Navigation (Full 100vh) */}
      <aside
        className="d-none d-lg-flex flex-column justify-content-between p-3 border-end bg-white"
        style={{
          width: collapsed ? '74px' : '254px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          borderColor: 'var(--border-hairline)',
          zIndex: 1030
        }}
      >
        <div>
          {/* Top Brandmark Row (Standardized 64px height) */}
          <div
            className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom"
            style={{ height: '64px', minHeight: '64px', borderColor: 'var(--border-hairline)' }}
          >
            <Link to="/" className="text-decoration-none overflow-hidden d-flex align-items-center">
              <Logo size={32} variant={collapsed ? 'icon' : 'full'} />
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn btn-sm btn-light border-0 rounded-2 p-1 text-secondary ms-1 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              title={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <i className={`bi ${collapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`}></i>
            </button>
          </div>

          {/* Role Pill */}
          {!collapsed && (
            <div className="mb-3 px-1">
              <span className={`badge-meta ${roleBadge.color}`}>
                {roleBadge.title}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="d-flex flex-column gap-1">
            {navItems.map((item, idx) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all"
                  style={{
                    backgroundColor: active ? 'var(--brand-100)' : 'transparent',
                    color: active ? 'var(--brand-800)' : 'var(--slate-600)',
                    fontSize: '0.865rem',
                    fontWeight: active ? '700' : '500',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <i
                    className={`bi ${item.icon}`}
                    style={{
                      fontSize: '1.05rem',
                      color: active ? 'var(--brand-700)' : 'var(--slate-400)',
                    }}
                  ></i>
                  {!collapsed && <span className="text-nowrap">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-3 border-top" style={{ borderColor: 'var(--border-hairline)' }}>
          {!collapsed ? (
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--brand-700)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden lh-sm">
                  <div
                    className="fw-bold text-dark text-truncate"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {user?.name || 'Account'}
                  </div>
                  <span className="text-muted text-capitalize" style={{ fontSize: '0.68rem' }}>
                    {user?.accountType}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn btn-sm text-secondary p-1 border-0"
                title="Sign out"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={logout}
                className="btn btn-sm btn-light rounded-circle p-2 text-danger"
                title="Sign out"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main App Canvas */}
      <main className="flex-grow-1 px-3 px-md-4 px-xl-4 pt-3 pb-4 overflow-auto w-100">
        <div className="container-fluid max-w-7xl px-0">
          {/* Top Content Row: Exact same height & top baseline as aside top row */}
          <div
            className="d-none d-lg-flex align-items-center justify-content-between mb-3 pb-2 border-bottom gap-3"
            style={{
              height: '64px',
              minHeight: '64px',
              borderColor: 'var(--border-hairline)'
            }}
          >
            {/* Institute Identity: Logo/Icon, Name, Username */}
            {isInstitute ? (
              <div className="d-flex align-items-center gap-3 overflow-hidden me-3" style={{ minWidth: 0 }}>
                {/* Logo or Default Icon */}
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '11px',
                    background: (user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url) ? '#FFFFFF' : 'var(--brand-100)',
                    border: '1px solid var(--border-hairline, #E4E4E7)',
                    color: 'var(--brand-700)'
                  }}
                >
                  {(user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url) ? (
                    <img
                      src={user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url}
                      alt={instituteProfile?.instituteName || user?.profile?.instituteName || user?.name || 'Institute Logo'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.innerHTML = '<i class="bi bi-building fs-5" style="color: var(--brand-700)"></i>'
                      }}
                    />
                  ) : (
                    <i className="bi bi-building fs-5" />
                  )}
                </div>

                {/* Name & @username */}
                <div className="d-flex flex-column justify-content-center overflow-hidden lh-sm">
                  <h4
                    className="fw-bold mb-0 text-dark text-truncate"
                    style={{
                      letterSpacing: '-0.02em',
                      fontSize: '1.08rem',
                      lineHeight: '1.2'
                    }}
                    title={instituteProfile?.instituteName || user?.profile?.instituteName || user?.name || 'Institute'}
                  >
                    {instituteProfile?.instituteName || user?.profile?.instituteName || user?.name || 'Institute'}
                  </h4>
                  {user?.username && (
                    <span
                      className="text-secondary text-truncate"
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        lineHeight: '1.2'
                      }}
                    >
                      @{user.username}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Right actions: Global Search & Notifications */}
            <div className="d-flex align-items-center gap-3 ms-auto" style={{ flexGrow: 0, minWidth: '380px', maxWidth: '580px', width: '100%' }}>
              <div className="flex-grow-1">
                <GlobalSearchBar />
              </div>
              <NotificationBell />
            </div>
          </div>
          <div className="d-lg-none mb-3">
            {isInstitute && (
              <div className="d-flex align-items-center gap-3 overflow-hidden mb-3 pb-2 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: (user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url) ? '#FFFFFF' : 'var(--brand-100)',
                    border: '1px solid var(--border-hairline, #E4E4E7)',
                    color: 'var(--brand-700)'
                  }}
                >
                  {(user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url) ? (
                    <img
                      src={user?.profile?.profilePhoto?.url || instituteProfile?.profilePhoto?.url}
                      alt={instituteProfile?.instituteName || user?.profile?.instituteName || user?.name || 'Institute Logo'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.innerHTML = '<i class="bi bi-building fs-5" style="color: var(--brand-700)"></i>'
                      }}
                    />
                  ) : (
                    <i className="bi bi-building fs-5" />
                  )}
                </div>
                <div className="d-flex flex-column justify-content-center overflow-hidden lh-sm">
                  <h5
                    className="fw-bold mb-0 text-dark text-truncate"
                    style={{ fontSize: '1rem', lineHeight: '1.2' }}
                  >
                    {instituteProfile?.instituteName || user?.profile?.instituteName || user?.name || 'Institute'}
                  </h5>
                  {user?.username && (
                    <span className="text-secondary text-truncate" style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                      @{user.username}
                    </span>
                  )}
                </div>
              </div>
            )}
            <GlobalSearchBar />
          </div>
          {!isInstitute && <SpaceSwitcher />}
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
