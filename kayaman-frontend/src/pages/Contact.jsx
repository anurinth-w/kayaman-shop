import { useState, useEffect } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import '../styles/contact.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

export default function Contact() {
  const [contact, setContact] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(WORKER_URL + '?action=getContact')
      .then(r => r.json())
      .then(d => { setContact(d.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <main>
      <Breadcrumb items={[{ label: 'หน้าแรก', path: '/' }, { label: 'ติดต่อทีมงาน' }]} />
      <div className="contact-loading">กำลังโหลด...</div>
    </main>
  )

  return (
    <main>
      <Breadcrumb items={[
        { label: 'หน้าแรก', path: '/' },
        { label: 'ติดต่อทีมงาน' }
      ]} />
      <div className="contact-page">
        <div className="contact-card">
          <h2 className="contact-title">ช่องทางการติดต่อทีมงาน</h2>
          {contact.Description && (
            <p className="contact-desc">{contact.Description}</p>
          )}
          {contact.Address && (
            <div className="contact-address">
              <p>{contact.Address}</p>
            </div>
          )}
          <div className="contact-buttons">
            {contact.LineUrl && (
              <a href={contact.LineUrl} target="_blank" rel="noreferrer" className="contact-btn contact-btn-line">
                <div className="contact-btn-text">
                  <span className="contact-btn-label">Line</span>
                  <span className="contact-btn-value">{contact.LineId || '@kayamanshop'}</span>
                </div>
              </a>
            )}
            {contact.FbUrl && (
              <a href={contact.FbUrl} target="_blank" rel="noreferrer" className="contact-btn contact-btn-fb">
                <div className="contact-btn-text">
                  <span className="contact-btn-label">Facebook</span>
                  <span className="contact-btn-value">{contact.FbName || 'Kayaman Shop'}</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
