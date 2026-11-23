import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function FloatingExitTestButton({ testServerPort = 5050 }) {
  const { user: currentLoggedInUser, login, logout } = useAuth()
  const navigate = useNavigate()

  const [isTestRunning, setIsTestRunning] = useState(false)
  const [shuttingDown, setShuttingDown] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState('institutions') // 'institutions' | 'teachers' | 'students'
  const [searchFilter, setSearchFilter] = useState('')

  // Dragging coordinates state
  const [pos, setPos] = useState(() => {
    return { x: window.innerWidth - 220, y: window.innerHeight - 85 }
  })
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Probe whether test server is running on separate port (5050)
  const checkTestServer = async () => {
    try {
      const res = await fetch(`http://localhost:${testServerPort}/api/test-environment/summary`)
      if (res.ok) {
        const data = await res.json()
        setIsTestRunning(true)
        setMetrics(data)
      } else {
        setIsTestRunning(false)
      }
    } catch {
      setIsTestRunning(false)
    }
  }

  useEffect(() => {
    checkTestServer()
    const timer = setInterval(checkTestServer, 4000)
    return () => clearInterval(timer)
  }, [testServerPort])

  // Stop / Shutdown Test Run
  const handleExitTestRun = async () => {
    if (!window.confirm('Stop and terminate the EduAdapt test run server?')) return
    try {
      setShuttingDown(true)
      await fetch(`http://localhost:${testServerPort}/api/test-environment/shutdown`, {
        method: 'POST'
      })
      alert('Test environment shutdown signal sent.')
      setIsTestRunning(false)
      setShowDrawer(false)
    } catch (err) {
      console.error(err)
      setIsTestRunning(false)
    } finally {
      setShuttingDown(false)
    }
  }

  // 1-Click Login into ANY test user account
  const handleQuickLogin = (testUser) => {
    const isTeacher = testUser.accountType === 'teacher'
    const isInst = testUser.accountType === 'institute'
    const isLearner = testUser.accountType === 'learner'

    const simulatedSession = {
      token: `mock-jwt-token-${testUser._id}`,
      user: {
        userId: testUser._id,
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        accountType: testUser.accountType
      },
      profile: {
        fullName: testUser.name,
        instituteName: isInst ? testUser.name : undefined,
        institutionId: testUser.institutionId,
        subject: testUser.subject,
        department: isInst ? testUser.type : undefined
      }
    }

    login(simulatedSession)

    // Route to appropriate dashboard
    if (isLearner) {
      navigate('/learner')
    } else if (isTeacher) {
      navigate('/teacher')
    } else if (isInst) {
      navigate('/institute')
    }

    setShowDrawer(false)
  }

  // Quick Logout
  const handleQuickLogout = () => {
    logout()
    navigate('/')
    setShowDrawer(false)
  }

  // Mouse / Touch Drag handlers
  const handleMouseDown = (e) => {
    isDragging.current = true
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const newX = Math.min(window.innerWidth - 200, Math.max(10, e.clientX - dragOffset.current.x))
    const newY = Math.min(window.innerHeight - 55, Math.max(10, e.clientY - dragOffset.current.y))
    setPos({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    isDragging.current = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      dragOffset.current = {
        x: e.touches[0].clientX - pos.x,
        y: e.touches[0].clientY - pos.y
      }
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current || e.touches.length !== 1) return
    const newX = Math.min(window.innerWidth - 200, Math.max(10, e.touches[0].clientX - dragOffset.current.x))
    const newY = Math.min(window.innerHeight - 55, Math.max(10, e.touches[0].clientY - dragOffset.current.y))
    setPos({ x: newX, y: newY })
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  if (!isTestRunning) {
    return null
  }

  // Filter lists based on search
  const filteredInstitutions = (metrics?.institutions || []).filter((i) =>
    i.name.toLowerCase().includes(searchFilter.toLowerCase())
  )
  const filteredTeachers = (metrics?.teachers || []).filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchFilter.toLowerCase())
  )
  const filteredStudents = (metrics?.students || []).filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <>
      {/* Floating Movable Button */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 99999,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        className="d-flex align-items-center gap-1 shadow-lg rounded-pill p-1 bg-white border border-danger animate-fade-in"
      >
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className="btn btn-sm btn-light rounded-pill px-2 py-1 text-danger fw-bold d-flex align-items-center gap-1"
          style={{ fontSize: '0.76rem' }}
          title="Click to Switch Accounts or Inspect Test Environment"
        >
          <span
            className="spinner-grow spinner-grow-sm text-danger"
            style={{ width: '8px', height: '8px' }}
          ></span>
          <span>Test Hub</span>
        </button>

        <button
          onClick={handleExitTestRun}
          disabled={shuttingDown}
          className="btn btn-sm btn-danger rounded-pill px-3 py-1 fw-bold shadow-sm"
          style={{ fontSize: '0.76rem' }}
          title="Stop and terminate the test runner file"
        >
          {shuttingDown ? 'Stopping...' : 'Exit Test'}
        </button>
      </div>

      {/* Test Environment Control & Quick User Switcher Modal */}
      {showDrawer && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-danger rounded-pill px-3 py-1">Port {testServerPort} Active</span>
                  <h6 className="modal-title fw-bold text-dark mb-0">
                    EduAdapt Test Environment & User Switcher
                  </h6>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDrawer(false)}
                ></button>
              </div>

              {/* Current Active Session Status */}
              <div className="px-4 py-2 bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary small">Active Session:</span>
                  {currentLoggedInUser ? (
                    <span className="badge bg-primary-subtle text-primary border d-flex align-items-center gap-1">
                      <i className="bi bi-person-check-fill"></i>
                      <strong>{currentLoggedInUser.name}</strong> ({currentLoggedInUser.accountType})
                    </span>
                  ) : (
                    <span className="badge bg-secondary-subtle text-secondary">
                      No active login (Guest)
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2">
                  {currentLoggedInUser && (
                    <button
                      onClick={handleQuickLogout}
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i> Quick Sign Out
                    </button>
                  )}
                  <button
                    onClick={handleExitTestRun}
                    disabled={shuttingDown}
                    className="btn btn-sm btn-danger rounded-pill px-3 fw-bold"
                  >
                    {shuttingDown ? 'Stopping...' : 'Terminate Test Server'}
                  </button>
                </div>
              </div>

              {/* Tabs & Search */}
              <div className="px-4 pt-3 pb-2 bg-light border-bottom">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <ul className="nav nav-pills gap-1">
                    <li className="nav-item">
                      <button
                        onClick={() => setActiveTab('institutions')}
                        className={`nav-link py-1 px-3 rounded-pill small fw-semibold ${
                          activeTab === 'institutions' ? 'active' : 'text-secondary'
                        }`}
                      >
                        Institutions (3)
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        onClick={() => setActiveTab('teachers')}
                        className={`nav-link py-1 px-3 rounded-pill small fw-semibold ${
                          activeTab === 'teachers' ? 'active' : 'text-secondary'
                        }`}
                      >
                        Teachers (16)
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        onClick={() => setActiveTab('students')}
                        className={`nav-link py-1 px-3 rounded-pill small fw-semibold ${
                          activeTab === 'students' ? 'active' : 'text-secondary'
                        }`}
                      >
                        Students (50)
                      </button>
                    </li>
                  </ul>

                  <input
                    type="text"
                    placeholder="Filter by name, subject..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ maxWidth: '240px' }}
                  />
                </div>
              </div>

              {/* List of Test Users with 1-Click Login */}
              <div className="modal-body p-4" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {activeTab === 'institutions' && (
                  <div className="d-flex flex-column gap-2">
                    {filteredInstitutions.map((inst) => {
                      const isCurrent = currentLoggedInUser?.userId === inst._id
                      return (
                        <div
                          key={inst._id}
                          className={`p-3 rounded-3 border d-flex justify-content-between align-items-center transition-all ${
                            isCurrent ? 'bg-primary-subtle border-primary' : 'bg-white'
                          }`}
                        >
                          <div>
                            <div className="fw-bold text-dark">{inst.name}</div>
                            <div className="small text-muted">
                              {inst.type} • {inst.location} • {inst.teachersCount} Faculty • {inst.studentsCount} Students
                            </div>
                          </div>
                          {isCurrent ? (
                            <span className="badge bg-primary text-white">Active Account</span>
                          ) : (
                            <button
                              onClick={() => handleQuickLogin(inst)}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              Login as Institute &rarr;
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'teachers' && (
                  <div className="d-flex flex-column gap-2">
                    {filteredTeachers.map((tch) => {
                      const isCurrent = currentLoggedInUser?.userId === tch._id
                      return (
                        <div
                          key={tch._id}
                          className={`p-3 rounded-3 border d-flex justify-content-between align-items-center transition-all ${
                            isCurrent ? 'bg-primary-subtle border-primary' : 'bg-white'
                          }`}
                        >
                          <div>
                            <div className="fw-bold text-dark">{tch.name}</div>
                            <div className="small text-muted">
                              Specialization: <strong>{tch.subject}</strong> • {tch.email}
                            </div>
                          </div>
                          {isCurrent ? (
                            <span className="badge bg-primary text-white">Active Account</span>
                          ) : (
                            <button
                              onClick={() => handleQuickLogin(tch)}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              Login as Teacher &rarr;
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="row g-2">
                    {filteredStudents.map((std) => {
                      const isCurrent = currentLoggedInUser?.userId === std._id
                      return (
                        <div key={std._id} className="col-12 col-md-6">
                          <div
                            className={`p-2 px-3 rounded-3 border d-flex justify-content-between align-items-center h-100 ${
                              isCurrent ? 'bg-primary-subtle border-primary' : 'bg-white'
                            }`}
                          >
                            <div className="overflow-hidden pe-2">
                              <div className="fw-bold text-dark small text-truncate">{std.name}</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {std.enrolledBatch} • {std.progress}% Progress
                              </div>
                            </div>
                            {isCurrent ? (
                              <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleQuickLogin(std)}
                                className="btn btn-sm btn-light border rounded-pill px-2 py-0 text-primary fw-semibold"
                                style={{ fontSize: '0.72rem' }}
                              >
                                Login
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer border-top py-2 px-4 bg-light d-flex justify-content-between">
                <span className="text-muted small">
                  69 Simulated Test Users Available (3 Institutes, 16 Teachers, 50 Students)
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary rounded-pill px-3"
                  onClick={() => setShowDrawer(false)}
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingExitTestButton
