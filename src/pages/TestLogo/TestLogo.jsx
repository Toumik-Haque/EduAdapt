import { useState } from 'react'
import Logo from '../../components/Logo/Logo'
import { Link } from 'react-router-dom'

function TestLogo() {
  const [selectedBg, setSelectedBg] = useState('light')

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: selectedBg === 'light' ? '#F8F7FC' : selectedBg === 'dark' ? '#0F172A' : '#6D28D9',
        color: selectedBg === 'light' ? '#0F172A' : '#FFFFFF',
        transition: 'background-color 0.25s ease',
      }}
      className="py-5"
    >
      <div className="container py-4">
        {/* Navigation & Controls */}
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
          <div>
            <Link to="/" className="btn btn-sm btn-outline-secondary rounded-pill mb-2">
              <i className="bi bi-arrow-left me-1"></i> Return Home
            </Link>
            <h2 className="fw-bold mb-1">EduAdapt Brandmark & Test-Logo System</h2>
            <p className="small opacity-75 mb-0">
              Interactive design sheet displaying geometry, sizing scale, variations, and background contrasts.
            </p>
          </div>

          {/* Canvas Background Selector */}
          <div className="btn-group bg-white p-1 rounded-pill shadow-sm border">
            <button
              onClick={() => setSelectedBg('light')}
              className={`btn btn-sm rounded-pill px-3 ${selectedBg === 'light' ? 'btn-primary' : 'btn-light'}`}
            >
              Light Surface
            </button>
            <button
              onClick={() => setSelectedBg('dark')}
              className={`btn btn-sm rounded-pill px-3 ${selectedBg === 'dark' ? 'btn-dark' : 'btn-light'}`}
            >
              Dark Slate
            </button>
            <button
              onClick={() => setSelectedBg('brand')}
              className={`btn btn-sm rounded-pill px-3 ${selectedBg === 'brand' ? 'btn-light text-primary fw-bold' : 'btn-light'}`}
            >
              Brand Purple
            </button>
          </div>
        </div>

        {/* Section 1: Hero Logo Showcase */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-5" style={{ background: selectedBg === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.06)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3 small fw-semibold">
                Official Primary Brandmark
              </span>
              <div className="mb-3">
                <Logo size={56} theme={selectedBg === 'light' ? 'default' : 'light'} />
              </div>
              <p className="opacity-75 small">
                The mark combines a clean academic mortarboard with an ascending adaptive chevron. It signifies both institutional rigor and individualized forward progression.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-3 border bg-light text-dark">
                <div className="fw-bold small mb-2 text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  Design Geometry & Tokens
                </div>
                <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
                  <li className="d-flex justify-content-between">
                    <span className="text-secondary">Primary Tonal Value:</span>
                    <strong className="text-primary">#6D28D9 (EduAdapt Purple)</strong>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span className="text-secondary">Gradient Spectrum:</span>
                    <strong>#7C3AED &rarr; #5B21B6</strong>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span className="text-secondary">Geometry:</span>
                    <span>Diamond Cap & Delta Chevron</span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span className="text-secondary">Icon Ratio:</span>
                    <span>1:1 Squircle (rx=14 on 48px grid)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Size Hierarchy */}
        <h5 className="fw-bold mb-3">Scale & Responsiveness Hierarchy</h5>
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center" style={{ background: selectedBg === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.06)' }}>
              <div className="mb-3 d-flex justify-content-center">
                <Logo size={44} theme={selectedBg === 'light' ? 'default' : 'light'} />
              </div>
              <span className="badge bg-secondary-subtle text-secondary small">Large (44px) - Headers / Hero</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center" style={{ background: selectedBg === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.06)' }}>
              <div className="mb-3 d-flex justify-content-center">
                <Logo size={36} theme={selectedBg === 'light' ? 'default' : 'light'} />
              </div>
              <span className="badge bg-secondary-subtle text-secondary small">Medium (36px) - Navigation Bar</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center" style={{ background: selectedBg === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.06)' }}>
              <div className="mb-3 d-flex justify-content-center">
                <Logo size={28} theme={selectedBg === 'light' ? 'default' : 'light'} />
              </div>
              <span className="badge bg-secondary-subtle text-secondary small">Small (28px) - Mobile / Compact</span>
            </div>
          </div>
        </div>

        {/* Section 3: Icon-Only Avatar Mark */}
        <h5 className="fw-bold mb-3">Icon-Only Variants (Favicon, App Icon, Dock)</h5>
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: selectedBg === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.06)' }}>
          <div className="d-flex align-items-center justify-content-around flex-wrap gap-4 py-3">
            <div className="text-center">
              <Logo size={64} variant="icon" />
              <div className="small mt-2 opacity-75">64px App Tile</div>
            </div>
            <div className="text-center">
              <Logo size={48} variant="icon" />
              <div className="small mt-2 opacity-75">48px Profile/Tile</div>
            </div>
            <div className="text-center">
              <Logo size={36} variant="icon" />
              <div className="small mt-2 opacity-75">36px Standard</div>
            </div>
            <div className="text-center">
              <Logo size={24} variant="icon" />
              <div className="small mt-2 opacity-75">24px Favicon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestLogo
