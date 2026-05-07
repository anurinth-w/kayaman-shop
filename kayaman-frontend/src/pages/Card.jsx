import Breadcrumb from '../components/Breadcrumb'

export default function Card() {
  return (
    <main>
      <Breadcrumb items={[
        { label: 'หน้าแรก', path: '/' },
        { label: 'บัตรเติมเงิน' }
      ]} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{ fontSize: '64px' }}>🚧</div>
        <h2 style={{ fontSize: '24px', color: 'white' }}>ยังไม่พร้อมให้บริการ</h2>
        <p style={{ fontSize: '14px', color: 'var(--gray)', lineHeight: '1.8' }}>
          บริการบัตรเติมเงินกำลังอยู่ในระหว่างการพัฒนา<br/>
          ติดตามข่าวสารได้เร็วๆ นี้นะครับ 🙏
        </p>
      </div>
    </main>
  )
}
