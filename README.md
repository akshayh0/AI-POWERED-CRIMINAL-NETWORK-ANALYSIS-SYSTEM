# 🛡️ AI-Powered Criminal Network Analysis System

A web-based crime intelligence platform (**KSP AI-Portal**) that helps analyze criminal cases, accused persons, victims, officers, districts, police stations, and the relationships between criminal entities.

---

## 📌 Problem Statement

- Crime information is fragmented
- Hard to find links between cases and criminals
- Trends and hotspots are hard to discover
- Manual analysis is slow and time-consuming
- No centralized intelligent analysis

## ✅ Solution

- Centralized PostgreSQL crime database
- Criminal network analysis of relationships
- Trend, hotspot and anomaly analysis
- Fast web dashboard with live KPIs
- AI-assisted insights and chat (Groq API)

---

## ✨ Modules

| Analytics & Records | AI Intelligence |
|---|---|
| Dashboard / KPI analytics | AI predictions |
| Case management | Crime hotspots |
| Accused analysis | Anomaly detection |
| Victim analysis | Similar case analysis |
| Officer analysis | Criminal network analysis |
| District / station analysis | AI chat |

---

## 🏗️ System Architecture

```
User → React Frontend → REST API → Flask Backend → PostgreSQL (Render)
                                        │
                                        └──► Groq AI Service
```

| Layer | Role |
|---|---|
| React Frontend | Dashboards, tables, network graph, chat UI |
| REST API | JSON over HTTP between frontend and backend |
| Flask Backend | Business logic, database queries, AI requests |
| PostgreSQL | Stores FIRs, accused, victims, stations |
| Groq API | AI-powered analysis and chat |

---

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, Flask, Flask-CORS, Gunicorn |
| Database | PostgreSQL |
| AI | Groq API |
| Deployment | Vercel (frontend & backend), Render (PostgreSQL database) |

---

## 🕸️ Criminal Network Analysis

Relationships are shown as a graph of connected entities:

```
Accused → Case → Victim
Accused → Associated Case
Case → District
Case → Police Station
```

Investigators can follow links from an accused to related cases, people, and locations.

---

## 📊 Current Database Statistics

Verified through the deployed API (`GET /api/cases/kpis`):

| Metric | Count |
|---|---|
| Total FIRs | 120 |
| Solved cases | 110 (Closed 59 + Charge-sheeted 51) |
| Pending cases | 10 |
| Total accused | 79 |
| Total victims | 120 |
| Districts | 7 |
| Police stations | 29 |
| Today's FIRs | 1 |

### Example API

```http
GET /api/cases/kpis
```

```json
{
  "charge_sheeted": 51,
  "closed_cases": 59,
  "pending_cases": 10,
  "solved_cases": 110,
  "today_firs": 1,
  "total_accused": 79,
  "total_districts": 7,
  "total_firs": 120,
  "total_stations": 29,
  "total_victims": 120
}
```

---

## 🚀 Deployment & Verification

- Frontend deployed on **Vercel**
- Backend deployed on **Vercel**
- PostgreSQL database hosted on **Render**
- Database connection verified
- API response verified with HTTP 200
- CORS verified
- Frontend/backend integration verified
- Production dashboard displays database data

---

## 🖼️ Screenshots

Add your screenshots to a `docs/screenshots/` folder and update the file names below.

| Login | Command Center |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Criminal Linkage Network | AI Intelligence Modules |
|---|---|
| ![Network](docs/screenshots/network.png) | ![AI](docs/screenshots/ai-modules.png) |

| Crime Map | Officer Registry |
|---|---|
| ![Map](docs/screenshots/map.png) | ![Officers](docs/screenshots/officers.png) |

---

## ⚙️ Local Setup

> Adjust folder names and environment variable names below to match your repository.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file (example names, use the ones your code reads):

```env
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
```

```bash
flask run                       # development
gunicorn app:app                # production (change "app:app" to your entry point)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the backend API URL in the frontend environment file (for example `VITE_API_URL`).

---

## 🔮 Future Scope

- More advanced graph / network algorithms
- Improved predictive analytics
- Real-time police data integration
- More advanced anomaly detection
- Role-based access control enhancements
- Mobile application
- More sophisticated AI models

---

## 👥 Team

| Name | Role |
|---|---|
| Akshay H | Team TRAILBLAZERS |
| Omkar K S | Team TRAILBLAZERS |

---

> ⚠️ Cap Stone project. AI-generated insights are decision-support aids and must not replace investigator judgment.
