# Karnataka State Police - AI-Driven Crime Analytics & Intelligence Platform

An enterprise-grade Crime Intelligence System featuring interactive dashboards, crime hotspot mapping, criminal network graph visualizations, statistical trend forecasts, anomaly detection, and an AI investigation assistant.

---

## 🏛 Architecture Overview

```
                      +-----------------------------+
                      |       Netlify Edge          |
                      |   (React 19 + TypeScript)   |
                      +--------------+--------------+
                                     |
                                     | HTTPS API Calls (VITE_API_URL)
                                     v
                      +-----------------------------+
                      |       Render Backend        |
                      |      (Python / Flask)       |
                      +--------------+--------------+
                                     |
                                     | Queries & Analytics
                                     v
                      +-----------------------------+
                      |    crime_intelligence.db    |
                      |          (SQLite)           |
                      +-----------------------------+
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet, Recharts, React Flow (Hosted on **Netlify**).
- **Backend**: Python 3.11+, Flask, Flask-CORS, Gunicorn, Scikit-Learn/Pure-Python analytics (Hosted on **Render**).
- **Database**: Bundled SQLite database (`crime_intelligence.db`) with 120+ pre-populated FIRs, suspects, victims, chargesheets, and unit hierarchies.

---

## 🚀 Local Development

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (runs on port 5000)
python main.py
```

The backend health check is available at: `http://localhost:5000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Open `http://localhost:5173/app/` in your browser.

---

## 🌐 Production Deployment

### Backend -> Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app`
4. Add Environment Variables:
   - `PORT`: `10000` (Render will override automatically with assigned port)
   - `FRONTEND_URL`: `https://YOUR-SITE-NAME.netlify.app`
   - `DATABASE_PATH`: `crime_intelligence.db`

### Frontend -> Netlify

1. Create a new **Site** on [Netlify](https://netlify.app).
2. Connect your GitHub repository.
3. Configure the build settings (or let `netlify.toml` configure it automatically):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://YOUR-RENDER-BACKEND.onrender.com`

---

## 📡 API Endpoints Summary

All routes are accessible both with and without the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health and status check |
| `GET` | `/api/cases` | Paginated case records with filters (`district_id`, `station_id`, `search`, etc.) |
| `GET` | `/api/cases/<id>` | Full detail of a case including occurrence, victims, accused, and acts |
| `GET` | `/api/cases/kpis` | Executive KPI summary (Total FIRs, solved count, active suspects, etc.) |
| `GET` | `/api/cases/trends` | Monthly and yearly crime trend aggregation |
| `GET` | `/api/cases/districts` | Crime count by district |
| `GET` | `/api/cases/stations` | Crime count by police station |
| `GET` | `/api/cases/categories` | Crime classification distribution |
| `GET` | `/api/cases/demographics` | Demographic breakdown (gender, age groups, religion, caste) |
| `GET` | `/api/cases/officers` | Officer case load and resolution stats |
| `GET` | `/api/cases/accused` | Accused profiles with repeat-offender risk scores |
| `GET` | `/api/cases/accused/<person_id>` | Detailed profile and case history of a specific accused |
| `GET` | `/api/cases/victims` | Victim profiles and demographics |
| `GET` | `/api/ai/hotspots` | Spatial cluster analysis for geographic crime hotspots |
| `GET` | `/api/ai/forecast` | 6-month statistical crime trend forecast with confidence bounds |
| `GET` | `/api/ai/districts-risk` | District-level threat posture and patrol recommendations |
| `GET` | `/api/ai/anomalies` | Multivariate anomaly detection on case timeline and gravity |
| `GET` | `/api/ai/similar-cases/<id>` | Cosine similarity fact-matching for Modus Operandi |
| `GET` | `/api/ai/network` | Node-link graph topology for cases, accused, stations, and accomplices |
| `POST` | `/api/ai/chat` | Natural language intelligence assistant for case queries |
| `POST` | `/api/upload` | Evidence media upload endpoint |
| `POST` | `/api/ocr` | Optical character recognition text extraction |
| `POST` | `/api/vision/face-recognize` | Facial comparison verification |
| `POST` | `/api/vision/object-detect` | Evidence object detection |
| `POST` | `/api/predict` | Crime volume and repeat risk prediction |
| `POST` | `/api/reports/generate` | Intelligence report compilation |

---

## 🔒 Security & Git Hygiene

- `.env` files and virtual environments are excluded via `.gitignore`.
- Reference configuration templates provided:
  - `backend/.env.example`
  - `frontend/.env.example`
- Zero hardcoded local machine paths or secrets.
