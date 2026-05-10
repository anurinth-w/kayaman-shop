import { useState } from 'react'
import '../styles/howto.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

function proxyImg(url) {
  if (!url) return ''
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `${WORKER_URL}?action=getImage&fileId=${match[1]}`
  return url
}

export default function HowToSection({ images }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="howto-section">
      <div className="howto-header" onClick={() => setOpen(!open)}>
        <span>วิธีเติมเกมนี้</span>
        <span className={`howto-arrow ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="howto-images">
          {images.map((url, i) => (
            <img
              key={i}
              src={proxyImg(url)}
              alt={`วิธีเติม ขั้นตอนที่ ${i + 1}`}
              className="howto-img"
              onError={e => e.target.style.display = 'none'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
