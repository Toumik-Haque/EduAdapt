import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function NotificationBell() {
  const { token, user } = useAuth()
  const { showAlert } = useModal()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState(null)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Periodic poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) {
      // Mark all as read
      fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        setUnreadCount(0)
      })
    }
  }

  const handleAccept = async (notif) => {
    try {
      setActingId(notif._id)
      const res = await fetch(`http://localhost:5000/api/notifications/${notif._id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to accept invitation')

      showAlert(data.message || 'Invitation accepted! You have joined the batch.', 'Invitation Accepted', 'success')
      fetchNotifications()
    } catch (err) {
      showAlert(err.message, 'Error', 'danger')
    } finally {
      setActingId(null)
    }
  }

  const handleDecline = async (notif) => {
    try {
      setActingId(notif._id)
      const res = await fetch(`http://localhost:5000/api/notifications/${notif._id}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to decline invitation')

      fetchNotifications()
    } catch (err) {
      showAlert(err.message, 'Error', 'danger')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="btn btn-sm btn-light border position-relative d-flex align-items-center justify-content-center"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '11px',
          background: open ? 'var(--brand-100)' : '#FFFFFF',
          borderColor: open ? 'var(--brand-300)' : '#E4E4E7',
          color: open ? 'var(--brand-700)' : '#4B5563',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Notifications"
      >
        <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill text-primary' : 'bi-bell'}`} style={{ fontSize: '15px' }}></i>

        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
            style={{ fontSize: '9px', padding: '3px 6px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border animate-fade-in"
          style={{
            width: '350px',
            maxWidth: '90vw',
            zIndex: 1060,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-bell-fill text-primary"></i>
              <span className="fw-bold text-dark small">Notifications</span>
            </div>
            {notifications.length > 0 && (
              <span className="badge bg-primary-subtle text-primary small">
                {notifications.length} Total
              </span>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-5 text-muted small p-3">
                <i className="bi bi-bell-slash fs-2 opacity-50 d-block mb-2"></i>
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => {
                const isInvite = notif.type === 'batch_invitation'
                const isHandled = notif.status === 'accepted' || notif.status === 'declined'

                return (
                  <div
                    key={notif._id}
                    className={`p-3 border-bottom transition-all ${
                      notif.status === 'unread' ? 'bg-primary-subtle bg-opacity-25' : 'bg-white'
                    }`}
                  >
                    <div className="d-flex align-items-start gap-2 mb-1">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{
                          width: '26px',
                          height: '26px',
                          background: isInvite ? '#EDE9FE' : '#F1F5F9',
                          color: isInvite ? '#7C3AED' : '#64748B',
                          fontSize: '12px'
                        }}
                      >
                        <i className={`bi ${isInvite ? 'bi-envelope-paper-fill' : 'bi-info-circle-fill'}`}></i>
                      </div>
                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                          <div className="fw-bold text-dark small lh-sm">{notif.title}</div>
                          {notif.institutionId && (
                            <Link
                              to={`/institute/${notif.institutionId.username || notif.institutionId._id}`}
                              className="text-decoration-none badge bg-primary-subtle text-primary border"
                              style={{ fontSize: '10px' }}
                              title="View Institution Profile"
                              onClick={() => setOpen(false)}
                            >
                              Campus Profile
                            </Link>
                          )}
                        </div>
                        <p className="text-secondary small mb-2" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                          {notif.message}
                        </p>

                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <small className="text-muted" style={{ fontSize: '10px' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </small>

                          {/* Action Buttons for Batch Invitations */}
                          {isInvite && !isHandled && (
                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDecline(notif)}
                                disabled={actingId === notif._id}
                                className="btn btn-sm btn-light border py-1 px-2 text-secondary"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAccept(notif)}
                                disabled={actingId === notif._id}
                                className="btn btn-sm btn-primary py-1 px-3 text-white fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                              >
                                {actingId === notif._id ? 'Joining...' : 'Accept'}
                              </button>
                            </div>
                          )}

                          {isHandled && (
                            <span
                              className={`badge ${
                                notif.status === 'accepted'
                                  ? 'bg-success-subtle text-success'
                                  : 'bg-secondary-subtle text-secondary'
                              }`}
                              style={{ fontSize: '10px' }}
                            >
                              {notif.status === 'accepted' ? 'Accepted' : 'Declined'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
