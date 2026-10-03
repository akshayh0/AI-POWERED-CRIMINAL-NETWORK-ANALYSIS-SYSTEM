# AI-Powered Criminal Network Analysis System

An AI-powered web platform designed to help analyze crime records, identify relationships between criminals and cases, visualize crime patterns, and generate intelligent insights from centralized crime data.

## 🔗 Project Links

- 🌐 **Live Application:** [https://ai-powered-criminal-network-frontend.vercel.app/](https://ai-powered-criminal-network-fronten.vercel.app/)
- 💻 **GitHub Repository:** https://github.com/akshayh0/AI-POWERED-CRIMINAL-NETWORK-ANALYSIS-SYSTEM
- 📄 **Project Report:** `documents/AI_Criminal_Network_Analysis_Report.pdf`
- 📊 **Seminar PPT:** `documents/AI_Criminal_Network_Analysis_Seminar.pptx`

## 📌 Project Overview

The AI-Powered Criminal Network Analysis System is a web-based crime intelligence platform that combines:

- Crime data management
- Criminal relationship analysis
- Crime trend analysis
- Hotspot identification
- Anomaly detection
- Similar case analysis
- AI-powered crime intelligence
- Interactive dashboards and visualizations

The system provides a centralized platform where authorized users can analyze crime-related information instead of relying on fragmented and manual analysis.

---

## 🎯 Problem Statement

Traditional crime analysis can involve fragmented data, manual investigation, and difficulty in identifying relationships between cases, accused persons, victims, districts, and police stations.

This project aims to provide a centralized intelligent platform that makes crime data easier to access, analyze, visualize, and interpret.

---

## 💡 Proposed Solution

The system provides a centralized web application connected to a PostgreSQL database and an AI-powered backend.

It allows users to:

1. View crime statistics and KPIs.
2. Search and analyze crime cases.
3. Analyze accused persons and victims.
4. Explore relationships between cases and criminals.
5. Identify crime trends and hotspots.
6. Detect unusual crime patterns.
7. Find similar cases.
8. Generate AI-assisted insights using the Groq API.
9. Interact with an AI crime intelligence assistant.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    │ Officers / Analysts │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │ Dashboard & Modules │
                    └──────────┬──────────┘
                               │
                               │ REST API / JSON
                               ▼
                    ┌─────────────────────┐
                    │   Flask Backend     │
                    │ Business Logic & AI │
                    └───────┬───────┬─────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
      ┌──────────────────┐             ┌─────────────────┐
      │   PostgreSQL     │             │    Groq API     │
      │   Crime Data     │             │  AI Analysis    │
      └──────────────────┘             └─────────────────┘
````

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3
* JavaScript

## Backend

* Python
* Flask
* Flask-CORS
* Gunicorn
* REST APIs

## Database

* PostgreSQL

## AI / Analytics

* Groq API
* AI-assisted analysis
* Crime trend analysis
* Hotspot analysis
* Anomaly detection
* Similar case analysis
* Criminal network analysis

## Authentication

* Firebase Authentication

## Deployment

* Vercel — Frontend
* Render — Backend / Database

---

# 🚀 Major Features

### 📊 Dashboard & KPIs

Provides an overview of important crime statistics including:

* Total FIRs
* Total accused
* Total victims
* Total districts
* Total police stations
* Solved cases
* Pending cases
* Closed cases
* Charge-sheeted cases

---

### 📁 Case Management

Users can access and analyze crime case information through a centralized interface.

Features include:

* Case records
* Case details
* Crime categories
* District information
* Police station information
* Case statistics

---

### 👤 Accused Analysis

Provides information about accused persons and their involvement in cases.

The system can help identify:

* Repeated involvement
* Associated cases
* Related victims
* Case relationships

---

### 👥 Victim Analysis

Provides centralized access to victim-related crime information and helps connect victims with relevant cases.

---

### 🕸️ Criminal Network Analysis

The system represents relationships between:

```text
Accused
   │
   ├── Cases
   │     ├── Victims
   │     ├── District
   │     └── Police Station
   │
   └── Associated Cases
```

This helps investigators understand connections and repeated involvement across cases.

---

### 📍 Crime Hotspot Analysis

The system analyzes crime records based on locations and identifies areas with higher crime activity.

---

### 📈 Crime Trend Analysis

The platform provides analytical views of crime patterns and trends to support investigation and decision-making.

---

### 🚨 Anomaly Detection

The AI/analytics modules can identify unusual patterns in available crime data.

---

### 🔎 Similar Case Analysis

The system provides functionality for finding cases that have similarities with a selected case.

---

### 🤖 AI Crime Intelligence Assistant

The platform includes an AI-powered chat interface using the Groq API.

Users can ask questions such as:

* What are the most common crime categories?
* Which locations have the highest crime counts?
* What are the major crime trends?
* Explain the crime statistics.
* Analyze crime hotspots.
* Find insights from available crime data.

The AI assistant generates insights based on the available crime records.

---

# 🗄️ Database

The project uses PostgreSQL as the centralized database.

The database contains structured crime-related information such as:

* FIR / Cases
* Accused
* Victims
* Police Stations
* Districts
* Crime Categories
* Officers
* Case relationships

The original SQLite database was migrated to PostgreSQL using a dedicated migration script.

```text
SQLite
   │
   │ Migration
   ▼
PostgreSQL
   │
   ▼
Flask Backend
   │
   ▼
React Frontend
```

---

# 🔄 Application Workflow

```text
User Login
     ↓
Dashboard
     ↓
Select Crime Intelligence Module
     ↓
Request Data / Analysis
     ↓
React Frontend
     ↓
REST API
     ↓
Flask Backend
     ↓
PostgreSQL Database
     ↓
AI / Analytics Processing
     ↓
Results & Visualizations
     ↓
User
```

---

# 📂 Project Structure

```text
AI-POWERED-CRIMINAL-NETWORK-ANALYSIS-SYSTEM/
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.*
│
├── database/
│
├── documents/
│   ├── AI_Criminal_Network_Analysis_Report.pdf
│   └── AI_Criminal_Network_Analysis_Seminar.pptx
│
├── migrate_sqlite_to_postgres.py
├── crime_intelligence.db
├── crime_intelligence.dump
├── README.md
└── ...
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/akshayh0/AI-POWERED-CRIMINAL-NETWORK-ANALYSIS-SYSTEM.git
```

```bash
cd AI-POWERED-CRIMINAL-NETWORK-ANALYSIS-SYSTEM
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file and configure the required environment variables:

```env
DATABASE_URL=your_postgresql_database_url
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=your_frontend_url
```

Run the backend:

```bash
python main.py
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Do not commit API keys or passwords to GitHub.

### Backend

```env
DATABASE_URL=
GROQ_API_KEY=
FRONTEND_URL=
```

### Frontend

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Use `.env.example` files for sharing the required variable names without exposing secret values.

---

# 🌐 Deployment

The project is deployed using:

```text
Frontend
   ↓
Vercel

Backend
   ↓
Render

Database
   ↓
PostgreSQL
```

The frontend communicates with the deployed Flask backend through REST APIs.

---

# 📊 Current Database Statistics

The deployed system currently provides crime statistics such as:

| Metric          | Value |
| --------------- | ----: |
| Total FIRs      |   120 |
| Total Accused   |    79 |
| Total Victims   |   120 |
| Total Districts |     7 |
| Total Stations  |    29 |
| Solved Cases    |   110 |
| Pending Cases   |    10 |
| Closed Cases    |    59 |
| Charge-Sheeted  |    51 |
| Today's FIRs    |     1 |

These values are retrieved from the connected PostgreSQL-backed application.

---

# 📸 Project Documentation

Project documentation and seminar materials are available in the `documents` folder.

### 📄 Project Report

`documents/AI_Criminal_Network_Analysis_Report.pdf`

### 📊 Seminar Presentation

`documents/AI_Criminal_Network_Analysis_Seminar.pptx`

---

# 🎓 Academic Project

**Project Title:**
AI-Powered Criminal Network Analysis System

**Domain:**
Artificial Intelligence / Data Analytics / Crime Intelligence

**Purpose:**
Academic project and demonstration of an AI-assisted crime analytics platform.

---

# 🔮 Future Enhancements

Possible future improvements include:

* Real-time crime data integration
* Advanced geospatial crime prediction
* More sophisticated graph/network analysis
* Improved AI reasoning over crime records
* Mobile application
* Automated report generation
* Advanced role-based access control
* Real-time alerts
* Larger and more diverse datasets
* Integration with additional government data sources

---

# ⚠️ Limitations

* The accuracy of analytics depends on the quality and completeness of available crime data.
* AI-generated insights depend on the data provided to the system.
* The current system is primarily intended for academic/project demonstration.
* Production deployment would require additional security, auditing, and compliance controls.

---

# 👨‍💻 Author

**Akshay H** **Omkar KS**

Artificial Intelligence & Machine Learning and ISE
Alva's Institute of Engineering & Technology
Visvesvaraya Technological University (VTU)

---

# 📜 Disclaimer

This project is developed for academic and demonstration purposes.

The system does not replace professional investigation, law-enforcement procedures, or official decision-making. AI-generated results should be treated as analytical assistance and should be verified against official records.

````

