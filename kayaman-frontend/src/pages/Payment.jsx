import { useParams, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import AlertModal from '../components/AlertModal'
import '../styles/payment.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

export default function Payment() {
    const { orderNumber } = useParams()
    const navigate = useNavigate()
    const { state } = useLocation()
    const game = state?.game || ''
    const [paymentMethods, setPaymentMethods] = useState([])
    const [selectedMethod, setSelectedMethod] = useState(null)
    const [slipImage, setSlipImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const fileRef = useRef()

    useEffect(() => {
        fetch(`${WORKER_URL}?action=getInitData`)
            .then(r => r.json())
            .then(d => setPaymentMethods(d.paymentMethods || []))
    }, [])

    const handleSlipSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setAlert('กรุณาอัปโหลดรูปภาพเท่านั้น')
            return
        }
        const reader = new FileReader()
        reader.onload = ev => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const maxSize = 1200
                let w = img.width, h = img.height
                if (w > maxSize) { h = h * maxSize / w; w = maxSize }
                if (h > maxSize) { w = w * maxSize / h; h = maxSize }
                canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                const compressed = canvas.toDataURL('image/jpeg', 0.8)
                setSlipImage({ preview: compressed, base64: compressed.split(',')[1], mimeType: 'image/jpeg', name: file.name })
            }
            img.src = ev.target.result
        }
        reader.readAsDataURL(file)
    }

    const handleConfirm = async () => {
        if (!slipImage) return setAlert('กรุณาอัปโหลดสลิปก่อน')
        setLoading(true)
        try {
            const res = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'uploadSlip',
                    data: { orderNumber, fileBase64: slipImage.base64, mimeType: slipImage.mimeType }
                })
            })
            const result = await res.json()
            if (result.success) {
                navigate(`/order/${orderNumber}`)
            } else {
                setAlert(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
            }
        } catch {
            setAlert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <Breadcrumb items={[
                { label: 'หน้าแรก', path: '/' },
                { label: game || 'เติมเกม', path: game ? `/topup/${game}` : '/topup' }, { label: 'ชำระเงิน' }
            ]} />

            <div className="payment-page">
                <div className="payment-card">
                    <div className="payment-order">
                        <span className="payment-order-label">เลขออเดอร์</span>
                        <span className="payment-order-number">{orderNumber}</span>
                    </div>

                    <div className="payment-section">
                        <h3 className="payment-section-title">เลือกวิธีชำระเงิน</h3>
                        <div className="payment-methods">
                            {paymentMethods.map((method, i) => (
                                <div
                                    key={i}
                                    className={`payment-method ${selectedMethod?.name === method.name ? 'active' : ''}`}
                                    onClick={() => setSelectedMethod(method)}
                                >
                                    <span className="payment-method-name">{method.name}</span>
                                </div>
                            ))}
                        </div>

                        {selectedMethod && (
                            <div className="payment-detail">
                                <p className="payment-detail-label">ข้อมูลการชำระเงิน</p>
                                <div className="payment-detail-value">
                                    {selectedMethod.type === 'qr' ? (
                                        <img src={selectedMethod.value} alt="QR Code" className="payment-qr" />
                                    ) : (
                                        <div className="payment-account">
                                            <span>{selectedMethod.value}</span>
                                            <button className="payment-copy"
                                                onClick={() => navigator.clipboard.writeText(selectedMethod.value)}>
                                                คัดลอก
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="payment-section">
                        <h3 className="payment-section-title">อัปโหลดสลิป</h3>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            style={{ display: 'none' }}
                            onChange={handleSlipSelect}
                        />
                        {slipImage ? (
                            <div className="payment-slip-preview" onClick={() => fileRef.current?.click()}>
                                <img src={slipImage.preview} alt="slip" />
                                <span>{slipImage.name}</span>
                            </div>
                        ) : (
                            <div className="payment-slip-dropzone" onClick={() => fileRef.current?.click()}>
                                <span>📷</span>
                                <span>กดเพื่ออัปโหลดสลิป</span>
                            </div>
                        )}
                    </div>

                    <button className="payment-confirm" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'กำลังส่ง...' : 'ยืนยันการชำระเงิน →'}
                    </button>

                    <p className="payment-note">
                        * หลังอัปโหลดสลิปแล้ว ทีมงานจะตรวจสอบและดำเนินการภายใน 15-30 นาที
                    </p>
                </div>
            </div>

            {alert && <AlertModal message={alert} onClose={() => setAlert(null)} />}
        </main>
    )
}
