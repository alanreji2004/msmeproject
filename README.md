# AI MSME Growth Platform & Policy Optimization Engine

A full-stack, AI-powered system designed to analyze Micro, Small, and Medium Enterprises (MSMEs), predict their growth trajectory using Machine Learning, and optimally allocate government subsidies using a budget-constrained fractional knapsack algorithm.

---

## 🏆 Project Outcomes (Evaluator Guide)

This project successfully implements all 5 requested outcomes with rigorous mathematical logic, an enterprise-grade UI, and a decoupled FastAPI/React architecture.

### 1️⃣ Predictive Growth Modelling
* **Random Forest ML Engine:** The system trains a classification model to predict `Growth_Category` based on enterprise data. It loads efficiently from a serialized `.pkl` file to avoid heavy startup retraining.
* **Growth Score Matrix:** Predictions are converted into a probability-based 0-100 `Growth_Score`.
* **Growth Dashboard (`Dashboard.jsx`):** Features the model Accuracy, an exact Confusion Matrix, and a Top-10 Feature Importance Bar Chart fetched instantly via the `/metrics` endpoint. 

### 2️⃣ Multi-Scheme Impact Simulation
* **Advisory Interface (`DetailPage.jsx`):** For any specific MSME, the system cross-references location, sector, and category variables against the master Scheme Policy Dataset.
* **Impact Simulation:** It simulates both Revenue Gains (%) and Employment Gains (Jobs) simultaneously for *all* eligible schemes (up to 5), calculating the exact Before and Projected After revenues.
* **Mathematical Recommendation:** The highest-yielding scheme is dynamically tagged with a green `Recommended (Max Impact)` visual indicator.

### 3️⃣ Budget-Based Optimization (The Knapsack Engine)
* **Algorithmic Constraints:** The Optimization Engine (`optimization_engine.py`) ingests a fixed `budget` parameter and evaluates thousands of MSMEs simultaneously to maximize total impact.
* **Constraint Rules:** An MSME is assigned only *one* scheme. The Engine ranks MSME-Scheme pairs by Value Density (Score per Rupee) and performs a greedy allocation until the budget is strictly exhausted.
* **Simulation Dashboard (`OptimizationDashboard.jsx`):** Displays the allocations, total MSMEs funded, jobs created, and total assigned subsidy instantly after the Algorithm resolves.

### 4️⃣ Revenue-Employment Trade-off Analysis
* **Policy Weight Balancing:** The dashboard features dual real-time sliders for *Revenue Priority* and *Jobs Priority*. Modifying one weight inversely updates the other.
* **Real-time Engine:** Adjusting weights triggers a 400ms debounced mathematical re-sorting of the entire MSME directory, instantly shifting the final subsidy allocations.
* **Interactive Trade-off Curve:** The system pre-calculates an array of weight outcomes (from 0.0 to 1.0) and plots a dual-axis interactive Chart.js Line graph mapping total **Revenue Gain versus Jobs Created** across different policy scenarios.

### 5️⃣ Transparent & Explainable Decision-Making
* **Explainable Rejections:** The Engine physically returns an array of Rejected MSMEs alongside the Approved MSMEs. Each rejected MSME clearly states *why* they were skipped (e.g., "Policy Priority Mismatch: Score 14.50 is too low" or "Budget Exhausted: Remaining pool cannot cover 3.5L cap").
* **Feature Transparency:** The `DetailPage.jsx` displays an interactive progress-bar ranking of the exact features that drove that specific MSME's predictive score.
* **Zero Black-Box Logic:** All mathematical equations, scoring thresholds, and rule criteria are boldly formatted within the UI tables, replacing standard debug prints with elegant, evaluator-friendly tabular data.

---

## 🏗 Architecture & Technology Stack

### Frontend (Client-Tier)
* **Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS v4 & CSS Modules (Glassmorphism & Enterprise UI)
* **Routing:** React Router v6
* **Data Visualization:** Chart.js & React-Chartjs-2
* **Icons:** Lucide React
* **HTTP Client:** Axios

### Backend (Service-Tier)
* **Framework:** FastAPI (Python)
* **Machine Learning:** Scikit-Learn (Random Forest Classifier)
* **Data Processing:** Pandas & NumPy
* **Model Serialization:** Joblib
* **Server:** Uvicorn

---

## 🚀 Installation & Execution

### Required Dependencies
* **Node.js** (v18+)
* **Python** (v3.9+)

### 1. Setup & Run the Backend

Open a terminal and navigate to the `backend` directory:
```bash
cd backend

# Install Python dependencies
pip install pandas scikit-learn openpyxl fastapi uvicorn pydantic joblib

# Start the FastAPI Server (runs on http://localhost:8000)
python -m uvicorn main:app --reload
```

### 2. Setup & Run the Frontend

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend

# Install Node modules
npm install

# Start the React Development Server (runs on http://localhost:5174)
npm run dev
```

Navigate to `http://localhost:5174` in your browser.

---

## 📂 Project Folder Structure

```text
msmeproject/
├── backend/                  # Python FastAPI Backend
│   ├── data/
│   │   ├── optimization_engine.py  # Outcome 3 & 4 (Tradeoffs & Knapsack)
│   │   ├── scheme_engine.py        # Outcome 2 (Impact Simulation)
│   │   ├── MSME_PROJECT_DATA.xlsx  
│   │   └── SCHEME_DATASET_FINAL.xlsx 
│   ├── model/
│   │   ├── train.py                # Outcome 1 Training
│   │   └── predict.py              # Outcome 1 Prediction & Caching
│   ├── services/
│   │   ├── data_loader.py          # Data IO handlers
│   │   └── preprocessing.py        # Feature Engineering Pipeline
│   └── main.py                     # Router API
│
└── frontend/                 # React UI Client
    └── src/
        ├── components/
        │   ├── Layout.jsx          # Unified UI Wrapper & Navbar
        │   └── SectorCharts.jsx    # Chart.js visual wrappers
        ├── pages/
        │   ├── Dashboard.jsx       # Outcome 1 UI (Model Dashboard)
        │   ├── TablePage.jsx       # MSME Global Directory
        │   ├── DetailPage.jsx      # Outcome 2 & 5 UI (Advisory & Explainability)
        │   ├── OptimizationDashboard.jsx # Outcome 3, 4 & 5 UI
        │   └── OptimizationDashboard.module.css
        └── App.jsx                 # Route configurations
```

---
*Production-ready release built to strict algorithmic and modern UI specifications.*
