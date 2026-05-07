import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

export default function GameGrid() {
    const [games, setGames] = useState({})
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetch(`${WORKER_URL}?action=getInitData`)
            .then(r => r.json())
            .then(d => { setGames(d.games || {}); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const groupedGames = Object.entries(games).reduce((acc, [name, info]) => {
        if (info.groupWith) {
            if (!acc[info.groupWith]) {
                acc[info.groupWith] = {
                    isGroup: true,
                    variants: [],
                    icon: info.icon,
                    priceBoard: info.priceBoard
                }
            }
            acc[info.groupWith].variants.push({ name, info })
        } else {
            acc[name] = { isGroup: false, name, info }
        }
        return acc
    }, {})

    const filtered = Object.entries(groupedGames).filter(([name]) =>
        name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <section className="game-section">
            <div className="game-section-header">
                <div className="section-title">
                    <span className="section-bar"></span>
                    เลือกเกมที่ต้องการเติม
                </div>
                <input
                    type="text"
                    className="game-search"
                    placeholder="ค้นหาเกม..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="game-loading">กำลังโหลด...</div>
            ) : (
                <div className="game-grid">
                    {filtered.map(([displayName, data]) => (
                        <div
                            key={displayName}
                            className="game-card"
                            onClick={() => {
                                if (data.isGroup) {
                                    // navigate ไปพร้อม variants
                                    navigate(`/topup/${encodeURIComponent(data.variants[0].name)}`, {
                                        state: { variants: data.variants.map(v => v.name), displayName }
                                    })
                                } else {
                                    navigate(`/topup/${encodeURIComponent(data.name)}`)
                                }
                            }}
                        >
                            {(data.isGroup ? data.variants[0].info.icon : data.info?.icon) ? (
                                <img
                                    src={data.isGroup ? data.variants[0].info.icon : data.info?.icon}
                                    alt={displayName}
                                    className="game-card-img"
                                />
                            ) : (
                                <div className="game-card-placeholder">🎮</div>
                            )}
                            <div className="game-card-name">{displayName}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
