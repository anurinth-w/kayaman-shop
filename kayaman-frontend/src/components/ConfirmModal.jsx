import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConfirmModal({ cart, total, formData, fields, game, workerUrl, otherImages, onClose }) {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const hasOther = cart.some(i => i.isOther)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            const packageSummary = cart.map(i => `${i.pkg} x${i.qty}`).join(', ')

            const payload = {
                action: 'submitOrder',
                data: {
                    game,
                    packages: cart.map(i => ({ pkg: i.pkg, price: i.price, qty: i.qty })),
                    packageSummary,
                    totalPrice: total,
                    hasOther: hasOther,
                    ...formData
                }
            }

            const res = await fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await res.json()

            if (!result.orderNumber) {
                alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
                setLoading(false)
                return
            }

            const orderNumber = result.orderNumber

            // ถ้ามีแพ็คอื่นๆ ต้องอัปรูปก่อน แล้วไปหน้ารอ
            if (hasOther && otherImages) {
                const images = Object.values(otherImages).map(img => ({
                    base64: img.base64,
                    mimeType: img.mimeType
                }))

                await fetch(workerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'uploadPackageImage',
                        data: { orderNumber, images, totalPrice: total }
                    })
                })

                navigate(`/pending/${orderNumber}`, { state: { game } })
            } else {
                navigate(`/payment/${orderNumber}`, { state: { game } })
            }

        } catch {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3 className="modal-title">🚨 ยืนยันออเดอร์</h3>

                <div className="modal-section">
                    <p className="modal-label">แพ็คเกจที่เลือก</p>
                    {cart.map((item, i) => (
                        <div key={i} className="modal-item">
                            <span>{item.pkg} × {item.qty}</span>
                            <span>{item.isOther ? 'รอพนักงานยืนยันราคา' : `฿${(item.price * item.qty).toLocaleString()}`}</span>
                        </div>
                    ))}
                    <div className="modal-total">
                        <span>ยอดรวม</span>
                        <span>{hasOther ? 'รอพนักงานยืนยัน' : `฿${total.toLocaleString()}`}</span>
                    </div>
                </div>

                <div className="modal-section">
                    <p className="modal-label">ข้อมูลที่กรอก</p>
                    {fields.map(f => formData[f['Field']] && (
                        <div key={f['Field']} className="modal-item">
                            <span>{f['Label']}</span>
                            <span>{formData[f['Field']]}</span>
                        </div>
                    ))}
                </div>

                {hasOther && (
                    <div style={{ background: 'rgba(229,62,62,0.08)', border: '0.5px solid rgba(229,62,62,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: 'var(--red-light)' }}>
                        ⚠️ มีแพ็คเกจอื่นๆ ระบบจะส่งรูปให้พนักงานยืนยันราคาก่อน แล้วค่อยชำระเงิน
                    </div>
                )}

                <div className="modal-actions">
                    <button className="modal-btn-cancel" onClick={onClose}>แก้ไข</button>
                    <button className="modal-btn-confirm" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'กำลังส่ง...' : 'ยืนยัน →'}
                    </button>
                </div>
            </div>
        </div>
    )
}
