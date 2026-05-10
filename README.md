# 🎮 Kayaman Game Shop — Order Management System

A full-stack web application for managing game top-up orders, built for a real gaming business. The system handles the entire order lifecycle from customer submission to staff verification and completion.

---

## 🌐 Live Demo

| Site | URL |
|---|---|
| Customer Portal | [order.kayamanshop.com](https://order.kayamanshop.com) |
| Admin Panel | [kayaman-admin.web.app](https://kayaman-admin.web.app) |

---

## ✨ Features

### Customer Portal
- Browse games with search functionality (4-column responsive grid)
- Select packages with quantity control
- **"Other" package option** — upload custom package image for staff review
- Real-time order status tracking by Order Number or Customer Name + Game
- Secure slip upload with image compression
- Payment accordion with copy-to-clipboard support
- Auto-polling for price confirmation (every 1 second)

### Admin Panel
- Google OAuth login with Staff whitelist (managed via Google Sheets)
- Dashboard showing only actionable orders: **Pending Review**, **Slip Uploaded**, **Error**
- **Price confirmation popup** — view customer's package image, set price
- **Slip verification popup** — view uploaded slip, verify amount
- Auto-refresh every 30 seconds (pauses when modal is open)
- Full audit trail: who confirmed price, who verified slip, with timestamps
- Secure image proxying through Cloudflare Worker (no public Drive access needed)

---

## 🏗️ Architecture

```
Customer Browser
      │
      ▼
Firebase Hosting (order.kayamanshop.com)
      │
      ▼
Cloudflare Worker API (kayaman-api.skizztv.workers.dev)
      │
      ├──▶ Google Sheets API (Database)
      └──▶ Google Drive API (File Storage)

Admin Browser
      │
      ▼
Firebase Hosting (kayaman-admin.web.app)
      │
      ├──▶ Firebase Authentication (Google OAuth)
      └──▶ Cloudflare Worker API
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend API | Cloudflare Workers (Serverless) |
| Authentication | Firebase Authentication (Google OAuth) |
| Hosting | Firebase Hosting (Multi-site) |
| Database | Google Sheets API v4 |
| File Storage | Google Drive API v3 |
| Auth (API) | Google Service Account + JWT |
| Domain | Squarespace DNS → Custom Domain |

---

## 📊 Google Sheets Structure

### Main Sheet (Orders)
| Column | Field | Description |
|---|---|---|
| A | Date | Order timestamp |
| B | Order Number | Format: KM-DDMM-XXXX |
| C | Order From | Channel (Line/Facebook/Direct) |
| D | Social Name | Customer's social media name |
| E | Customer Name | Name from form |
| F | Customer Type | Normal / VIP |
| G | Game | Selected game |
| H | Platform | PC / iOS / Android |
| I | Login Form | Login method |
| J | E-Mail / ID | Game account |
| K | Pass | Game password |
| L | Character Name | In-game character |
| M | Level | Character level |
| N | Server | Game server |
| O | UID | User ID |
| P | Package | Selected packages |
| Q | Package Image | Drive URL for "Other" packages |
| R | Order Price | Final price (set by staff) |
| S | Slip Price | Amount in slip |
| T | Slip Image | Drive URL of payment slip |
| U | Order Status | Current status |
| V | Assigned To | Staff + timestamp |
| W | Price Confirmed By | Staff + timestamp |
| X | Slip Confirmed By | Staff + timestamp |

### Other Sheets
- **Packages** — Game packages with prices
- **Options** — Dropdown options for form fields
- **Games** — Game list with icon and price board images
- **Fields** — Dynamic form fields per game
- **Payment** — Payment methods (bank, PromptPay, TrueMoney)
- **Staff** — Whitelist for admin access

---

## 🔄 Order Flow

```
Customer selects game & package
           │
           ├── Normal package ──▶ Fill form ──▶ Submit
           │                                      │
           │                              Status: Prepare
           │                                      │
           └── "Other" package ──▶ Upload image ──▶ Submit
                                                    │
                                           Status: Pending Review
                                                    │
                                         Staff reviews image
                                         Staff sets price
                                                    │
                                      Status: Waiting for Transfer
                                                    │
                                     Customer uploads payment slip
                                                    │
                                           Status: Slip Uploaded
                                                    │
                                      Staff verifies slip amount
                                                    │
                                           Status: Processing
                                                    │
                                         Staff completes top-up
                                                    │
                                           Status: Completed
```

---

## 🔐 Security

- **HTTPS** — All traffic encrypted via Cloudflare + Firebase
- **Google OAuth** — Admin access requires verified Google account
- **Staff Whitelist** — Only emails in Staff sheet can access admin panel
- **Image Proxy** — Drive images served through Worker (no public Drive access)
- **Service Account** — Credentials stored as Cloudflare Secrets, never in code
- **Rate Limiting** — Per-IP rate limiting on Cloudflare Worker
- **AES-256 Encryption** — Customer passwords encrypted at rest before storing in Google Sheets
- **Password Masking** — Passwords displayed as `•••••` in Admin UI by default
- **Audit Log** — Every password view/copy action recorded with staff identity and timestamp (Column Y)
- **Auto-deletion** — Customer passwords automatically wiped from storage upon order completion

---

## 📁 Project Structure

```
kayaman-shop/
├── public/                 # Customer portal
│   └── index.html
├── admin/
│   └── public/             # Admin panel
│       └── index.html
├── functions/              # Legacy Firebase Functions (unused)
│   └── index.js
├── firebase.json           # Multi-site hosting config
└── .firebaserc             # Firebase project config
```

> **Note:** Cloudflare Worker code is deployed directly via Cloudflare Dashboard and is not included in this repository.

---

## ⚙️ Environment Setup

### Cloudflare Worker Secrets
```
SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Firebase Config (admin/public/index.html)
```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🚀 Deployment

### Customer Portal
```bash
firebase deploy --only hosting:order
```

### Admin Panel
```bash
firebase deploy --only hosting:admin
```

### Cloudflare Worker
Deploy via Cloudflare Dashboard → Workers & Pages → kayaman-api → Edit code → Deploy

---

## 📈 Scalability

| Resource | Free Tier Limit | Estimated Usage (400 orders/day) |
|---|---|---|
| Cloudflare Worker | 100,000 req/day | ~26,000 req/day |
| Firebase Hosting | 10 GB/month | Minimal |
| Google Sheets API | 300 req/min | Well within limits |

---

## 🗺️ Roadmap

- [ ] Line Notify — alert staff on new orders
- [ ] EasySlip integration — automatic slip verification
- [ ] Social Name auto-fetch from Facebook/Line OAuth
- [ ] Auto-assign orders to available staff (Round Robin)
- [x] Rate limiting per IP in Cloudflare Worker
- [x] Encrypt customer passwords at rest

---

## 👨‍💻 Author

Built by **Anurinth W.** — A complete full-stack system designed, architected, and developed from scratch for a real gaming business.

- Frontend: Responsive UI with vanilla HTML/CSS/JS
- Backend: Serverless API with Google Workspace integration  
- DevOps: Multi-site Firebase Hosting with custom domain
