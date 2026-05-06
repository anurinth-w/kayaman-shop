import './../styles/navbar.css'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header>
      <div className="topbar">
        <div className="topbar-left">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">📘 Kayaman Shop</a>
          <a href="https://line.me" target="_blank" rel="noreferrer">💬 @kayamanshop</a>
        </div>
        <div className="topbar-right">
          <a href="/register">สมัครสมาชิก</a>
          <a href="/login" className="btn-login">เข้าสู่ระบบ</a>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-brand">
          <svg viewBox="0 0 44 44" width="36" height="36">
            <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="var(--red)" stroke="var(--red-light)" strokeWidth="1.5"/>
            <polygon points="22,7 36,15 36,29 22,37 8,29 8,15" fill="#0a0a0a"/>
            <text x="22" y="27" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">K</text>
          </svg>
          <div>
            <span className="brand-name">KAYAMAN<span className="brand-red">SHOP</span></span>
            <span className="brand-sub">EST. 2020</span>
          </div>
        </div>
        <div className="navbar-links">
          <NavLink to="/" end>หน้าแรก</NavLink>
          <NavLink to="/topup">เติมเงิน</NavLink>
          <NavLink to="/order">ตรวจสอบออเดอร์</NavLink>
          <NavLink to="/news">ข่าวสาร</NavLink>
          <NavLink to="/contact">ติดต่อทีมงาน</NavLink>
        </div>
      </nav>

      <div className="ticker">
        🚨 KAYAMAN SHOP เปิดให้บริการ 24 ชั่วโมง · รวดเร็ว · ปลอดภัย · ไว้วางใจได้
      </div>
    </header>
  )
}
