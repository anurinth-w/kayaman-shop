export default function AlertModal({ message, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: '320px'}} onClick={e => e.stopPropagation()}>
        <div className="modal-title">🚨 แจ้งเตือน</div>
        <p style={{color: 'var(--gray)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6'}}>
          {message}
        </p>
        <button className="modal-btn-confirm" style={{width: '100%'}} onClick={onClose}>
          ตกลง
        </button>
      </div>
    </div>
  )
}
