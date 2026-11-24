import { API_BASE_URL } from '../../config/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

function Community() {
  const { token, user } = useAuth()
  const { showAlert, showConfirm } = useModal()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Create post modal state
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Discussion')
  const [tags, setTags] = useState('')
  const [publishing, setPublishing] = useState(false)

  // Active comment box state
  const [openComments, setOpenComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})

  const categories = ['All', 'Question & Doubt', 'Study Resource', 'Project Showcase', 'Discussion', 'Achievement']

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/api/community?category=${activeCategory}`
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchPosts()
  }, [token, activeCategory])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPosts()
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    try {
      setPublishing(true)
      const res = await fetch(`${API_BASE_URL}/api/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags
        })
      })
      const data = await res.json()
      if (res.ok) {
        setPosts([data.post, ...posts])
        setShowModal(false)
        setTitle('')
        setContent('')
        setTags('')
        setCategory('Discussion')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPublishing(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setPosts(
          posts.map((p) => {
            if (p._id === postId) {
              const currentLikes = p.likes || []
              const hasLiked = currentLikes.includes(user?.userId)
              const updatedLikes = hasLiked
                ? currentLikes.filter((uid) => uid !== user?.userId)
                : [...currentLikes, user?.userId]
              return { ...p, likes: updatedLikes }
            }
            return p
          })
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]
    if (!text || !text.trim()) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (res.ok) {
        setPosts(
          posts.map((p) => {
            if (p._id === postId) {
              return { ...p, comments: [...(p.comments || []), data.comment] }
            }
            return p
          })
        )
        setCommentInputs({ ...commentInputs, [postId]: '' })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePost = async (postId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to remove this community discussion topic?',
      'Delete Topic',
      'danger',
      'Delete'
    )
    if (!confirmed) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postId))
        showAlert('Topic deleted.', 'Removed', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('Unable to delete topic.', 'Error', 'danger')
    }
  }

  return (
    <div>
      {/* Community Header Banner */}
      <div className="card-clean p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge-clean badge-clean-primary">
                <i className="bi bi-people-fill"></i> Social Learning Hub
              </span>
              <span className="text-muted small">• Ask, Share & Collaborate</span>
            </div>
            <h2 className="fw-extrabold text-dark tracking-tight mb-1">EduAdapt Community</h2>
            <p className="text-secondary small mb-0">
              Connect with fellow learners, faculty, and industry tutors across batches and individual disciplines.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-edu-primary shadow-sm"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Create Discussion</span>
          </button>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="row g-3 align-items-center mt-3 pt-3 border-top">
          <div className="col-12 col-md-7 d-flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm rounded-pill px-3 transition-all ${
                  activeCategory === cat
                    ? 'btn-primary text-white shadow-sm'
                    : 'btn-light text-secondary border'
                }`}
                style={{ fontSize: '0.78rem', fontWeight: 600 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="col-12 col-md-5">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <input
                type="text"
                placeholder="Search topics, tags, questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control form-control-sm"
              />
              <button type="submit" className="btn btn-sm btn-edu-secondary">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="row g-4">
        {/* Left Posts Feed */}
        <div className="col-12 col-lg-8">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted small">Loading community feed...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card-clean p-5 text-center bg-white">
              <i className="bi bi-chat-dots fs-1 text-secondary opacity-50 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No community discussions found</h5>
              <p className="text-muted small mb-3">
                Be the first to ask a question, share a study summary, or showcase a learning project!
              </p>
              <button onClick={() => setShowModal(true)} className="btn-edu-primary mx-auto">
                Start First Topic
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {posts.map((post) => {
                const isLiked = post.likes?.includes(user?.userId)
                const showCommentSection = openComments[post._id]

                return (
                  <div key={post._id} className="card-clean p-4 bg-white">
                    {/* Post Author Bar */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor:
                              post.authorRole === 'teacher'
                                ? '#0284C7'
                                : post.authorRole === 'institute'
                                ? '#059669'
                                : 'var(--edu-primary)',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        >
                          {post.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="lh-sm">
                          <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                            {post.authorRole !== 'learner' && (post.authorUsername || post.authorId) ? (
                              <Link
                                to={`/${post.authorRole === 'institute' ? 'institute' : 'teacher'}/${post.authorUsername || post.authorId?._id || post.authorId}`}
                                className="text-dark text-decoration-none hover-primary"
                                title="View Public Profile"
                              >
                                {post.authorName}
                              </Link>
                            ) : (
                              <span>{post.authorName}</span>
                            )}
                            <span
                              className={`badge rounded-pill text-capitalize ${
                                post.authorRole === 'teacher'
                                  ? 'bg-info-subtle text-info-emphasis'
                                  : post.authorRole === 'institute'
                                  ? 'bg-success-subtle text-success'
                                  : 'bg-primary-subtle text-primary'
                              }`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              {post.authorRole}
                            </span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-secondary border small">
                          {post.category}
                        </span>
                        {(user?.userId === post.authorId || user?.accountType === 'institute') && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn btn-sm text-danger border-0 p-1"
                            title="Remove"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Body */}
                    <h5 className="fw-bold text-dark mt-2 mb-2">{post.title}</h5>
                    <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="d-flex gap-1 flex-wrap mb-3">
                        {post.tags.map((tg, i) => (
                          <span key={i} className="badge bg-light text-muted border small">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar (Like, Comment, Share) */}
                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <div className="d-flex align-items-center gap-3">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`btn btn-sm border-0 d-flex align-items-center gap-1 ${
                            isLiked ? 'text-danger fw-bold' : 'text-secondary'
                          }`}
                        >
                          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                          <span>{post.likes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() =>
                            setOpenComments({
                              ...openComments,
                              [post._id]: !showCommentSection
                            })
                          }
                          className="btn btn-sm border-0 text-secondary d-flex align-items-center gap-1"
                        >
                          <i className="bi bi-chat-left-text"></i>
                          <span>{post.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href)
                          showAlert('Discussion topic link copied to clipboard!', 'Link Copied', 'info')
                        }}
                        className="btn btn-sm text-secondary border-0 p-1"
                        title="Share link"
                      >
                        <i className="bi bi-share"></i>
                      </button>
                    </div>

                    {/* Expandable Comments Drawer */}
                    {showCommentSection && (
                      <div className="mt-3 pt-3 border-top bg-light p-3 rounded-3">
                        <h6 className="fw-bold small mb-2 text-dark">Discussion Replies</h6>

                        {/* List of comments */}
                        <div className="d-flex flex-column gap-2 mb-3">
                          {post.comments?.length === 0 ? (
                            <div className="text-muted small fst-italic">No replies yet. Join the conversation!</div>
                          ) : (
                            post.comments?.map((cm, cidx) => (
                              <div key={cidx} className="p-2 rounded bg-white border">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  {cm.authorRole !== 'learner' && (cm.authorUsername || cm.authorId) ? (
                                    <Link
                                      to={`/${cm.authorRole === 'institute' ? 'institute' : 'teacher'}/${cm.authorUsername || cm.authorId?._id || cm.authorId}`}
                                      className="small fw-bold text-dark text-decoration-none hover-primary"
                                      title="View Public Profile"
                                    >
                                      {cm.authorName}
                                    </Link>
                                  ) : (
                                    <strong className="small text-dark">{cm.authorName}</strong>
                                  )}
                                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                                    {new Date(cm.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="small text-secondary">{cm.text}</div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add comment input */}
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Write an insightful reply..."
                            value={commentInputs[post._id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post._id)
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="btn btn-sm btn-primary rounded-3 text-nowrap px-3"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Guidelines & Trending Study Topics */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Community Standards */}
            <div className="card-clean p-4 bg-white">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-patch-check text-primary"></i> Academic Community Rules
              </h6>
              <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2 text-success mt-1"></i>
                  <span>Post academic queries with clear code/problem context.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2 text-success mt-1"></i>
                  <span>Share verified study notes and accredited references.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2 text-success mt-1"></i>
                  <span>Respect mentors, faculty, and collaborative peers.</span>
                </li>
              </ul>
            </div>

            {/* Quick Study Groups Widget */}
            <div className="card-clean p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-compass text-primary"></i> Popular Study Channels
              </h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                  <span className="small fw-semibold text-dark">#Algorithms & DS</span>
                  <span className="badge bg-primary-subtle text-primary">Active</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                  <span className="small fw-semibold text-dark">#MachineLearning</span>
                  <span className="badge bg-secondary-subtle text-secondary">32 Topics</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                  <span className="small fw-semibold text-dark">#WebDevelopment</span>
                  <span className="badge bg-secondary-subtle text-secondary">18 Topics</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light">
                  <span className="small fw-semibold text-dark">#Calculus-Physics</span>
                  <span className="badge bg-secondary-subtle text-secondary">24 Topics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Post */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create Community Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreatePost}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Title <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. How to implement Dijkstra algorithm in Python?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Question & Doubt">Question & Doubt</option>
                        <option value="Study Resource">Study Resource</option>
                        <option value="Project Showcase">Project Showcase</option>
                        <option value="Discussion">Discussion</option>
                        <option value="Achievement">Achievement</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        Tags (comma-separated) <span className="optional-tag">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="python, algorithms"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Content <span className="required-star">*</span>
                    </label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Detail your question, project context, or resource summary..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={publishing}
                      className="btn btn-primary rounded-3"
                    >
                      {publishing ? 'Publishing...' : 'Publish to Feed'}
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

export default Community
