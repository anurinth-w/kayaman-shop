import { useState, useEffect } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import '../styles/news.css'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

const CATEGORY_COLOR = {
  'ประกาศ':    '#e53e3e',
  'โปรโมชั่น': '#f97316',
  'อัปเดต':   '#6fa3ff',
}

function proxyImg(url) {
  if (!url) return ''
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `${WORKER_URL}?action=getImage&fileId=${match[1]}`
  return url
}

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('ทั้งหมด')

  useEffect(() => {
    fetch(`${WORKER_URL}?action=getNews`)
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = ['ทั้งหมด', ...new Set(news.map(n => n.Category).filter(Boolean))]
  const filtered = filter === 'ทั้งหมด' ? news : news.filter(n => n.Category === filter)

  return (
    <main>
      <Breadcrumb items={[
        { label: 'หน้าแรก', path: '/' },
        { label: 'ข่าวสาร' }
      ]} />

      <div className="news-page">
        <div className="news-header">
          <h2 className="news-title">📰 ข่าวสารและประกาศ</h2>
          <div className="news-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`news-filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="news-loading">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="news-empty">ยังไม่มีข่าวสารในขณะนี้</div>
        ) : (
          <div className="news-grid">
            {filtered.map((item, i) => (
              <div key={i} className="news-card" onClick={() => setSelected(item)}>
                {item.ImageUrl && (
                  <img
                    src={proxyImg(item.ImageUrl)}
                    alt={item.Title}
                    className="news-card-img"
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
                <div className="news-card-body">
                  <div className="news-card-meta">
                    {item.Category && (
                      <span className="news-card-category" style={{ background: CATEGORY_COLOR[item.Category] || '#555' }}>
                        {item.Category}
                      </span>
                    )}
                    {item.Date && <span className="news-card-date">{item.Date}</span>}
                  </div>
                  <h3 className="news-card-title">{item.Title}</h3>
                  <p className="news-card-content">{item.Content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="news-modal" onClick={e => e.stopPropagation()}>
            <button className="news-modal-close" onClick={() => setSelected(null)}>×</button>
            {selected.ImageUrl && (
              <img
                src={proxyImg(selected.ImageUrl)}
                alt={selected.Title}
                className="news-modal-img"
                onError={e => e.target.style.display = 'none'}
              />
            )}
            <div className="news-modal-body">
              <div className="news-card-meta">
                {selected.Category && (
                  <span className="news-card-category" style={{ background: CATEGORY_COLOR[selected.Category] || '#555' }}>
                    {selected.Category}
                  </span>
                )}
                {selected.Date && <span className="news-card-date">{selected.Date}</span>}
              </div>
              <h2 className="news-modal-title">{selected.Title}</h2>
              <p className="news-modal-content">{selected.Content}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
