# AI-Powered Phishing Investigation Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg)](https://scikit-learn.org/)
[![Offline / Air-Gapped](https://img.shields.io/badge/API%20Keys-None%20Required-success.svg)](#)

A defensive cybersecurity operations platform that enables security analysts and researchers to triage suspicious emails, parse raw RFC 5322 headers, evaluate destination URLs, extract Indicators of Compromise (IOCs), and generate audit-ready forensic PDF reports.

Designed as an academic cybersecurity project, **PhishLab AI** operates **100% locally and offline without requiring paid cloud AI services, external telemetry subscriptions, or proprietary API keys**.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |      React 19 + TypeScript UI     |
                      |   (Tailwind CSS, Lucide, Recharts)|
                      +-----------------+-----------------+
                                        |  REST API (JSON)
                                        v
                      +-----------------+-----------------+
                      |       FastAPI Backend Server      |
                      |          (Uvicorn ASGI)           |
                      +--------+-----------------+--------+
                               |                 |
            +------------------+                 +------------------+
            |                                                       |
            v                                                       v
+-----------+-----------+                               +-----------+-----------+
| Phishing Analysis     |                               |   Database & Reports  |
| Pipeline              |                               +-----------------------+
+-----------------------+                               | - SQLite Database     |
| 1. Content Heuristics |                               | - SQLAlchemy 2.0 ORM  |
| 2. URL Threat Engine  |                               | - ReportLab PDF Engine|
| 3. RFC Header Parser  |                               +-----------------------+
| 4. IOC Extractor      |
| 5. Scikit-Learn ML    |
| 6. Risk Scoring (0-100|
| 7. Explainable AI     |
+-----------------------+
```

---

## Key Features

1. **Email Content & Social Engineering Analysis**
   - Detects urgency triggers, account deactivation threats, credential harvesting phrases, wire transfer pressures, and executive impersonation.
   - Outputs indicator title, evidence snippet, severity (Low/Med/High/Crit), and pedagogical rationale.

2. **Dedicated URL Threat Inspector**
   - Extracts scheme, domain, subdomains, port, path, query parameters, and fragments.
   - Detects cleartext HTTP, IP-based destination URLs, Punycode visual spoofing (`xn--`), abused TLDs (`.top`, `.xyz`, `.cc`, `.vip`), credential-harvesting paths (`/login`, `/auth`, `/verify`), and open-redirect patterns.

3. **Domain & Brand Impersonation Detection**
   - Lexical and structural domain inspection against high-profile targets (Microsoft 365, Google Workspace, Apple ID, Chase, PayPal, DHL, FedEx, etc.).
   - Employs conservative threat terminology: *"Possible brand impersonation pattern detected."*

4. **RFC 5322 Email Header Parser**
   - Parses `From`, `To`, `Reply-To`, `Return-Path`, `Message-ID`, `Date`, and `Received` chains.
   - Differentiates cryptographic authentication: `PASS`, `FAIL`, `NONE / NOT PROVIDED`, or `UNKNOWN` across SPF, DKIM, and DMARC.
   - Flags envelope mismatches (e.g., `From` domain vs. `Reply-To` routing domain).

5. **IOC Extraction Engine**
   - Automatically parses and normalizes URLs, Domains, IPv4/IPv6 addresses, Email addresses, and Cryptographic Hashes (MD5, SHA-1, SHA-256).
   - Ingests attachment metadata safely without executing binaries.
   - Provides 1-click clipboard copying.

6. **Genuine Machine Learning Classifier**
   - Bundles a local `scikit-learn` text classifier trained on a balanced academic dataset (`backend/data/phishing_training_data.csv`).
   - Pipeline: **TF-IDF N-grams (unigrams + bigrams, 2500 features) + L2-Regularized Logistic Regression**.
   - Computes genuine 5-fold cross-validation metrics (>95% accuracy, 100% precision).
   - Generates transparent feature-importance rankings for the input text.

7. **Composite Risk Scoring Engine**
   - Normalizes threats from **0 to 100** (`LOW`: 0–24, `MEDIUM`: 25–49, `HIGH`: 50–74, `CRITICAL`: 75–100).
   - Transparently weights heuristic triggers (max 75 pts) alongside ML phishing confidence (max 25 pts).

8. **Explainable AI ("Why This Was Flagged")**
   - Synthesizes findings into natural language analyst explanations detailing exactly which signals elevated the risk.

9. **Investigation Case Dossier & Lifecycle Management**
   - Assigns unique case identifiers (`PH-YYYY-NNNN`).
   - Tracks case status: `Open`, `Investigating`, `Contained`, `Resolved`, `False Positive`.
   - Chronological investigation timeline and investigator note log.

10. **Forensic PDF Report Generator**
    - Generates downloadable, audit-ready PDF reports with ReportLab containing executive summaries, risk breakdowns, evidence tables, IOC lists, and defensive countermeasures.

11. **Bundled Demonstration Cases**
    - Includes 5 safe synthetic cases clearly marked as *Training / Demonstration Data* (Microsoft 365 password reset, Chase wire alert, DHL customs scam, Executive spear phishing, and a Legitimate engineering bulletin).

---

## Folder Structure

```
phishing-lab/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & lifespan
│   │   ├── config.py             # App configuration & file paths
│   │   ├── database.py           # SQLite connection & SQLAlchemy setup
│   │   ├── models/
│   │   │   └── investigation.py  # SQLAlchemy database schema
│   │   ├── schemas/
│   │   │   ├── analysis.py       # Pydantic schemas for analysis requests/responses
│   │   │   └── investigation.py  # Pydantic schemas for cases, notes, timeline
│   │   ├── analyzers/
│   │   │   ├── content_analyzer.py # Urgency & social engineering detector
│   │   │   ├── domain_analyzer.py  # Brand impersonation & punycode detector
│   │   │   ├── url_analyzer.py     # URL threat & structural inspector
│   │   │   ├── header_analyzer.py  # RFC 5322 header & SPF/DKIM/DMARC parser
│   │   │   ├── ioc_extractor.py    # URL/IP/Domain/Hash extractor
│   │   │   └── risk_scorer.py      # Transparent 0-100 weighted scoring engine
│   │   ├── services/
│   │   │   ├── ml_engine.py      # TF-IDF + LogisticRegression ML service
│   │   │   ├── pipeline.py       # Orchestration pipeline & explainable AI
│   │   │   ├── report_service.py # Professional ReportLab PDF generator
│   │   │   └── sample_data.py    # 5 safe synthetic demonstration cases
│   │   ├── routes/
│   │   │   ├── investigations.py # Case CRUD, status, notes, PDF export, IOCs
│   │   │   ├── analysis.py       # Standalone analyzer endpoints & sample cases
│   │   │   └── dashboard.py      # SOC dashboard stats & ML model diagnostics
│   │   └── tests/
│   │       └── test_backend.py   # Complete pytest test suite (100% pass)
│   ├── data/
│   │   ├── generate_dataset.py   # Dataset builder script
│   │   └── phishing_training_data.csv # Academic safe dataset
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.tsx        # Top status header
│   │   │   ├── Sidebar.tsx       # SOC navigation sidebar
│   │   │   ├── StatCard.tsx      # Dashboard metric card
│   │   │   ├── RiskBadge.tsx     # Color-coded risk badge
│   │   │   ├── StatusBadge.tsx   # Investigation status badge
│   │   │   ├── RiskMeter.tsx     # Visual risk gauge & weight breakdown
│   │   │   ├── IOCTable.tsx      # Filterable IOC table with 1-click copy
│   │   │   └── ConfirmationModal.tsx # Safe destructive action modal
│   │   ├── pages/                # Main application screens
│   │   │   ├── WelcomePage.tsx   # Security-themed portal entry
│   │   │   ├── DashboardPage.tsx # SOC telemetry, charts & recent cases
│   │   │   ├── NewInvestigationPage.tsx # Case ingestion & live preview
│   │   │   ├── CaseDetailsPage.tsx  # Full investigation dossier & PDF download
│   │   │   ├── InvestigationsPage.tsx # Searchable case history registry
│   │   │   ├── IOCExplorerPage.tsx  # Cross-case IOC threat repository
│   │   │   ├── AnalysisEnginePage.tsx # Standalone interactive workbench
│   │   │   ├── DocumentationPage.tsx  # Threat taxonomy & methodology guide
│   │   │   └── SettingsPage.tsx  # ML telemetry & retrain controls
│   │   ├── services/
│   │   │   └── api.ts            # Typed REST API client
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── App.tsx               # Routing & application layout
│   │   ├── index.css             # Tailwind CSS & custom styling
│   │   └── main.tsx              # React mounting root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── start_backend.sh              # Backend startup script
├── start_frontend.sh             # Frontend startup script
├── run_tests.sh                  # Automated pytest runner
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** and **npm**

### 1. Backend Setup
```bash
# In the project root:
# 1. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install -r backend/requirements.txt
```

### 2. Frontend Setup
```bash
# In the frontend directory:
cd frontend
npm install
cd ..
```

---

## Running the Application

### Option A: Using Convenience Scripts
In terminal 1 (Backend):
```bash
./start_backend.sh
```
*Backend runs at `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).*

In terminal 2 (Frontend):
```bash
./start_frontend.sh
```
*Frontend runs at `http://localhost:5173`.*

### Option B: Manual Commands
```bash
# Terminal 1 - Backend:
PYTHONPATH=. ./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## Running Automated Tests

Run the full automated test suite covering content heuristics, URL inspections, header parsing, IOC extraction, ML predictions, and end-to-end API workflows:

```bash
./run_tests.sh
```

Sample test output:
```
backend/app/tests/test_backend.py::test_url_analyzer_suspicious PASSED   [ 12%]
backend/app/tests/test_backend.py::test_url_analyzer_legitimate PASSED   [ 25%]
backend/app/tests/test_backend.py::test_header_analyzer_spf_fail_and_reply_to_mismatch PASSED [ 37%]
backend/app/tests/test_backend.py::test_content_analyzer_phishing_triggers PASSED [ 50%]
backend/app/tests/test_backend.py::test_content_analyzer_safe_text PASSED [ 62%]
backend/app/tests/test_backend.py::test_ioc_extraction PASSED            [ 75%]
backend/app/tests/test_backend.py::test_ml_model_prediction PASSED       [ 87%]
backend/app/tests/test_backend.py::test_api_full_workflow PASSED         [100%]
======================== 8 passed in 1.10s ========================
```

---

## Live Demonstration Flow

Follow this step-by-step walkthrough for project presentation:

1. **Welcome Screen (`/welcome`)**:
   - Enter your analyst name and select role (e.g., *Tier 2 Security Analyst*). Click **"Enter Investigation Lab"**.
2. **Dashboard (`/dashboard`)**:
   - Inspect the real-time SOC metrics calculated directly from the SQLite database.
   - Point out the Risk Distribution bar chart and 7-day Activity timeline.
3. **Submit Phishing Investigation (`/new`)**:
   - Use the **"Load Synthetic Demo"** dropdown and select *"[DEMO] Fake Microsoft 365 Password Expiration Alert"*.
   - Review how email subject, sender, body, and raw RFC headers automatically populate.
   - Click **"Run Preview Analysis"**: Show the composite score (Critical), ML phishing probability (80%+), and Explainable AI reasoning points.
   - Click **"Save & Create Investigation Case"**: Direct redirect to the Case Details Dossier.
4. **Inspect Case Dossier (`/investigations/:id`)**:
   - Review the Risk Meter, Header Authentication checks (SPF/DKIM/DMARC failures), and Extracted IOC table.
   - Click the **"Copy"** button on an extracted URL or IP address (displays visual confirmation).
   - Change the Case Status from *Investigating* to *Contained*.
   - Add an Analyst Note: *"Confirmed credential harvesting link targeting corporate M365 accounts."*
   - Click **"Download PDF Report"**: Open the generated forensic PDF file to demonstrate publication-ready documentation.
5. **Verify Non-Malicious Handling (Benign Baseline)**:
   - Go to **New Investigation**, load *"[DEMO] Legitimate Internal Engineering Sprint Update"*.
   - Click **Run Preview Analysis**: Demonstrate that the system scores it as **LOW Risk**, with a high legitimate baseline and zero false-positive alerts. This verifies the system does not simply flag everything as phishing.
6. **IOC Explorer (`/iocs`)**:
   - Demonstrate cross-investigation indicator aggregation. Filter by *URL*, *Domain*, or *IP*, and click a Case ID to navigate back to its dossier.
7. **Settings & Diagnostics (`/settings`)**:
   - Display genuine cross-validation metrics (Accuracy, Precision, Recall, F1-Score).
   - Click **"Retrain ML Model"** to demonstrate live model training.

---

## Defensive Security Boundaries

- **Zero Arbitrary Execution**: The platform is an analytical investigation tool. It never launches executables, executes macros, or initiates live HTTP requests to untrusted targets.
- **Input Sanitization**: User-supplied email bodies, headers, and metadata are sanitized and safely escaped to prevent cross-site scripting (XSS) or SQL injection vulnerabilities.
- **Air-Gapped Reliability**: Operates entirely within the local environment. No data leaves the investigator's workstation.

---

## Academic Project Information
- **Course**: Defensive Cybersecurity & Incident Response
- **Application**: AI-Powered Phishing Investigation Laboratory
- **Author**: Cybersecurity Engineering Project Team
