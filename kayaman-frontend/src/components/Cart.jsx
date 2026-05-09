import { useState, useRef } from 'react'
import ConfirmModal from './ConfirmModal'
import AlertModal from './AlertModal'
import { sanitizeForm } from '../utils/sanitize'

export default function Cart({ cart, total, fields, options, game, onRemove, onUpdateQty, onClear, workerUrl, orderFrom }) {
  const [formData, setFormData] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [otherImages, setOtherImages] = useState({})
  const [alert, setAlert] = useState(null)
  const fileRefs = useRef({})

  const skipFields = ['game']
  const visibleFields = fields.filter(f => !skipFields.includes(f['Field']))

  const showAlert = (msg) => setAlert(msg)

  const handleField = (id, val) => setFormData(prev => ({ ...prev, [id]: val }))

  const handleQtyInput = (pkgName, val) => {
    const num = parseInt(val)
    if (isNaN(num) || num < 1) return
    onUpdateQty(pkgName, num)
  }

  const handleImageSelect = (pkgName, e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showAlert('กรุณาอัปโหลดรูปภาพเท่านั้น (JPG, PNG, WEBP, GIF)')
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
        setOtherImages(prev => ({
          ...prev,
          [pkgName]: { preview: compressed, base64: compressed.split(',')[1], mimeType: 'image/jpeg', name: file.name }
        }))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleCheckout = () => {
    if (cart.length === 0) return showAlert('กรุณาเลือกแพ็คเกจก่อน')
    const hasOther = cart.some(i => i.isOther)
    const otherItems = cart.filter(i => i.isOther)
    const missingImage = otherItems.find(i => !otherImages[i.pkg])
    if (missingImage) return showAlert('กรุณาอัปโหลดรูปแพ็คเกจอื่นๆ ให้ครบทุกรายการ')
    const required = visibleFields.filter(f => f['Required'] === 'Yes')
    const missing = required.find(f => !formData[f['Field']]?.trim())
    if (missing) return showAlert(`กรุณากรอก ${missing['Label']}`)
    const cleanedForm = sanitizeForm(formData)
    setFormData(cleanedForm)
    setShowConfirm(true)
  }

  return (
    <div className="cart-panel">
      <div className="cart-section">
        <h3 className="cart-title">🛒 ตะกร้าสินค้า</h3>
        {cart.length === 0 ? (
          <p className="cart-empty">ยังไม่มีสินค้าในตะกร้า</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i}>
                <div className="cart-item">
                  <span className="cart-item-name">{item.displayName || item.pkg}</span>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdateQty(item.pkg, item.qty - 1)}>−</button>
                    <input
                      type="number"
                      className="cart-qty-input"
                      value={item.qty}
                      min="1"
                      onChange={e => handleQtyInput(item.pkg, e.target.value)}
                    />
                    <button onClick={() => onUpdateQty(item.pkg, item.qty + 1)}>+</button>
                  </div>
                  {!item.isOther && (
                    <span className="cart-item-price">฿{(item.price * item.qty).toLocaleString()}</span>
                  )}
                  <button className="cart-item-remove" onClick={() => onRemove(item.pkg)}>×</button>
                </div>

                {item.isOther && (
                  <div className="cart-other-upload">
                    <input
                      type="file"
                      accept="image/*"
                      ref={el => fileRefs.current[item.pkg] = el}
                      style={{ display: 'none' }}
                      onChange={e => handleImageSelect(item.pkg, e)}
                    />
                    {otherImages[item.pkg] ? (
                      <div className="cart-other-preview"
                        onClick={() => fileRefs.current[item.pkg]?.click()}>
                        <img src={otherImages[item.pkg].preview} alt="preview" />
                        <span>{otherImages[item.pkg].name}</span>
                      </div>
                    ) : (
                      <div className="cart-other-dropzone"
                        onClick={() => fileRefs.current[item.pkg]?.click()}>
                        <span>📷</span>
                        <span>กดเพื่ออัปโหลดรูปแพ็คเกจ</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="cart-total">
              <span>ยอดรวม</span>
              <span className="cart-total-price">฿{total.toLocaleString()}</span>
            </div>
            <button className="cart-clear" onClick={onClear}>ล้างตะกร้า</button>
          </>
        )}
      </div>

      <div className="cart-section">
        <h3 className="cart-title">📝 กรอกข้อมูล</h3>
        {visibleFields.map(f => {
          const fieldId = f['Field'], label = f['Label']
          const required = f['Required'] === 'Yes'
          const choices = options[label] || []
          return (
            <div key={fieldId} className="form-field">
              <label>{label}{required && <span className="required"> *</span>}</label>
              {choices.length > 0 ? (
                <select value={formData[fieldId] || ''} onChange={e => handleField(fieldId, e.target.value)}>
                  <option value="">-- เลือก --</option>
                  {choices.map(c => <option key={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={label}
                  value={formData[fieldId] || ''}
                  onChange={e => handleField(fieldId, e.target.value)}
                />
              )}
            </div>
          )
        })}
        <button className="cart-checkout" onClick={handleCheckout}>ชำระเงิน →</button>
      </div>

      {alert && <AlertModal message={alert} onClose={() => setAlert(null)} />}

      {showConfirm && (
        <ConfirmModal
          cart={cart}
          total={total}
          formData={formData}
          fields={visibleFields}
          game={game}
          workerUrl={workerUrl}
          otherImages={otherImages}
          orderFrom={orderFrom}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
