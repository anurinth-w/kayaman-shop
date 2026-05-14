# 🎮 Kayaman Game Shop — Order Management System

> A full-stack order management system for a real game top-up business.  
> Designed, developed, and deployed by **Anurinth W.**

---

## 🌐 Live Demo

| Site | URL |
|---|---|
| Customer Portal |  |

---

## 📖 Overview

A complete order lifecycle management system for a game top-up business — from package selection and payment, to slip verification and top-up completion. Built for a real business handling hundreds of orders per day.

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Customer Frontend | React 19 + React Router 7 + Vite | `/kayaman-frontend/` |
| Admin Frontend | Vanilla HTML/CSS/JS | `/admin/public/` |
| Customer Portal (legacy) | Vanilla HTML/CSS/JS | `/public/` |
| Backend API | Cloudflare Workers (Serverless) | Not included in this repo |
| Authentication | Firebase Authentication (Google OAuth) | Admin-only |
| Hosting | Firebase Hosting (Multi-site) | |
| Database | Google Sheets API v4 | No traditional DB |
| File Storage | Google Drive API v3 | Slips + package images |
| Service Account Auth | Google JWT (custom implementation) | No googleapis library |
| Domain | Custom domain via Squarespace DNS | |

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  Customer Browser   │     │   Admin Browser     │
│ order.kayamanshop   │     │  (Firebase Hosting) │
└────────┬────────────┘     └────────┬────────────┘
         │ Firebase Hosting           │ Firebase Hosting
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│              Cloudflare Worker API              │
│         kayaman-api.skizztv.workers.dev         │
│                                                 │
│  GET  init data · order status · staff auth     │
│       staff orders · agents · image proxy       │
│       order history · news · contact            │
│                                                 │
│  POST submit order · upload slip · upload pkg   │
│       confirm price · confirm slip · assign     │
│       accept job · complete · request info      │
│       reply info · reply OTP · resolve error    │
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

## 📁 Project Structure

```
kayaman-shop/
├── kayaman-frontend/           # React SPA (Customer Portal)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             # Routes: Home, TopupList, Topup, Payment,
│   │   │                       #         Pending, Order, Card, News, Contact
│   │   ├── components/         # Shared components (Navbar, etc.)
│   │   ├── pages/              # Page components per route
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # CSS modules per component
│   ├── public/
│   ├── dist/                   # Build output (Firebase deploy target)
│   ├── package.json
│   └── vite.config.js
│
├── public/                     # Legacy Customer Portal (Vanilla JS)
│   └── index.html              # Single-page app
│
├── admin/
│   └── public/                 # Admin Panel
│       ├── index.html          # Main dashboard
│       ├── history.html        # Order history (super_admin only)
│       └── config.js           # Firebase config (gitignored)
│
├── functions/                  # Legacy Firebase Functions (unused)
│   └── index.js
│
├── firebase.json               # Multi-site hosting config
├── .firebaserc                 # Firebase project + targets
└── README.md
```

> **Note:** Cloudflare Worker code is deployed directly via Cloudflare Dashboard and is not included in this repository.

---

## 📊 Google Sheets Schema

### Sheet: Main (Orders)

| Col | Field | Description |
|---|---|---|
| A | Date | Order creation timestamp |
| B | Order Number | Format: `KM-XXXXXX` (6 random chars) |
| C | Order From | Channel: Line / Facebook / Direct |
| D | Social Name | Customer's social media name |
| E | Customer Name | Name from order form |
| F | Customer Type | Normal / VIP |
| G | Game | Selected game |
| H | Platform | PC / iOS / Android |
| I | Login Form | Login method |
| J | E-Mail / ID | Game account |
| K | Pass | Game password (AES-256 encrypted) |
| L | Character Name | In-game character name |
| M | Level | Character level |
| N | Server | Game server |
| O | UID | User ID |
| P | Package | Selected packages |
| Q | Package Image | Drive URL for custom package image |
| R | Order Price | Final price (set by staff) |
| S | Slip Price | Amount from slip (EasySlip verified) |
| T | Slip Image | Drive URL of payment slip |
| U | Order Status | Current status (see below) |
| V | Assigned To | Staff + timestamp |
| W | Price Confirmed By | Staff + timestamp |
| X | Slip Confirmed By | Staff + timestamp |
| Y | Action Log | Append-only action log (newline-separated) |
| Z | Agent Email | Assigned agent's email |

### Order Status Values

| Status | Meaning | Visible To |
|---|---|---|
| `Prepare` | Order created, awaiting confirmation | Not shown in admin |
| `Pending Review` | Custom package awaiting staff review + pricing | Admin: Pending Review tab |
| `Waiting for Transfer` | Awaiting customer payment | Admin: Waiting tab |
| `Slip Uploaded` | Slip submitted, awaiting staff verification | Admin: Slip Uploaded tab |
| `Processing` | Slip verified, awaiting agent assignment | Admin: Processing tab |
| `Assigned` | Agent assigned, awaiting acceptance | Admin: My Jobs tab |
| `In Progress` | Agent accepted, top-up in progress | Admin: My Jobs tab |
| `Need Info: [types]` | Awaiting customer info e.g. `Need Info: Password, Email` | Admin: Need Info tab |
| `Error` | Issue occurred (slip mismatch, API failure, etc.) | Admin: Error tab |
| `Completed` | Top-up completed | History |
| `Deleted` | Removed by super_admin | Hidden |

### Sheet: Staff

| Col | Field |
|---|---|
| A | Email |
| B | Display Name |
| C | Role (`super_admin` / `admin` / `staff` / `agent`) |

### Staff Roles

| Role | Permissions |
|---|---|
| `super_admin` | All tabs, order history, error management, delete orders, price confirmation, slip verification, agent assignment |
| `admin` | Price confirmation, slip verification, request info, edit customer info |
| `staff` | View orders |
| `agent` | View assigned jobs only, accept job, complete top-up, request info |

### Sheet: Packages

| Col | Field |
|---|---|
| A | Game |
| B | Category |
| C | Package Name |
| D | Price |
| E | Original Price (strikethrough) |
| F | Image URL |
| G | Description |
| H | Available (`Yes`/`No`) |

### Sheet: Games

| Col | Field |
|---|---|
| A | Game Name |
| B | Icon URL |
| C | Price Board Image URL |
| D | Group With |

---

## 🔄 Order Flow

```
Customer selects game
       │
       ├─ Standard package ─────────────────────────────────────────────────┐
       │                                                                      │
       └─ Custom package ──▶ Upload package image ──▶ Status: Pending Review │
                                                               │              │
                                                   Staff reviews + sets price │
                                                               │              │
                                                               └────────────┐ │
                                                                            ▼ ▼
                                                               Status: Waiting for Transfer
                                                                            │
                                           ┌────────────────────────────────┤
                                           │  EasySlip auto-verification    │
                                           │                                │
                                    Customer uploads slip ───────────────────┘
                                           │
                              ┌────────────┼────────────┐
                         Amount OK    Amount mismatch   API failure
                              │            │              │
                     Status: Slip    Status: Error  Status: Error
                      Uploaded             │              │
                              │      super_admin   super_admin
                       Staff verify   handles error  handles error
                              │
                    Status: Processing
                              │
                    super_admin assigns ──▶ Status: Assigned
                              │
                       Agent accepts ──▶ Status: In Progress
                              │
                    (If info needed ──▶ Status: Need Info: [types]
                              │              Customer replies
                              │          Status: Processing)
                              │
                    Agent completes ──▶ Status: Completed
```

---

## 🖥️ Admin Panel Features

### Pending Review Tab
- Orders with custom packages awaiting review
- **Set Price** button: view package image, set price per item with auto-total

### Slip Uploaded Tab
- Orders that passed EasySlip verification, awaiting staff confirmation
- **Verify Slip** button: view slip image, compare amounts
- **📤 Upload Slip on behalf of customer**: for slips sent via Line

### Need Info Tab
- Orders awaiting additional customer information
- **✏️ Edit Info** button: admin can directly update Email/ID, Password, UID

### Waiting for Transfer Tab
- Orders awaiting customer payment

### Processing Tab
- Slip-verified orders awaiting agent assignment
- Checkbox for bulk-assigning multiple orders at once
- **Request Info 📋** button: send info request to customer (Password, Email/ID, UID, OTP)

### Error Tab
- Orders with issues, showing error reason from action log
- **🛠️ Manage Error** button (super_admin only):
  - 🔄 Revert status to Slip Uploaded
  - ✏️ Manually enter slip amount
  - 🗑️ Mark as Deleted
  - 📝 Add note without changing status

### My Jobs Tab
- Agent view: orders assigned to the current user
- **Accept Job** button: transitions to In Progress (one-time lock)
- **Mark Complete** button: closes the order
- **Request Info** button: available before and after accepting

### Order Detail Overlay
- Click any order card → full-screen overlay with all order details
- **Copy** buttons next to Email/ID, Password, UID
- Action Log (Column Y) rendered as a timeline
- All action buttons accessible from within the overlay

### Other Features
- **New Order Notification**: Web Audio API alert + toast notification (top-right)
- **Auto-refresh**: every 5 seconds, pauses when modal is open, updates overlay without closing
- **Bulk Assign**: select multiple orders and assign to an agent in one action
- **Order History** (super_admin): date range filter, search, sortable columns, summary stats

---

## 🛒 Customer Portal Features (React)

| Page | Path | Description |
|---|---|---|
| Home | `/` | Landing page, banners, news |
| Topup List | `/topup` | All available games |
| Topup | `/topup/:game` | Package selection + order form |
| Payment | `/payment` | Payment methods + slip upload |
| Pending | `/pending` | Waiting for staff package review |
| Order Status | `/order` | Track order by number or name |
| Card | `/card` | Gift cards |
| News | `/news` | Announcements |
| Contact | `/contact` | Contact information |

---

## 🔌 API Overview

Base URL: `https://kayaman-api.skizztv.workers.dev`

The Worker API handles all business logic between the frontend and Google Workspace. It covers three areas:

**Data retrieval** — game catalog, packages, order status, staff verification, image proxying, order history, news, and banners.

**Order lifecycle** — order submission, slip upload with EasySlip verification, price confirmation, slip confirmation, agent assignment, job acceptance, and completion.

**Staff operations** — requesting customer info (password, email, UID, OTP), replying to info requests, editing order fields, and resolving errors (revert, manual entry, delete, or note).

All POST requests use `Content-Type: application/json` with body format `{ action, data: {...} }`.

---

## ⚙️ Environment Setup

### Cloudflare Worker Secrets

```
SERVICE_ACCOUNT_EMAIL = your-service@project.iam.gserviceaccount.com
SERVICE_ACCOUNT_KEY   = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
SLIP_VERIFY_API_KEY   = your-easyslip-api-key
```

### Firebase Config

Create `admin/public/config.js`:

```js
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🚀 Deployment

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

> Deploys from `kayaman-frontend/dist/`

### 3. Deploy Admin Panel

```bash
firebase deploy --only hosting:admin
```

> Deploys from `admin/public/`

### 4. Deploy Cloudflare Worker

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → kayaman-api → Edit code
3. Paste Worker code → Deploy

---

## 🔐 Security

| Layer | Implementation |
|---|---|
| Transport | HTTPS on all channels via Cloudflare + Firebase |
| Admin Auth | Google OAuth + Staff whitelist in Google Sheets |
| Role-Based Access | Credentials visible to admin/agent roles only |
| Password Encryption | AES-256 encryption before storing in Google Sheets |
| Password Masking | Displayed as `•••••` in Admin UI; view/copy requires intentional action |
| Audit Log | Every password view/copy recorded with staff identity + timestamp (Column Y) |
| Auto-deletion | Customer passwords wiped automatically on order completion |
| Image Access | Drive files proxied through Cloudflare Worker — no public Drive URLs exposed |
| API Credentials | Stored as Cloudflare Secrets, never hardcoded |
| Rate Limiting | Per-IP rate limiting enforced in Cloudflare Worker |
| DDoS Protection | Cloudflare built-in DDoS mitigation |
| Auto-cleanup | Orders stuck in `Waiting for Transfer` over 30 minutes are purged automatically |

---

## 📈 Scalability

| Resource | Free Tier Limit | Estimated Usage (400 orders/day) |
|---|---|---|
| Cloudflare Worker | 100,000 req/day | ~26,000 req/day |
| Firebase Hosting | 10 GB/month | Minimal |
| Google Sheets API | 300 req/min | ~4–5 req/min average |
| Google Drive | 1 GB/day upload | Depends on slip image size |

---

## 🗺️ Roadmap

- [ ] Line Notify — alert staff on new orders via Line
- [ ] Social Name auto-fetch — pull names from Facebook/Line OAuth
- [ ] Auto-assign — round-robin order distribution to agents
- [x] Rate limiting — per-IP limits enforced in Cloudflare Worker
- [x] Password encryption — AES-256 encryption for customer credentials at rest

---

## 👨‍💻 Author

**Anurinth W.**

Designed and built end-to-end for a real game top-up business — covering UI/UX, serverless backend, Google Workspace integration, Firebase multi-site deployment, and a custom Cloudflare Worker with self-implemented JWT signing using the Web Crypto API (no external libraries).

**Key technical highlights:**
- Serverless architecture — scales without managing servers
- Google Sheets as the database — enables direct audit trail and non-technical staff edits
- EasySlip API integration for automatic slip verification
- Custom JWT signing in Cloudflare Worker (Web Crypto API) — zero cold start from heavy libraries
- Real-time admin dashboard with notifications, overlay-based order detail view, and bulk operations
