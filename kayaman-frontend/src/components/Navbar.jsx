import { useState } from 'react'
import './../styles/navbar.css'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Navbar() {
    const [showComingSoon, setShowComingSoon] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header>
            {showComingSoon && (
                <div className="modal-backdrop" onClick={() => setShowComingSoon(false)}>
                    <div className="modal" style={{ width: '320px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚧</div>
                        <h3 className="modal-title">ยังไม่พร้อมให้บริการ</h3>
                        <p style={{ fontSize: '13px', color: 'var(--gray)', lineHeight: '1.8', marginBottom: '20px' }}>
                            ระบบสมาชิกกำลังอยู่ในระหว่างการพัฒนา<br />ติดตามข่าวสารได้เร็วๆ นี้นะครับ 🙏
                        </p>
                        <button className="modal-btn-confirm" style={{ width: '100%' }} onClick={() => setShowComingSoon(false)}>
                            ตกลง
                        </button>
                    </div>
                </div>
            )}

            <div className="topbar">
                <div className="topbar-left">
                    <a href="https://www.facebook.com/Kayamanshop/" target="_blank" rel="noreferrer">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#1877F2" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Kayaman Shop
                    </a>
                    <a href="#" style={{ cursor: 'default' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#06C755" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        @kayamanshop
                    </a>
                </div>
                <div className="topbar-right">
                    <a href="#" onClick={e => { e.preventDefault(); setShowComingSoon(true) }}>สมัครสมาชิก</a>
                    <a href="#" className="btn-login" onClick={e => { e.preventDefault(); setShowComingSoon(true) }}>เข้าสู่ระบบ</a>
                </div>
            </div>

            <nav className="navbar">
                <div className="navbar-brand">
                    <img src={logo} alt="Kayaman Shop" className="navbar-logo" />
                </div>
                <div className="navbar-links">
                    <NavLink to="/" end>หน้าแรก</NavLink>
                    <NavLink to="/topup">เติมเงินเกม</NavLink>
                    <NavLink to="/card">บัตรเติมเงิน</NavLink>
                    <NavLink to="/order">ตรวจสอบออเดอร์</NavLink>
                    <NavLink to="/news">ข่าวสาร</NavLink>
                    <NavLink to="/contact">ติดต่อทีมงาน</NavLink>
                </div>
                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            <div className="mobile-secondary-bar">
                <div className="mobile-bar-row-top">
                    <a href="#" onClick={e => { e.preventDefault(); setShowComingSoon(true) }}>👤 สมัครสมาชิก</a>
                    <span className="mobile-bar-divider">|</span>
                    <a href="#" onClick={e => { e.preventDefault(); setShowComingSoon(true) }}>🔑 เข้าสู่ระบบ</a>
                </div>
                <div className="mobile-bar-row-bottom">
                    <NavLink to="/" end>🏠 หน้าแรก</NavLink>
                    <span className="mobile-bar-divider">|</span>
                    <NavLink to="/topup">💎 เติมเงินเกม</NavLink>
                    <span className="mobile-bar-divider">|</span>
                    <NavLink to="/card">🎴 บัตรเติมเงิน</NavLink>
                </div>
            </div>

            <div className={`mobile-dropdown ${menuOpen ? 'open' : ''}`}>
                <NavLink to="/" end onClick={() => setMenuOpen(false)}>หน้าแรก</NavLink>
                <NavLink to="/topup" onClick={() => setMenuOpen(false)}>เติมเงินเกม</NavLink>
                <NavLink to="/card" onClick={() => setMenuOpen(false)}>บัตรเติมเงิน</NavLink>
                <NavLink to="/news" onClick={() => setMenuOpen(false)}>ข่าวสาร</NavLink>
                <NavLink to="/contact" onClick={() => setMenuOpen(false)}>ติดต่อทีมงาน</NavLink>
                <NavLink to="/order" onClick={() => setMenuOpen(false)}>ตรวจสอบออเดอร์</NavLink>
            </div>

            <div className="ticker">
                🚨 KAYAMAN SHOP เปิดให้บริการ 18 ชั่วโมง · รวดเร็ว ปานกลาง · ปลอดภัย นิดหน่อย · ไว้วางใจได้ บ้าง
            </div>
        </header>
    )
}
