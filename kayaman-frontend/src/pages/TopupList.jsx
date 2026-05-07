import GameGrid from '../components/GameGrid'
import Breadcrumb from '../components/Breadcrumb'
import '../styles/gamegrid.css'

export default function TopupList() {
  return (
    <main>
      <Breadcrumb items={[{ label: 'หน้าแรก', path: '/' }, { label: 'เติมเกม' }]} />
      <GameGrid />
    </main>
  )
}
