/**
 * EduAdapt Brand Logo
 * Concept: An open graduation cap / book shape interlocking with an adaptive upward loop/chevron,
 * symbolizing dynamic learning growth and academic precision.
 */
function Logo({ size = 36, variant = 'full', theme = 'default', className = '' }) {
  const isLight = theme === 'light'
  const textColor = isLight ? '#FFFFFF' : '#0F172A'
  const purplePrimary = '#6D28D9'
  const purpleSecondary = '#8B5CF6'
  const purpleAccent = '#C4B5FD'

  // Icon SVG
  const Icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      className={className}
    >
      <defs>
        <linearGradient id="eduGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="chevronGradient" x1="14" y1="20" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Rounded squircle container */}
      <rect width="48" height="48" rx="14" fill="url(#eduGradient)" />

      {/* Modern Academic Crest / Adaptive Delta Node */}
      {/* Top Cap Diamond */}
      <path
        d="M24 11L38 18.5L24 26L10 18.5L24 11Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />

      {/* Adaptive Ribbon / Growth Chevrons */}
      <path
        d="M17 22.5V30.5C17 33.5 20.1 36 24 36C27.9 36 31 33.5 31 30.5V22.5L24 26.5L17 22.5Z"
        fill="url(#chevronGradient)"
      />

      {/* Tassel Dot & Trailing Accent */}
      <path
        d="M38 19V29C38 29.8 37.5 30.5 36.8 30.8"
        stroke="#E9D5FF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="36.8" cy="31.8" r="1.5" fill="#FDE047" />
    </svg>
  )

  if (variant === 'icon') {
    return Icon
  }

  // Wordmark + Icon
  return (
    <div className={`d-inline-flex align-items-center gap-2 ${className}`}>
      {Icon}
      <div className="d-flex flex-column lh-1">
        <span
          className="fw-extrabold tracking-tight"
          style={{
            fontSize: size * 0.58,
            color: textColor,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ color: purplePrimary }}>Edu</span>
          <span>Adapt</span>
        </span>
      </div>
    </div>
  )
}

export default Logo
