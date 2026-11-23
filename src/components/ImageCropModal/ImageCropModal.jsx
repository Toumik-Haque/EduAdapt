import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Modern Light-Themed Image Crop Studio
 * - Clean, elegant Apple-style light aesthetic (white card, soft shadows, purple accents)
 * - Strict boundary clamping: the image ALWAYS completely covers the crop box!
 * - Never shows outside blank / black areas beyond image boundaries
 * - Zoom slider automatically starts at the minimum scale needed to cover the box
 * - Smooth drag with boundary resistance
 * - Supports rotation (90 deg) and re-clamps bounds
 * - Exports sharp, pixel-perfect crop output
 */
export default function ImageCropModal({
  imageSrc,
  aspectRatio = 16 / 9,
  title = 'Adjust Photo Framing',
  onCropComplete,
  onCancel
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [naturalDims, setNaturalDims] = useState({ width: 0, height: 0 })
  const [containerDims, setContainerDims] = useState({ width: 560, height: 315 })

  const imgRef = useRef(null)
  const containerRef = useRef(null)

  // Measure container viewport on mount & resize
  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setContainerDims({ width: rect.width, height: rect.height })
    }
  }, [aspectRatio, imageLoaded])

  // Get effective image dimensions considering rotation
  const getRotatedDims = useCallback(() => {
    const isSideways = rotation === 90 || rotation === 270
    const w = isSideways ? naturalDims.height : naturalDims.width
    const h = isSideways ? naturalDims.width : naturalDims.height
    return { width: w, height: h }
  }, [rotation, naturalDims])

  // Clamp offset so the crop box is ALWAYS completely covered by the image
  const clampOffset = useCallback(
    (candX, candY, currentZoom) => {
      const { width: imgW, height: imgH } = getRotatedDims()
      if (!imgW || !imgH || !containerDims.width || !containerDims.height) {
        return { x: 0, y: 0 }
      }

      // Base display scale so image covers the container at zoom = 1
      const scaleCover = Math.max(
        containerDims.width / imgW,
        containerDims.height / imgH
      )

      const displayW = imgW * scaleCover * currentZoom
      const displayH = imgH * scaleCover * currentZoom

      // Max offset allows image edges to reach container edges, but not inside
      const maxOffsetX = Math.max(0, (displayW - containerDims.width) / 2)
      const maxOffsetY = Math.max(0, (displayH - containerDims.height) / 2)

      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, candX)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, candY))
      }
    },
    [getRotatedDims, containerDims]
  )

  // When image loads or aspect ratio / rotation changes, reset & clamp
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [imageSrc, rotation, aspectRatio])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const rawX = e.clientX - dragStart.x
    const rawY = e.clientY - dragStart.y
    const clamped = clampOffset(rawX, rawY, zoom)
    setOffset(clamped)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      })
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    const rawX = e.touches[0].clientX - dragStart.x
    const rawY = e.touches[0].clientY - dragStart.y
    const clamped = clampOffset(rawX, rawY, zoom)
    setOffset(clamped)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom)
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  const handleConfirmCrop = () => {
    if (!imgRef.current || !containerRef.current) return

    const img = imgRef.current
    const { width: imgW, height: imgH } = getRotatedDims()

    const scaleCover = Math.max(
      containerDims.width / imgW,
      containerDims.height / imgH
    )

    const totalScale = scaleCover * zoom
    const displayW = imgW * totalScale
    const displayH = imgH * totalScale

    // Position of crop box relative to rotated image center
    // Left edge of container relative to image left edge
    const imageLeftInContainer = (containerDims.width - displayW) / 2 + offset.x
    const imageTopInContainer = (containerDims.height - displayH) / 2 + offset.y

    // In rotated image pixels
    const cropXInRotated = (-imageLeftInContainer) / totalScale
    const cropYInRotated = (-imageTopInContainer) / totalScale
    const cropWInRotated = containerDims.width / totalScale
    const cropHInRotated = containerDims.height / totalScale

    // Target output dimensions
    const targetW = aspectRatio === 1 ? 800 : 1600
    const targetH = Math.round(targetW / aspectRatio)

    // First draw rotated natural image to an intermediate canvas
    const rotCanvas = document.createElement('canvas')
    rotCanvas.width = imgW
    rotCanvas.height = imgH
    const rotCtx = rotCanvas.getContext('2d')

    rotCtx.save()
    rotCtx.translate(imgW / 2, imgH / 2)
    rotCtx.rotate((rotation * Math.PI) / 180)
    rotCtx.drawImage(
      img,
      -naturalDims.width / 2,
      -naturalDims.height / 2,
      naturalDims.width,
      naturalDims.height
    )
    rotCtx.restore()

    // Second canvas: slice exact clamped region
    const outCanvas = document.createElement('canvas')
    outCanvas.width = targetW
    outCanvas.height = targetH
    const outCtx = outCanvas.getContext('2d')
    outCtx.imageSmoothingEnabled = true
    outCtx.imageSmoothingQuality = 'high'

    outCtx.drawImage(
      rotCanvas,
      Math.max(0, cropXInRotated),
      Math.max(0, cropYInRotated),
      Math.min(imgW, cropWInRotated),
      Math.min(imgH, cropHInRotated),
      0,
      0,
      targetW,
      targetH
    )

    outCanvas.toBlob(
      (blob) => {
        if (!blob) return
        const croppedFile = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        const previewUrl = URL.createObjectURL(blob)
        onCropComplete(croppedFile, previewUrl)
      },
      'image/jpeg',
      0.94
    )
  }

  const isSquare = aspectRatio === 1

  // Calculate style dimensions to make sure image always covers container
  const { width: rotW, height: rotH } = getRotatedDims()
  const scaleCover =
    rotW && rotH && containerDims.width && containerDims.height
      ? Math.max(containerDims.width / rotW, containerDims.height / rotH)
      : 1
  const renderWidth = rotW ? rotW * scaleCover * zoom : '100%'
  const renderHeight = rotH ? rotH * scaleCover * zoom : '100%'

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 p-md-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1060,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: isSquare ? '480px' : '660px',
          borderRadius: '20px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Clean Light Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-primary"
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--brand-100)',
                color: 'var(--brand-700)'
              }}
            >
              <i className="bi bi-crop fs-5" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.01em' }}>
                  {title}
                </h6>
                <span
                  className="badge rounded-pill"
                  style={{
                    background: 'var(--brand-100)',
                    color: 'var(--brand-700)',
                    fontSize: '10px',
                    fontWeight: 600
                  }}
                >
                  {isSquare ? '1:1 Square' : '16:9 Banner'}
                </span>
              </div>
              <span className="text-secondary small" style={{ fontSize: '11px' }}>
                Drag image to position • Image stays strictly inside bounds
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary border-0"
            style={{ width: '32px', height: '32px' }}
            onClick={onCancel}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Framing Viewport Stage (Clean Studio Surface) */}
        <div
          className="position-relative p-3 p-md-4 d-flex align-items-center justify-content-center"
          style={{
            background: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9'
          }}
        >
          {/* Active Crop Box with Strict Bounds */}
          <div
            ref={containerRef}
            className="position-relative overflow-hidden shadow-sm"
            style={{
              width: '100%',
              maxWidth: isSquare ? '300px' : '560px',
              aspectRatio: `${aspectRatio}`,
              borderRadius: isSquare ? '18px' : '14px',
              backgroundColor: '#E2E8F0',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
              border: '2px solid #7C3AED'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Rule of Thirds Grid Guide */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
              style={{
                zIndex: 4,
                backgroundImage: `
                  linear-gradient(to right, rgba(124, 58, 237, 0.25) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(124, 58, 237, 0.25) 1px, transparent 1px)
                `,
                backgroundSize: '33.333% 33.333%'
              }}
            />

            {/* Corner Bracket Accents */}
            <div
              className="position-absolute top-0 start-0 m-1 pointer-events-none"
              style={{
                width: '12px',
                height: '12px',
                borderTop: '3px solid #7C3AED',
                borderLeft: '3px solid #7C3AED',
                borderRadius: '2px 0 0 0',
                zIndex: 5
              }}
            />
            <div
              className="position-absolute top-0 end-0 m-1 pointer-events-none"
              style={{
                width: '12px',
                height: '12px',
                borderTop: '3px solid #7C3AED',
                borderRight: '3px solid #7C3AED',
                borderRadius: '0 2px 0 0',
                zIndex: 5
              }}
            />
            <div
              className="position-absolute bottom-0 start-0 m-1 pointer-events-none"
              style={{
                width: '12px',
                height: '12px',
                borderBottom: '3px solid #7C3AED',
                borderLeft: '3px solid #7C3AED',
                borderRadius: '0 0 0 2px',
                zIndex: 5
              }}
            />
            <div
              className="position-absolute bottom-0 end-0 m-1 pointer-events-none"
              style={{
                width: '12px',
                height: '12px',
                borderBottom: '3px solid #7C3AED',
                borderRight: '3px solid #7C3AED',
                borderRadius: '0 0 2px 0',
                zIndex: 5
              }}
            />

            {/* The Clamped Image Display: Center-positioned + Offset */}
            <div
              className="position-absolute top-50 start-50"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                width: renderWidth,
                height: renderHeight,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                pointerEvents: 'none'
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source preview"
                onLoad={(e) => {
                  setImageLoaded(true)
                  setNaturalDims({
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight
                  })
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        {/* Light Controls & Tools Toolbar */}
        <div className="px-4 py-3 bg-white">
          <div className="d-flex align-items-center justify-content-between gap-3 mb-2 flex-wrap">
            {/* Zoom Slider */}
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: '200px' }}>
              <i className="bi bi-zoom-out text-secondary" style={{ fontSize: '13px' }} />
              <input
                type="range"
                className="form-range flex-grow-1"
                min="1"
                max="2.5"
                step="0.02"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                style={{ accentColor: '#7C3AED', cursor: 'pointer' }}
              />
              <i className="bi bi-zoom-in text-secondary" style={{ fontSize: '13px' }} />
              <span
                className="badge bg-light text-dark border px-2 py-1 font-monospace"
                style={{ fontSize: '11px', minWidth: '44px', textAlign: 'center' }}
              >
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate & Reset */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="btn btn-sm btn-light border rounded-pill px-3 py-1 d-flex align-items-center gap-1 text-secondary"
                style={{ fontSize: '12px' }}
                title="Rotate 90 degrees"
              >
                <i className="bi bi-arrow-clockwise text-primary" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-sm btn-light border rounded-pill px-3 py-1 d-flex align-items-center gap-1 text-secondary"
                style={{ fontSize: '12px' }}
                title="Reset crop"
              >
                <i className="bi bi-arrow-counterclockwise" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: '11px' }}>
            <span>
              Original: {naturalDims.width} × {naturalDims.height} px
            </span>
            <span className="fw-semibold text-primary">
              Output: {isSquare ? '800 × 800' : '1600 × 900'} px (High Definition)
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-top bg-light">
          <button
            type="button"
            className="btn btn-light rounded-pill px-4 py-2 text-secondary fw-semibold border"
            style={{ fontSize: '13px' }}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 py-2 text-white fw-semibold shadow-sm d-flex align-items-center gap-2"
            style={{
              background: '#7C3AED',
              border: 'none',
              fontSize: '13px',
              cursor: imageLoaded ? 'pointer' : 'not-allowed'
            }}
            onClick={handleConfirmCrop}
            disabled={!imageLoaded}
          >
            <i className="bi bi-check2" />
            <span>Apply Crop & Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}
