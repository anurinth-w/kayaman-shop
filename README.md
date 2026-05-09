# Kayaman Game Shop — Order Management System

> ระบบจัดการออเดอร์เติมเกมออนไลน์แบบ Full-Stack สำหรับธุรกิจจริง  
> ออกแบบ พัฒนา และ Deploy โดย **Anurinth W.**

---

## Live URLs

| Site | URL |
|---|---|
| Customer Portal | [order.kayamanshop.com](https://order.kayamanshop.com) |
| Admin Panel | [kayaman-admin.web.app](https://kayaman-admin.web.app) |
| API | `https://kayaman-api.skizztv.workers.dev` |

---

## Overview

ระบบนี้จัดการ lifecycle ของออเดอร์เติมเกมตั้งแต่ต้นจนจบ — ตั้งแต่ลูกค้าเลือกแพ็คเกจ, ชำระเงิน, พนักงาน verify สลิป, ไปจนถึงเติมเกมเสร็จ ใช้งานจริงกับธุรกิจที่มีออเดอร์หลายร้อยรายต่อวัน

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Customer Frontend | React 19 + React Router 7 + Vite | `/kayaman-frontend/` |
| Admin Frontend | Vanilla HTML/CSS/JS | `/admin/public/` |
| Customer Portal (legacy) | Vanilla HTML/CSS/JS | `/public/` |
| Backend API | Cloudflare Workers (Serverless) | ไม่อยู่ใน repo นี้ |
| Authentication | Firebase Authentication (Google OAuth) | Admin-only |
| Hosting | Firebase Hosting (Multi-site) | |
| Database | Google Sheets API v4 | ไม่มี traditional DB |
| File Storage | Google Drive API v3 | สลิป + รูปแพ็คเกจ |
| Service Account Auth | Google JWT (ทำเองใน Cloudflare Worker) | ไม่ใช้ googleapis library |
| Domain | Custom domain via Squarespace DNS | |

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  Customer Browser   │     │   Admin Browser     │
│ order.kayamanshop   │     │  kayaman-admin.web  │
└────────┬────────────┘     └────────┬────────────┘
         │ Firebase Hosting           │ Firebase Hosting
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│              Cloudflare Worker API              │
│         kayaman-api.skizztv.workers.dev         │
│                                                 │
│  GET  getInitData · getStatus · verifyStaff     │
│       getStaffOrders · getAgents · getImage     │
│       getOrderHistory · getNews · getContact    │
│                                                 │
│  POST submitOrder · uploadSlip · uploadPkg      │
│       confirmPrice · confirmSlip · assignAgent  │
│       acceptJob · completeOrder · requestInfo   │
│       replyInfo · replyOTP · updateOrderInfo    │
│       resolveError                              │
└────────┬────────────────────┬───────────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│ Google Sheets │    │  Google Drive    │
│  (Database)  │    │ (File Storage)   │
│              │    │                  │
│ Main (Orders)│    │ /MM/DD/          │
│ Packages     │    │   slip files     │
│ Games        │    │ /pkg/MM/DD/order/│
│ Fields       │    │   package images │
│ Options      │    └──────────────────┘
│ Payment      │
│ Staff        │
│ News         │
│ Banners      │
│ Contact      │
└──────────────┘
```

---

## Project Structure

```
kayaman-shop/
├── kayaman-frontend/           # React SPA (Customer Portal)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             # Routes: Home, TopupList, Topup, Payment,
│   │   │                       #         Pending, Order, Card, News, Contact
│   │   ├── components/         # Shared components (Navbar, etc.)
│   │   ├── pages/              # Page components ต่อ route
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # CSS modules ต่อ component
│   ├── public/
│   ├── dist/                   # Build output (Firebase deploy จาก dir นี้)
│   ├── package.json
│   └── vite.config.js
│
├── public/                     # Legacy Customer Portal (Vanilla JS)
│   └── index.html              # Single-page app ~1200 lines
│
├── admin/
│   └── public/                 # Admin Panel
│       ├── index.html          # Dashboard หลัก
│       ├── history.html        # Order history (super_admin only)
│       └── config.js           # Firebase config (gitignored)
│
├── functions/                  # Legacy Firebase Functions (ไม่ได้ใช้แล้ว)
│   └── index.js
│
├── firebase.json               # Multi-site hosting config
├── .firebaserc                 # Firebase project + targets
└── README.md
```

> Cloudflare Worker code deploy ผ่าน Cloudflare Dashboard โดยตรง ไม่อยู่ใน repo นี้

---

## Google Sheets Schema

### Sheet: Main (Orders)

| Col | Field | Description |
|---|---|---|
| A | Date | Timestamp ที่สร้างออเดอร์ |
| B | Order Number | Format: `KM-XXXXXX` (6 random chars) |
| C | Order From | ช่องทาง: Line / Facebook / Direct |
| D | Social Name | ชื่อ social media ของลูกค้า |
| E | Customer Name | ชื่อจริงจากฟอร์ม |
| F | Customer Type | Normal / VIP |
| G | Game | เกมที่เลือก |
| H | Platform | PC / iOS / Android |
| I | Login Form | วิธี login |
| J | E-Mail / ID | account เกม |
| K | Pass | รหัสผ่านเกม |
| L | Character Name | ชื่อตัวละคร |
| M | Level | ระดับตัวละคร |
| N | Server | เซิร์ฟเวอร์ |
| O | UID | User ID |
| P | Package | แพ็คเกจที่เลือก |
| Q | Package Image | Drive URL รูปแพ็คเกจ "อื่นๆ" |
| R | Order Price | ราคาสุดท้าย (ตั้งโดย staff) |
| S | Slip Price | ยอดในสลิป (จาก EasySlip verify) |
| T | Slip Image | Drive URL สลิปโอนเงิน |
| U | Order Status | สถานะปัจจุบัน (ดูด้านล่าง) |
| V | Assigned To | Staff + timestamp ที่รับงาน |
| W | Price Confirmed By | Staff + timestamp ที่ confirm ราคา |
| X | Slip Confirmed By | Staff + timestamp ที่ confirm สลิป |
| Y | Action Log | บันทึกทุก action แบบ append (newline-separated) |
| Z | Agent Email | email ของ agent ที่รับงาน |

**Log format (column Y):**
```
9/5/2569, 08:23:52 | admin@email.com ขอ Password, Email | รอลูกค้าตอบกลับ
9/5/2569, 10:15:30 | System: AMOUNT_MISMATCH | สลิปยอดไม่ตรง (ต้องการ ฿500 ได้รับ ฿450)
9/5/2569, 11:02:14 | admin@email.com: แก้ไข Error → เปลี่ยน status กลับเป็น Slip Uploaded
```

### Order Status Values

| Status | ความหมาย | ใครเห็น |
|---|---|---|
| `Prepare` | สร้างออเดอร์แล้ว รอ confirm | ไม่แสดงใน admin |
| `Pending Review` | มีแพ็คเกจ "อื่นๆ" รอ staff ดูรูปและตั้งราคา | admin tab: Pending Review |
| `Waiting for Transfer` | รอลูกค้าโอนเงิน | admin tab: รอโอนเงิน |
| `Slip Uploaded` | ลูกค้าอัปสลิปแล้ว รอ staff verify | admin tab: Slip Uploaded |
| `Processing` | verify สลิปผ่านแล้ว รอ assign agent | admin tab: Processing |
| `Assigned` | assign agent แล้ว รอ agent รับงาน | admin tab: งานของฉัน |
| `In Progress` | agent รับงานแล้ว กำลังเติม | admin tab: งานของฉัน |
| `Need Info: [types]` | รอข้อมูลจากลูกค้า เช่น `Need Info: Password, Email` | admin tab: Need Info |
| `Error` | เกิดปัญหา (สลิปผิด, API ล่ม ฯลฯ) | admin tab: Error |
| `Completed` | เติมเสร็จแล้ว | ประวัติ |
| `Deleted` | ถูกลบโดย super_admin | ไม่แสดง |

### Sheet: Staff

| Col | Field |
|---|---|
| A | Email |
| B | Display Name |
| C | Role (`super_admin` / `admin` / `staff` / `agent`) |

### Staff Roles

| Role | สิทธิ์ |
|---|---|
| `super_admin` | เห็นทุกแท็บ, ดูประวัติ, จัดการ Error, ลบออเดอร์, กำหนดราคา, verify สลิป, assign agent |
| `admin` | กำหนดราคา, verify สลิป, ขอข้อมูล, แก้ไข Info |
| `staff` | ดูออเดอร์ทั่วไป |
| `agent` | เห็นเฉพาะงานที่ assign ให้ตัวเอง, รับงาน, เติมเสร็จ, ขอข้อมูล |

### Sheet: Packages

| Col | Field |
|---|---|
| A | Game |
| B | Category |
| C | Package Name |
| D | Price |
| E | Old Price (ราคาขีดทิ้ง) |
| F | Image URL |
| G | Description |
| H | Available (`Yes`/`No`) |

### Sheet: Games

| Col | Field |
|---|---|
| A | Game Name |
| B | Icon URL |
| C | Price Board Image URL |
| D | Group With (รวมกลุ่มกับเกมไหน) |

---

## Order Flow

```
ลูกค้าเลือกเกม
       │
       ├─ แพ็คเกจปกติ ──────────────────────────────────────────────────────┐
       │                                                                      │
       └─ แพ็คเกจ "อื่นๆ" ──▶ อัปรูปแพ็คเกจ ──▶ Status: Pending Review     │
                                                          │                   │
                                                Staff ดูรูป + ตั้งราคา       │
                                                          │                   │
                                                          └─────────────────┐ │
                                                                            ▼ ▼
                                                               Status: Waiting for Transfer
                                                                            │
                                           ┌────────────────────────────────┤
                                           │ EasySlip verify อัตโนมัติ      │
                                           │                                │
                                    ลูกค้าอัปสลิป ─────────────────────────┘
                                           │
                              ┌────────────┼────────────┐
                         ยอดตรง        ยอดไม่ตรง      API ล่ม
                              │            │              │
                     Status: Slip    Status: Error  Status: Error
                      Uploaded             │              │
                              │      super_admin   super_admin
                       Staff verify   จัดการ Error  จัดการ Error
                              │
                    Status: Processing
                              │
                    super_admin assign ─▶ Status: Assigned
                              │
                       Agent รับงาน ─▶ Status: In Progress
                              │
                    (ถ้าต้องการข้อมูล ──▶ Status: Need Info: [types]
                              │              ลูกค้า reply
                              │          Status: Processing)
                              │
                    Agent เติมเสร็จ ─▶ Status: Completed
```

---

## Admin Panel Features

### แท็บ Pending Review
- ออเดอร์ที่มีแพ็คเกจ "อื่นๆ" รอตรวจสอบ
- ปุ่ม **กำหนดราคา**: ดูรูปแพ็คเกจ, ใส่ราคาแต่ละชิ้น, คำนวณรวมอัตโนมัติ

### แท็บ Slip Uploaded
- ออเดอร์ที่ EasySlip verify ผ่านแต่รอ staff ยืนยัน
- ปุ่ม **ตรวจสอบสลิป**: ดูรูปสลิป, เปรียบเทียบยอด
- ปุ่ม **📤 อัปสลิปแทนลูกค้า**: staff อัปสลิปแทนได้ (กรณีลูกค้าส่งสลิปมาทาง Line)

### แท็บ Need Info
- ออเดอร์ที่ต้องการข้อมูลเพิ่มเติมจากลูกค้า
- ปุ่ม **✏️ แก้ไข Info**: admin แก้ข้อมูล Email/ID, Password, UID โดยตรง

### แท็บ รอโอนเงิน
- ออเดอร์ที่รอลูกค้าชำระ

### แท็บ Processing
- ออเดอร์ที่ผ่าน slip verify แล้ว รอ assign
- Checkbox สำหรับ bulk assign หลายออเดอร์พร้อมกัน
- ปุ่ม **ขอข้อมูล 📋**: ส่ง request ไปหาลูกค้า (เลือกได้หลายอัน: Password, Email/ID, UID, OTP)

### แท็บ Error
- ออเดอร์ที่เกิดปัญหา พร้อมแสดง error reason จาก log
- ปุ่ม **🛠️ จัดการ Error** (super_admin เท่านั้น):
  - 🔄 เปลี่ยน status กลับเป็น Slip Uploaded
  - ✏️ กรอกยอดเองแทน verify
  - 🗑️ เปลี่ยน status เป็น Deleted
  - 📝 อื่นๆ (กรอกหมายเหตุเอง)

### แท็บ งานของฉัน
- สำหรับ agent: ออเดอร์ที่ assign มาให้
- ปุ่ม **รับงานนี้**: เปลี่ยนเป็น In Progress (one-time lock)
- ปุ่ม **เติมเสร็จแล้ว**: จบงาน
- ปุ่ม **ขอข้อมูล**: ขอข้อมูลเพิ่มเติมจากลูกค้าได้ทั้งก่อนและหลังรับงาน

### Order Detail Overlay
- คลิกการ์ดออเดอร์ → full-screen overlay แสดงรายละเอียดทั้งหมด
- ปุ่ม **copy** ข้าง Email/ID, Password, UID
- แสดง Action Log (column Y) เป็น timeline
- ปุ่ม action ทั้งหมดอยู่ในนี้

### ฟีเจอร์อื่น
- **New Order Notification**: เสียงแจ้งเตือน (Web Audio API) + toast notification มุมขวาบน
- **Auto-refresh**: ทุก 5 วินาที หยุดเมื่อ modal เปิด, อัปเดต overlay โดยไม่ปิด
- **Bulk Assign**: เลือกหลายออเดอร์แล้ว assign ให้ agent ทีเดียว
- **ประวัติออเดอร์** (super_admin): กรอง date range, ค้นหา, sort ทุก column, สรุปสถิติ

---

## Customer Portal Features (React)

| Page | Path | Description |
|---|---|---|
| Home | `/` | หน้าแรก, banner, news |
| Topup List | `/topup` | รายการเกมทั้งหมด |
| Topup | `/topup/:game` | เลือกแพ็คเกจ, กรอกฟอร์ม |
| Payment | `/payment` | ช่องทางชำระเงิน, อัปสลิป |
| Pending | `/pending` | รอ staff ตรวจสอบแพ็คเกจ |
| Order Status | `/order` | ตรวจสอบสถานะออเดอร์ |
| Card | `/card` | Gift card |
| News | `/news` | ข่าวสาร |
| Contact | `/contact` | ติดต่อ |

---

## API Reference

Base URL: `https://kayaman-api.skizztv.workers.dev`

### GET Actions

| Action | Params | Description |
|---|---|---|
| `getInitData` | — | โหลดเกม, แพ็คเกจ, ฟอร์ม, การชำระเงิน |
| `getStatus` | `orderNumber` หรือ `customerName&game` | เช็คสถานะออเดอร์ |
| `verifyStaff` | `email` | ตรวจสอบสิทธิ์ staff |
| `getStaffOrders` | `role`, `email` | ดึงออเดอร์ที่ active |
| `getAgents` | — | รายชื่อ agent ทั้งหมด |
| `getImage` | `fileId` | Proxy รูปจาก Google Drive |
| `getOrderHistory` | `startDate`, `endDate` | ประวัติออเดอร์ |
| `getNews` | — | ข่าวสาร |
| `getContact` | — | ข้อมูลติดต่อ |
| `getBanners` | — | รูป banner หน้าแรก |

### POST Actions

Request format: `Content-Type: application/json`, body: `{ action, data: {...} }`

| Action | Data | Description |
|---|---|---|
| `submitOrder` | order fields | สร้างออเดอร์ใหม่ |
| `uploadSlip` | `orderNumber, fileBase64, mimeType, slipAmount` | อัปสลิป + EasySlip verify |
| `uploadPackageImage` | `orderNumber, images[], totalPrice` | อัปรูปแพ็คเกจ "อื่นๆ" |
| `confirmPrice` | `row, price, staffEmail, assignedTo` | ยืนยันราคา |
| `confirmSlip` | `row, staffEmail, assignedTo, priceConfirmedBy` | ยืนยันสลิป |
| `requestInfo` | `orderNumber, type, types[], staffName` | ขอข้อมูลเพิ่มเติม |
| `replyInfo` | `orderNumber, type, value` | ลูกค้าตอบกลับข้อมูล |
| `replyOTP` | `orderNumber, value` | ลูกค้าส่ง OTP |
| `updateOrderInfo` | `row, emailId?, pass?, uid?, staffEmail` | admin แก้ข้อมูลลูกค้า |
| `assignAgent` | `row, agentEmail, ...logs` | assign agent |
| `acceptJob` | `row` | agent รับงาน |
| `completeOrder` | `row` | เติมเสร็จแล้ว |
| `resolveError` | `row, type, logEntry, existingLog, amount?, note?` | super_admin จัดการ Error |

**`resolveError` types:**

| type | ผล |
|---|---|
| `revert` | status → `Slip Uploaded` |
| `manual` | status → `Processing`, บันทึกยอดใน col S, col X |
| `delete` | status → `Deleted` |
| `note` | status ไม่เปลี่ยน, เพิ่ม log |

---

## Environment Setup

### Cloudflare Worker Secrets

```
SERVICE_ACCOUNT_EMAIL = your-service@project.iam.gserviceaccount.com
SERVICE_ACCOUNT_KEY   = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
SLIP_VERIFY_API_KEY   = your-easyslip-api-key
```

### Firebase Config

สร้างไฟล์ `admin/public/config.js`:

```js
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "....firebaseapp.com",
  projectId: "...",
  storageBucket: "....firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Deployment

### 1. Build React Frontend

```bash
cd kayaman-frontend
npm install
npm run build
```

### 2. Deploy Customer Portal

```bash
firebase deploy --only hosting:order
```

> Deploy จาก `kayaman-frontend/dist/`

### 3. Deploy Admin Panel

```bash
firebase deploy --only hosting:admin
```

> Deploy จาก `admin/public/`

### 4. Deploy Cloudflare Worker

1. เปิด [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → kayaman-api → Edit code
3. วาง Worker code → Deploy

---

## Security

| Layer | Implementation |
|---|---|
| Transport | HTTPS ทุกช่องทาง (Cloudflare + Firebase) |
| Admin Auth | Google OAuth + Staff whitelist ใน Sheets |
| Sensitive Data | Customer credentials แสดงเฉพาะ admin/agent |
| Image Access | Drive files proxy ผ่าน Worker เท่านั้น |
| API Credentials | เก็บเป็น Cloudflare Secrets ไม่อยู่ใน code |
| DDoS | Cloudflare built-in protection |
| Auto-cleanup | ออเดอร์ `Waiting for Transfer` เกิน 30 นาที ถูกลบอัตโนมัติ |

---

## Scalability

| Resource | Limit | Usage (400 orders/day) |
|---|---|---|
| Cloudflare Worker | 100,000 req/day (free) | ~26,000 req/day |
| Firebase Hosting | 10 GB/month | น้อยมาก |
| Google Sheets API | 300 req/min | ~4–5 req/min เฉลี่ย |
| Google Drive | 1 GB/day upload | ขึ้นกับขนาดสลิป |

---

## Roadmap

- [ ] Line Notify — แจ้งเตือน staff ทาง Line เมื่อมีออเดอร์ใหม่
- [ ] Social Name auto-fetch — ดึงชื่อจาก Facebook/Line OAuth
- [ ] Auto-assign — Round-robin กระจายงานให้ agent อัตโนมัติ
- [ ] Rate limiting — จำกัดการส่งออเดอร์ต่อ IP ใน Worker
- [ ] Encrypt passwords — เข้ารหัสรหัสผ่านเกมของลูกค้าก่อนเก็บ

---

## Author

**Anurinth W.**

ระบบนี้ออกแบบและพัฒนาทั้งหมดตั้งแต่เริ่มต้น สำหรับธุรกิจเติมเกมออนไลน์จริง ครอบคลุมตั้งแต่ UI/UX, serverless backend, Google Workspace integration, Firebase multi-site deployment จนถึง custom Cloudflare Worker ที่ implement JWT auth เองโดยไม่ใช้ library ภายนอก

**Key technical highlights:**
- Serverless architecture รองรับ scale โดยไม่มี server ให้ดูแล
- Google Sheets เป็น database — ทีมงานใช้ทำ audit trail และแก้ไขข้อมูลได้โดยตรง
- EasySlip API integration สำหรับ verify สลิปอัตโนมัติ
- Custom JWT signing ใน Cloudflare Worker (Web Crypto API) — ไม่มี cold start จาก heavy library
- Real-time admin dashboard พร้อม notification, overlay-based detail view, และ bulk operations
