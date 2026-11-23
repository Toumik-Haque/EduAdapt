import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function GlobalSearchBar() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        const headers = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        const res = await fetch(
          `http://localhost:5000/api/auth/search-profiles?q=${encodeURIComponent(query.trim())}`,
          { headers }
        )
        const data = await res.json()
        if (data.success) {
          setResults(data.results || [])
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Global search error:', err)
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, token])

  const handleSelectResult = (item) => {
    setIsOpen(false)
    setQuery('')

    const identifier = item.username || item.userId
    if (item.accountType === 'institute') {
      navigate(`/institute/${identifier}`)
    } else if (item.accountType === 'teacher') {
      navigate(`/teacher/${identifier}`)
    }
  }

  const getRoleBadge = (type) => {
    if (type === 'institute') {
      return (
        <span
          className="badge"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            background: '#DCFCE7',
            color: '#15803D',
            border: '1px solid #BBF7D0'
          }}
        >
          Campus
        </span>
      )
    }
    return (
      <span
        className="badge"
        style={{
          fontSize: '10px',
          fontWeight: 600,
          background: '#E0F2FE',
          color: '#0369A1',
          border: '1px solid #BAE6FD'
        }}
      >
        Teacher
      </span>
    )
  }

  return (
    <div ref={containerRef} className="position-relative" style={{ width: '100%', minWidth: '320px', maxWidth: '560px' }}>
      <div
        className="input-group input-group-sm shadow-xs"
        style={{
          height: '38px',
          borderRadius: '11px',
          overflow: 'hidden',
          borderColor: 'var(--border-hairline, #E4E4E7)',
          width: '100%'
        }}
      >
        <span
          className="input-group-text bg-white border-end-0 text-secondary ps-3 pe-2 d-flex align-items-center"
          style={{ borderColor: 'var(--border-hairline, #E4E4E7)', height: '38px', flexShrink: 0 }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '13px', height: '13px' }} />
          ) : (
            <i className="bi bi-search" style={{ fontSize: '13px' }} />
          )}
        </span>
        <input
          type="text"
          className="form-control border-start-0 px-2 bg-white flex-grow-1"
          style={{
            height: '38px',
            borderColor: 'var(--border-hairline, #E4E4E7)',
            fontSize: '13px',
            boxShadow: 'none',
            minWidth: 0
          }}
          placeholder="Search institute or teacher..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {query && (
          <button
            type="button"
            className="btn btn-white bg-white border-start-0 text-muted pe-3 d-flex align-items-center"
            style={{ borderColor: 'var(--border-hairline, #E4E4E7)', height: '38px' }}
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
          >
            <i className="bi bi-x-circle-fill" style={{ fontSize: '12px' }} />
          </button>
        )}
      </div>

      {/* Dropdown Floating Results Panel */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="position-absolute start-0 end-0 mt-2 bg-white rounded-4 shadow-xl border overflow-hidden animate-fade-in"
          style={{
            zIndex: 1050,
            maxHeight: '360px',
            overflowY: 'auto'
          }}
        >
          <div className="px-3 py-2 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="text-secondary fw-semibold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
              Public Profiles
            </span>
            <span className="text-muted" style={{ fontSize: '10px' }}>
              {results.length} found
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-4 text-center text-muted" style={{ fontSize: '12px' }}>
              {loading ? (
                <div>Searching platform accounts...</div>
              ) : (
                <>
                  <i className="bi bi-person-x fs-4 d-block mb-1 opacity-50" />
                  No matching institute or teacher found.
                </>
              )}
            </div>
          ) : (
            <div className="p-1">
              {results.map((item) => (
                <div
                  key={item.userId}
                  onClick={() => handleSelectResult(item)}
                  className="d-flex align-items-center justify-content-between p-2 rounded-3"
                  style={{
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{
                        width: '34px',
                        height: '34px',
                        background:
                          item.accountType === 'institute'
                            ? '#059669'
                            : item.accountType === 'teacher'
                            ? '#0284C7'
                            : '#7C3AED',
                        fontSize: '13px',
                        fontWeight: 600,
                        overflow: 'hidden'
                      }}
                    >
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        item.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '12px' }}>
                        {item.name}
                      </div>
                      <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                        {item.username ? `@${item.username}` : item.email}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                    {getRoleBadge(item.accountType)}
                    <i className="bi bi-chevron-right text-muted" style={{ fontSize: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
