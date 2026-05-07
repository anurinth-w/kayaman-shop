import { useParams, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PackageGrid from '../components/PackageGrid'
import Cart from '../components/Cart'
import Breadcrumb from '../components/Breadcrumb'
import '../styles/topup.css'


const WORKER_URL = 'https://kayaman-api.skizztv.workers.dev'

export default function Topup() {
    const { game } = useParams()
    const { state } = useLocation()
    const variants = state?.variants || null
    const displayName = state?.displayName || game
    const [activeGame, setActiveGame] = useState(game)

    const switchVariant = (variantName) => {
        setActiveGame(variantName)
        setCart([])
    }

    const getVariantLabel = (name) => {
        if (name.includes('UID')) return 'UID'
        if (name.includes('ID-PASS') || name.includes('ID-Pass')) return 'ID-PASS'
        return name
    }

    console.log('state:', state)
    const [data, setData] = useState(null)
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${WORKER_URL}?action=getInitData`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const addToCart = (pkg) => {
        setCart(prev => {
            const existing = prev.find(i => i.pkg === pkg.pkg)
            if (existing) return prev.map(i => i.pkg === pkg.pkg ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { ...pkg, qty: 1 }]
        })
    }

    const removeFromCart = (pkgName) => setCart(prev => prev.filter(i => i.pkg !== pkgName))

    const updateQty = (pkgName, qty) => {
        if (qty < 1) return removeFromCart(pkgName)
        setCart(prev => prev.map(i => i.pkg === pkgName ? { ...i, qty } : i))
    }

    const clearCart = () => setCart([])
    const total = cart.filter(i => !i.isOther).reduce((sum, i) => sum + i.price * i.qty, 0)

    if (loading) return <div className="topup-loading">กำลังโหลด...</div>
    if (!data) return <div className="topup-loading">เกิดข้อผิดพลาด</div>

    const gameData = data.games?.[activeGame] || {}
    const packages = data.packages?.[activeGame] || []
    const fields = (data.fields || []).filter(f => f[activeGame] === 'Yes')

    return (
        <main>
            <Breadcrumb items={[
                { label: 'หน้าแรก', path: '/' },
                { label: game }
            ]} />
            <div className="topup-page">
                <div className="topup-left">
                    <div className="game-header">
                        {gameData.icon && <img src={gameData.icon} alt={activeGame} className="game-icon" />}
                        <div>
                            <h1 className="game-title">เติมเกม {displayName}</h1>
                        </div>
                    </div>

                    {gameData.priceBoard && (
                        <img src={gameData.priceBoard} alt="ราคา" className="price-board" />
                    )}

                    {variants && variants.length > 1 && (
                        <div className="variant-control">
                            {variants.map(v => (
                                <button
                                    key={v}
                                    className={`variant-control-btn ${activeGame === v ? 'active' : ''}`}
                                    onClick={() => switchVariant(v)}
                                >
                                    {getVariantLabel(v)}
                                </button>
                            ))}
                        </div>
                    )}

                    <PackageGrid packages={packages} onAdd={addToCart} />
                </div>
                <div className="topup-right">
                    <Cart
                        cart={cart}
                        total={total}
                        fields={fields}
                        options={data.options || {}}
                        game={activeGame}
                        onRemove={removeFromCart}
                        onUpdateQty={updateQty}
                        onClear={clearCart}
                        workerUrl={WORKER_URL}
                    />
                </div>
            </div>
        </main>
    )
}
