import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function InteractiveNoticeBoard({
  institutionId,
  renderAction
}) {
  const { token, user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [pinned, setPinned] = useState(false)
  const [posting, setPosting] = useState(false)

  const canPost = user?.accountType === 'teacher' || user?.accountType === 'institute'

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const url = institutionId
        ? `${API_BASE_URL}/api/announcements?institutionId=${institutionId}`
        : `${API_BASE_URL}/api/announcements`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAnnouncements(data.announcements || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchAnnouncements()
  }, [token, institutionId])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    try {
      setPosting(true)
      const res = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          message,
          institutionId,
          pinned
        })
      })
      const data = await res.json()
      if (res.ok) {
        setShowModal(false)
        setTitle('')
        setMessage('')
        setPinned(false)
        fetchAnnouncements()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a._id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (renderAction) {
      if (canPost) {
        renderAction(
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 shadow-xs fw-semibold d-inline-flex align-items-center gap-1"
            style={{ fontSize: '12px' }}
          >
            <i className="bi bi-plus-lg"></i> Post Notice
          </button>
        )
      } else {
        renderAction(null)
      }
    }
  }, [renderAction, canPost])

  return (
    <div className="card-premium p-4 mb-4">
      {canPost && !renderAction && (
        <div className="d-flex justify-content-end align-items-center mb-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
          >
            <i className="bi bi-plus-lg me-1"></i> Post Notice
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-3 text-muted small">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-3 bg-light rounded-3 text-center small text-muted">
          No active notices or updates posted right now.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`p-3 rounded-3 border transition-all ${
                item.pinned ? 'bg-primary-subtle border-primary-subtle' : 'bg-white'
              }`}
            >
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="d-flex align-items-center gap-2">
                  {item.pinned && (
                    <span className="badge bg-primary text-white small">
                      <i className="bi bi-pin-angle-fill me-1"></i> Pinned
                    </span>
                  )}
                  <span className="fw-bold text-dark">{item.title}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                  {(user?.userId === item.senderId || user?.accountType === 'institute') && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-sm text-danger p-0 border-0"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
              <p className="small text-secondary mb-1">{item.message}</p>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                Posted by: <strong>{item.senderName}</strong> ({item.senderType})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to Post Notice */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold">Publish Community Notice</h6>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handlePost}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">
                      Subject / Title <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Schedule Change or Workshop Tomorrow"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Message <span className="required-star">*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="form-control form-control-sm"
                      placeholder="Detail instructions or information..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pinCheck"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="pinCheck">
                      Pin to top of notice board
                    </label>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting}
                      className="btn btn-sm btn-primary rounded-pill px-3"
                    >
                      {posting ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveNoticeBoard
