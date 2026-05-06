export default function Banner() {
  return (
    <div className="banner">
      <div className="banner-pattern" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e53e3e" strokeWidth="0.3" opacity="0.15"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <polygon points="900,0 1400,0 1400,500 800,500" fill="#e53e3e" opacity="0.04"/>
          <polygon points="1000,0 1400,0 1400,300" fill="#e53e3e" opacity="0.06"/>
          <line x1="850" y1="0" x2="650" y2="500" stroke="#e53e3e" strokeWidth="1" opacity="0.1"/>
          <line x1="1000" y1="0" x2="800" y2="500" stroke="#e53e3e" strokeWidth="0.5" opacity="0.07"/>
        </svg>
      </div>

      <div className="banner-overlay">
        <div className="banner-content">
          <div className="banner-badge">🚨 โปรโมชั่นพิเศษ</div>
          <h1 className="banner-title">
            เติมเกมราคา<span className="text-red">คู้บอน</span>
          </h1>
          <p className="banner-sub">ร้านอันดับ #1 เติมเกมคู้บอน<br/>บริษัทพี่เจมส์และพี่บูม</p>
          <div className="banner-tags">
            <span>✓ รวดเร็ว</span>
            <span>✓ ปลอดภัย</span>
            <span>✓ 24 ชั่วโมง</span>
          </div>
          <a href="/topup" className="banner-btn">เติมเงินเลย →</a>
        </div>

        <div className="banner-right">
          <div className="banner-shield">
            <svg viewBox="0 0 120 140" width="180" height="210">
              <polygon points="60,5 115,30 115,85 60,135 5,85 5,30" fill="#1a1a1a" stroke="#e53e3e" strokeWidth="2.5"/>
              <polygon points="60,18 102,38 102,80 60,120 18,80 18,38" fill="#111" stroke="#e53e3e" strokeWidth="1" opacity="0.6"/>
              <text x="60" y="72" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#e53e3e">K</text>
              <text x="60" y="95" textAnchor="middle" fontSize="9" fill="#aaa" letterSpacing="3">KAYAMAN</text>
            </svg>
          </div>
          <div className="banner-stat">
            <div className="stat-item">
              <span className="stat-num">#1</span>
              <span className="stat-label">ร้านเติมเกมคู้บอน</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">24H</span>
              <span className="stat-label">เปิดตลอด</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
