import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TopupList from './pages/TopupList'
import Topup from './pages/Topup'
import Payment from './pages/Payment'
import Pending from './pages/Pending'
import Order from './pages/Order'
import Card from './pages/Card'
import News from './pages/News'
import Contact from './pages/Contact'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topup" element={<TopupList />} />
        <Route path="/topup/:game" element={<Topup />} />
        <Route path="/payment/:orderNumber" element={<Payment />} />
        <Route path="/pending/:orderNumber" element={<Pending />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order/:orderNumber" element={<Order />} />
        <Route path="/card" element={<Card />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  )
}

export default App
