import { useState } from 'react'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

function proxyImg(url) {
  if (!url) return ''
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `${WORKER_URL}?action=getImage&fileId=${match[1]}`
  return url
}

function PkgDetailPopup({ pkg, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pkg-popup" onClick={e => e.stopPropagation()}>
        <div className="pkg-popup-header">
          <span>{pkg.pkg}</span>
          <button className="pkg-popup-close" onClick={onClose}>×</button>
        </div>
        {pkg.imageUrl && (
          <img src={proxyImg(pkg.imageUrl)} alt={pkg.pkg} className="pkg-popup-img"
            onError={e => e.target.style.display = 'none'} />
        )}
        {pkg.description && (
          <p className="pkg-popup-desc">{pkg.description}</p>
        )}
        <div className="pkg-popup-price">
          {pkg.oldPrice > 0 && (
            <span className="pkg-old-price">฿{Number(pkg.oldPrice).toLocaleString()}</span>
          )}
          <span className="pkg-new-price">฿{Number(pkg.price).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function PkgCard({ pkg, onAdd }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div className="pkg-card">
        <div className="pkg-card-header">
          <span className="pkg-name">{pkg.pkg}</span>
          {(pkg.description || pkg.imageUrl) && (
            <button className="pkg-info-btn" onClick={() => setShowDetail(true)}>?</button>
          )}
        </div>
        {pkg.imageUrl ? (
          <img src={proxyImg(pkg.imageUrl)} alt={pkg.pkg} className="pkg-icon"
            onError={e => e.target.style.display = 'none'} />
        ) : (
          <div className="pkg-icon-placeholder">🎮</div>
        )}
        <div className="pkg-prices">
          {pkg.oldPrice > 0 && (
            <span className="pkg-old-price">฿{Number(pkg.oldPrice).toLocaleString()}</span>
          )}
          <span className="pkg-price">฿{Number(pkg.price).toLocaleString()}</span>
        </div>
        <button className="pkg-btn" onClick={() => onAdd(pkg)}>เพิ่มลงตะกร้า</button>
      </div>

      {showDetail && (
        <PkgDetailPopup pkg={pkg} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}

export default function PackageGrid({ packages, onAdd }) {
  const grouped = packages.reduce((acc, pkg) => {
    const cat = pkg.category || 'แพ็คเกจ'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(pkg)
    return acc
  }, {})

  return (
    <div className="pkg-section">
      {Object.entries(grouped).map(([category, pkgs]) => (
        <div key={category} className="pkg-category">
          <h3 className="pkg-category-title">{category}</h3>
          <div className="pkg-grid">
            {pkgs.map((pkg, i) => (
              <PkgCard key={i} pkg={pkg} onAdd={onAdd} />
            ))}
          </div>
        </div>
      ))}

      <div className="pkg-category">
        <h3 className="pkg-category-title">อื่นๆ</h3>
        <div className="pkg-grid">
          <div className="pkg-card pkg-card-other"
            onClick={() => onAdd({ pkg: 'แพ็คเกจอื่นๆ', price: 0, isOther: true })}>
            <div className="pkg-card-header">
              <span className="pkg-name">ระบุแพ็คเกจเอง</span>
            </div>
            <div className="pkg-other-icon">📷</div>
            <div className="pkg-other-sub">อัปโหลดรูปแพ็คเกจ</div>
            <button className="pkg-btn">เลือก</button>
          </div>
        </div>
      </div>
    </div>
  )
}
