import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import AlertModal from '../components/AlertModal'
import '../styles/order.css'
import { Link } from 'react-router-dom'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

const STATUS_MAP = {
    'Prepare': { label: 'รอดำเนินการ', color: '#6fa3ff', emoji: '🔵' },
    'Pending Review': { label: 'รอพนักงานตรวจสอบ', color: '#facc15', emoji: '🟡' },
    'Waiting for Transfer': { label: 'รอการชำระเงิน', color: '#fb923c', emoji: '🟠' },
    'Slip Uploaded': { label: 'อัปโหลดสลิปแล้ว', color: '#c084fc', emoji: '🟣' },
    'Processing': { label: 'กำลังดำเนินการ', color: '#4ade80', emoji: '🟢' },
    'Need Info: Password': { label: 'ต้องการ Password ใหม่', color: '#e53e3e', emoji: '🔴' },
    'Need Info: Email': { label: 'ต้องการ Email ใหม่', color: '#e53e3e', emoji: '🔴' },
    'Need Info: UID': { label: 'ต้องการ UID ใหม่', color: '#e53e3e', emoji: '🔴' },
    'Need Info: OTP': { label: 'ต้องการ OTP', color: '#e53e3e', emoji: '🔴' },
}

export default function Order() {
    const { orderNumber: paramOrder } = useParams()
    const [orderNumber, setOrderNumber] = useState(paramOrder || '')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [replyValue, setReplyValue] = useState('')
    const [replying, setReplying] = useState(false)

    const handleSearch = async () => {
        if (!orderNumber.trim()) return setAlert('กรุณากรอกเลขออเดอร์')
        setLoading(true)
        setOrder(null)
        try {
            const res = await fetch(`${WORKER_URL}?action=getStatus&orderNumber=${orderNumber.trim()}`)
            const data = await res.json()
            if (data.success) setOrder(data)
            else setAlert('ไม่พบออเดอร์นี้ กรุณาตรวจสอบเลขออเดอร์อีกครั้ง')
        } catch {
            setAlert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    const handleReply = async (type) => {
        if (!replyValue.trim()) return setAlert('กรุณากรอกข้อมูล')
        setReplying(true)
        try {
            const action = type === 'OTP' ? 'replyOTP' : 'replyInfo'
            const res = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    data: { orderNumber: order.orderNumber, type, value: replyValue.trim() }
                })
            })
            const result = await res.json()
            if (result.success) {
                setReplyValue('')
                setAlert('ส่งข้อมูลเรียบร้อยแล้ว ทีมงานจะดำเนินการต่อไป')
                handleSearch()
            } else {
                setAlert('เกิดข้อผิดพลาด กรุณาลองใหม่')
            }
        } catch {
            setAlert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setReplying(false)
        }
    }

    const needInfoType = order?.status?.startsWith('Need Info:')
        ? order.status.replace('Need Info: ', '')
        : null

    const statusInfo = STATUS_MAP[order?.status] || { label: order?.status, color: '#aaa', emoji: '⚪' }

    return (
        <main>
            <Breadcrumb items={[
                { label: 'หน้าแรก', path: '/' },
                { label: 'ตรวจสอบออเดอร์' }
            ]} />

            <div className="order-page">
                <div className="order-search-card">
                    <h2 className="order-title">🔍 ตรวจสอบออเดอร์</h2>
                    <p className="order-sub">กรอกเลขออเดอร์ที่ได้รับหลังจากสั่งซื้อ</p>
                    <div className="order-search-row">
                        <input
                            type="text"
                            className="order-input"
                            placeholder="เช่น KM-A3X9K2"
                            value={orderNumber}
                            onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="order-search-btn" onClick={handleSearch} disabled={loading}>
                            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                        </button>
                    </div>
                </div>

                {order && (
                    <div className="order-result-card">
                        <div className="order-result-header">
                            <div>
                                <span className="order-result-label">เลขออเดอร์</span>
                                <span className="order-result-number">{order.orderNumber}</span>
                            </div>
                            <div className="order-status" style={{ color: statusInfo.color }}>
                                {statusInfo.emoji} {statusInfo.label}
                            </div>
                        </div>

                        <div className="order-result-body">
                            <div className="order-info-row">
                                <span className="order-info-label">เกม</span>
                                <span className="order-info-value">{order.game}</span>
                            </div>
                            <div className="order-info-row">
                                <span className="order-info-label">แพ็คเกจ</span>
                                <span className="order-info-value">{order.package}</span>
                            </div>
                            <div className="order-info-row">
                                <span className="order-info-label">ยอดรวม</span>
                                <span className="order-info-value" style={{ color: 'var(--red)' }}>
                                    {order.totalPrice
                                        ? `฿${Number(order.totalPrice.replace(/,/g, '')).toLocaleString()}`
                                        : 'รอพนักงานยืนยัน'}
                                </span>
                            </div>
                        </div>

                        {/* Action Button ตาม Status */}
                        {order.status === 'Waiting for Transfer' && (
                            <div className="order-action">
                                <p className="order-action-desc">ออเดอร์นี้รอการชำระเงิน กรุณาชำระเงินและอัปโหลดสลิป</p>
                                <Link to={`/payment/${order.orderNumber}`} state={{ game: order.game, totalPrice: Number(String(order.totalPrice || 0).replace(/,/g, '')) }} className="order-action-btn">
                                    ไปหน้าชำระเงิน →
                                </Link>
                            </div>
                        )}

                        {order.status === 'Slip Uploaded' && (
                            <div className="order-action">
                                <p className="order-action-desc">ทีมงานได้รับสลิปแล้ว กำลังตรวจสอบ กรุณารอสักครู่</p>
                            </div>
                        )}

                        {order.status === 'Pending Review' && (
                            <div className="order-action">
                                <p className="order-action-desc">ทีมงานกำลังตรวจสอบออเดอร์ของคุณ กรุณารอสักครู่</p>
                            </div>
                        )}

                        {order.status === 'Processing' && (
                            <div className="order-action">
                                <p className="order-action-desc">ทีมงานกำลังดำเนินการเติมเกมให้คุณ ใจเย็นๆ นะครับ 🙏</p>
                            </div>
                        )}

                        {needInfoType && (
                            <div className="order-reply-section">
                                <div className="order-reply-alert">
                                    🚨 ทีมงานต้องการข้อมูลเพิ่มเติม กรุณากรอก {needInfoType} ใหม่
                                </div>
                                <div className="order-reply-form">
                                    <input
                                        type={needInfoType === 'Password' ? 'password' : 'text'}
                                        className="order-input"
                                        placeholder={
                                            needInfoType === 'OTP' ? 'กรอก OTP ที่ได้รับ' :
                                                needInfoType === 'Password' ? 'กรอก Password ใหม่' :
                                                    needInfoType === 'Email' ? 'กรอก Email ใหม่' :
                                                        'กรอก UID ใหม่'
                                        }
                                        value={replyValue}
                                        onChange={e => setReplyValue(e.target.value)}
                                    />
                                    <button
                                        className="order-reply-btn"
                                        onClick={() => handleReply(needInfoType)}
                                        disabled={replying}
                                    >
                                        {replying ? 'กำลังส่ง...' : 'ส่งข้อมูล →'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {alert && <AlertModal message={alert} onClose={() => setAlert(null)} />}
        </main>
    )
}
