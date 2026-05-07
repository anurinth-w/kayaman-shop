import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import '../styles/pending.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

export default function Pending() {
  const { orderNumber } = useParams()
  const { state } = useLocation()
  const game = state?.game || ''
  const [status, setStatus] = useState('Pending Review')

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${WORKER_URL}?action=getStatus&orderNumber=${orderNumber}`)
        const data = await res.json()
        if (data.success) {
          setStatus(data.status)
          if (data.status === 'Waiting for Transfer') {
            clearInterval(interval)
          }
        }
      } catch {}
    }, 10000) // เช็คทุก 10 วินาที

    return () => clearInterval(interval)
  }, [orderNumber])

  return (
    <main>
      <Breadcrumb items={[
        { label: 'หน้าแรก', path: '/' },
        { label: 'เติมเกม', path: '/topup' },
        { label: game, path: `/topup/${game}` },
        { label: 'รอยืนยันราคา' }
      ]} />

      <div className="pending-page">
        <div className="pending-card">
          <div className="pending-icon">⏳</div>

          <h2 className="pending-title">รอพนักงานยืนยันราคา</h2>
          <p className="pending-sub">ทีมงานกำลังตรวจสอบแพ็คเกจของคุณ<br/>กรุณารอสักครู่นะครับ ใช้ใจรอ มากกว่าใจร้อน 🙏</p>

          <div className="pending-order">
            <span className="pending-order-label">เลขออเดอร์</span>
            <span className="pending-order-number">{orderNumber}</span>
          </div>

          <div className="pending-status">
            <div className={`pending-step ${status === 'Pending Review' ? 'active' : 'done'}`}>
              <div className="pending-step-dot"></div>
              <span>รอพนักงานตรวจสอบ</span>
            </div>
            <div className="pending-step-line"></div>
            <div className={`pending-step ${status === 'Waiting for Transfer' ? 'active' : status === 'Pending Review' ? '' : 'done'}`}>
              <div className="pending-step-dot"></div>
              <span>ยืนยันราคาแล้ว</span>
            </div>
            <div className="pending-step-line"></div>
            <div className="pending-step">
              <div className="pending-step-dot"></div>
              <span>ชำระเงิน</span>
            </div>
          </div>

          {status === 'Waiting for Transfer' ? (
            <Link to={`/payment/${orderNumber}`} state={{ game }} className="pending-btn">
              ไปหน้าชำระเงิน →
            </Link>
          ) : (
            <p className="pending-checking">
              🔄 กำลังตรวจสอบสถานะอัตโนมัติ...
            </p>
          )}

          <Link to={`/order/${orderNumber}`} className="pending-track">
            ตรวจสอบสถานะออเดอร์
          </Link>
        </div>
      </div>
    </main>
  )
}
