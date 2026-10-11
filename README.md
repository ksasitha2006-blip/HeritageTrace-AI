# 🏛️ HeritageTrace AI

A digital identity, neural visual intelligence, and recovery network for vulnerable Indian heritage artefacts.

![HeritageTrace AI Architecture](https://img.shields.io/badge/Status-Active%20%7C%20Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TailwindCSS%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20MongoDB-green)

---

## 🌟 Overview & Key Capabilities

**HeritageTrace AI** solves the core bottleneck in recovering illicitly trafficked Indian antiquities: **instant provenance matching and inter-agency legal coordination**.

- **🏛️ Temple Administrator Workspace**: Catalogue sacred idols and relics with millimeter dimensions, material composition (e.g. Panchaloha, Chlorite Sandstone), temple sanctuary records, and tamper-evident QR digital passport tags. Immediate one-click theft broadcast.
- **🔍 Investigator / Customs / DRI Portal**: Confiscated contraband scanning with instant AI neural feature extraction. Runs cross-matches against stolen art circulars and FIR databases.
- **⚡ AI Visual Feature Match Engine**: Evaluates 512-D keypoint geometry, posture alignment (mudras, Talamana Shastra canons), and flame aureole contours with confidence metrics.
- **🛡️ ASI Expert Authentication Workbench**: Multi-tier scientific examination pipeline (XRF Spectrometry, metallurgical alloy signatures, inscriptional paleography). Generates official Certificates of Authenticity (COA) and legal recovery dockets.
- **⚖️ Central Authority Command (Interpol Liaison)**: Generates standardized Interpol Stolen Works of Art (WOA) Red/Yellow Notices, broadcasts emergency nationwide border alerts, and manages the sovereign digital art ledger.
- **🌐 Public National Registry Explorer**: Search, filter, and inspect high-resolution digital dossiers of protected national treasures.

---

## 📂 Project Structure

```
HeritageTrace-AI/
├── client/                                # React frontend (Vite)
│   ├── public/
│   │   ├── images/                        # High-resolution heritage artefact photographs
│   │   │   ├── nataraja.jpg               # Chola Bronze Nataraja (11th Century)
│   │   │   ├── vishnu.jpg                 # Gupta Sandstone Vishnu (5th Century)
│   │   │   ├── shiva_parvati.jpg          # Chandela Uma-Maheshvara (10th Century)
│   │   │   ├── buddha_sarnath.jpg         # Sarnath Preaching Buddha (5th Century)
│   │   │   └── konark_wheel.jpg           # Konark Sun Temple Chariot Wheel (13th Century)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Global navigation with dynamic role switcher
│   │   │   ├── Footer.jsx                 # Compliance and site-wide links
│   │   │   ├── ArtefactCard.jsx           # Grid item card
│   │   │   ├── StatCard.jsx               # Metric card
│   │   │   └── Loader.jsx                 # Loading spinner
│   │   ├── context/
│   │   │   └── ArtefactContext.jsx        # Unified reactive store with persistence & fallback
│   │   ├── pages/
│   │   │   ├── HomePage.jsx               # Landing page with hero & live registry telemetry
│   │   │   ├── ArtefactsPage.jsx          # National Registry Explorer with dossier modal
│   │   │   ├── DashboardPage.jsx          # Telemetry dashboard & live national audit log
│   │   │   ├── AboutPage.jsx              # Mission, four architectural pillars & AMASR compliance
│   │   │   ├── LoginPage.jsx              # Credentials & one-click demo role logins
│   │   │   ├── RoleSelectionPage.jsx      # Workspace role selection hub
│   │   │   ├── TempleAdminDashboard.jsx   # Temple inventory & QR passport generator
│   │   │   ├── RegisterArtefactPage.jsx   # New artefact onboarding with sample presets
│   │   │   ├── InvestigatorDashboard.jsx  # Confiscation log & active theft circulars
│   │   │   ├── UploadRecoveredArtefactPage.jsx # Confiscation logging with sample loader
│   │   │   ├── SearchResultsPage.jsx      # AI neural match, keypoint overlay & ASI flagger
│   │   │   ├── ASIExpertVerificationPage.jsx # Forensic checklist & Certificate of Authenticity generator
│   │   │   └── AuthorityAdminDashboard.jsx   # Interpol notice generator & alert broadcaster
│   │   ├── services/
│   │   │   └── api.js                     # Axios service layer
│   │   ├── App.jsx                        # Unified routing
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Bespoke Indian heritage styling & animations
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                                # Node.js backend (Express)
│   ├── config/
│   │   └── db.js                          # Resilient MongoDB connector
│   ├── controllers/
│   │   ├── artefactController.js          # CRUD operations & text search
│   │   └── statsController.js             # Telemetry stats
│   ├── models/
│   │   └── Artefact.js                    # Mongoose schema with text indexing
│   ├── routes/
│   │   ├── artefactRoutes.js              # REST endpoints
│   │   └── statsRoutes.js                 # Stats endpoints
│   ├── seed.js                            # MongoDB seed script
│   ├── server.js                          # Express app entry point
│   ├── .env                               # Server environment variables
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

To start the frontend and Node.js API from the project root, install each package and run:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

Or start the backend and frontend separately using the steps below.

### 1. Start the Backend API

```bash
cd server
npm install
npm run dev              # Starts Express on http://localhost:5000
npm run seed             # (Optional) Seed initial records into MongoDB
```

If MongoDB is not running locally, the server automatically falls back to the bundled heritage demo dataset so the application remains usable in standalone mode.

### 2. Start the Frontend Application

```bash
cd client
npm install
npm run dev              # Starts Vite on http://localhost:5173
```

Visit **http://localhost:5173** to use the application.

### 3. Start the AI Matching Service

The **Find Matches** feature also requires the Python FastAPI service. Start it in a
separate terminal:

```bash
cd ai_agent_service
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Keep this service running while using image matching. Its API should respond at
**http://localhost:8001/health**.

---

## 🎭 Role-Based Workspaces Guide

| Role | Route | Primary Responsibilities |
| :--- | :--- | :--- |
| **Public Visitor** | `/` & `/artefacts` | Search registered treasures, review dossiers, view national analytics. |
| **Temple Administrator** | `/temple-dashboard` | Register new idols, toggle safe/missing status, generate QR security tags. |
| **Investigator (DRI/Customs)** | `/investigator-dashboard` | Upload photos of seized contraband, run AI visual matching, flag matches for ASI. |
| **ASI Expert** | `/asi-verification` | Forensic XRF & Talamana inspection, issue signed Certificate of Authenticity (COA). |
| **Central Authority** | `/authority-dashboard` | Issue nationwide border alerts, generate Interpol Red/Yellow Notices, export JSON ledger. |
| **System Admin** | `/authority-dashboard` | Review the activity feed, manage demo users and roles, and view registry analytics. |

External agency integrations shown in the interface are simulated for demonstration; no live ASI or Interpol connection is made.

---

## 📄 Statutory & International Alignment

- **The Antiquities and Art Treasures Act, 1972** (Act No. 52 of 1972)
- **1970 UNESCO Convention** on the Means of Prohibiting and Preventing the Illicit Import, Export and Transfer of Ownership of Cultural Property
- **Interpol Works of Art (WOA)** Database Standard Transmission Schema

---

## 📄 License

MIT
