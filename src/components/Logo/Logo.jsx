import logoImg from '../../assets/logo.png'

function Logo({ size = 36, variant = 'full', theme = 'default', className = '' }) {
  // Height calculated from size prop
  const height = size
  // The original image aspect ratio is 1024 / 177 ≈ 5.785
  const fullWidth = Math.round(height * 5.785)

  if (variant === 'icon') {
    return (
      <div
        className={`d-inline-flex align-items-center justify-content-center overflow-hidden ${className}`}
        style={{
          width: `${height}px`,
          height: `${height}px`,
          flexShrink: 0
        }}
      >
        <img
          src={logoImg}
          alt="EduAdapt Icon"
          style={{
            height: `${height}px`,
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'cover',
            objectPosition: 'left center'
          }}
        />
      </div>
    )
  }

  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={{ flexShrink: 0 }}>
      <img
        src={logoImg}
        alt="EduAdapt"
        style={{
          height: `${height}px`,
          width: 'auto',
          maxWidth: `${fullWidth}px`,
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  )
}

export default Logo
