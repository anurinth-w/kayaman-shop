import { useState, useEffect, useRef } from 'react'
import '../styles/banner.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

function proxyImg(url) {
  if (!url) return ''
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `${WORKER_URL}?action=getImage&fileId=${match[1]}`
  return url
}

export default function Banner() {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef(null)
  const slideshowRef = useRef(null)

  useEffect(() => {
    fetch(`${WORKER_URL}?action=getBanners`)
      .then(r => r.json())
      .then(d => setBanners(d.banners || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => goTo((current + 1) % banners.length), 8000)
    return () => clearInterval(timerRef.current)
  }, [banners, current])

  useEffect(() => {
    if (banners.length === 0) return
    banners.forEach(banner => {
      const img = new Image()
      img.src = proxyImg(banner.imageUrl)
    })
  }, [banners])

  const goTo = (i) => {
    if (fading || i === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(i)
      setTimeout(() => setFading(false), 300)
    }, 300)
    clearInterval(timerRef.current)
  }

  // detect swipe
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (!touchStartX.current) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      if (dx > 0) goTo((current + 1) % banners.length)
      else goTo((current - 1 + banners.length) % banners.length)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div className="banner">
      <div className="banner-left">
        <div className="banner-pattern" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e53e3e" strokeWidth="0.3" opacity="0.15"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        <div className="banner-content">
          <h1 className="banner-title">
            เติมเกมราคา<span className="text-red">คู้บอน</span>
          </h1>
          <p className="banner-sub">ร้านอันดับ #1 เติมเกมคู้บอน<br/>บริษัทพี่เจมส์และพี่บูม</p>
          <div className="banner-tags">
            <span>✓ รวดเร็ว</span>
            <span>✓ ปลอดภัย</span>
            <span>✓ 24 ชั่วโมง</span>
          </div>
          <a href="/" className="banner-btn">เติมเงินเลย →</a>
        </div>
      </div>

      <div
        className="banner-right"
        ref={slideshowRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{userSelect:'none', WebkitUserSelect:'none'}}
      >
        {banners.length > 0 ? (
          <div className="banner-slideshow">
            <div className={`banner-fade-overlay ${fading ? 'active' : ''}`} />
            {banners.map((banner, i) => (
              <img
                key={i}
                src={proxyImg(banner.imageUrl)}
                alt={banner.title}
                className={`banner-slide-img ${i === current ? 'slide-active' : 'slide-hidden'}`}
                onError={e => e.target.style.display = 'none'}
                draggable={false}
              />
            ))}
            {banners.length > 1 && (
              <div className="banner-dots">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    className={`banner-dot ${i === current ? 'active' : ''}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="banner-placeholder">
            <svg viewBox="0 0 120 140" width="180" height="210">
              <polygon points="60,5 115,30 115,85 60,135 5,85 5,30" fill="#1a1a1a" stroke="#e53e3e" strokeWidth="2.5"/>
              <polygon points="60,18 102,38 102,80 60,120 18,80 18,38" fill="#111" stroke="#e53e3e" strokeWidth="1" opacity="0.6"/>
              <text x="60" y="72" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#e53e3e">K</text>
              <text x="60" y="95" textAnchor="middle" fontSize="9" fill="#aaa" letterSpacing="3">KAYAMAN</text>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
