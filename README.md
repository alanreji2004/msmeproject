# MSME Growth Predictor & Policy Optimization Engine

A full-stack, AI-powered system designed to analyze Micro, Small, and Medium Enterprises (MSMEs), predict their growth trajectory using Machine Learning, and optimally allocate government subsidies using a budget-constrained fractional knapsack algorithm.

---

## 📌 System Overview

The **MSME Predictor** is a comprehensive enterprise solution divided into predictive analytics and policy simulation. It empowers policymakers and financial institutions to:
1. **Predict MSME Growth:** Utilize a trained Random Forest model to predict if an MSME will experience *High*, *Moderate*, or *Low* growth.
2. **Simulate Policy Impact:** Evaluate how various government schemes (e.g., PLI, Mudra Yojana) impact an MSME's revenue and employment generation.
3. **Optimize Budget Allocation:** Intelligently distribute a fixed subsidy budget across thousands of MSMEs to maximize either Revenue Gain or Job Creation using adjustable policy weights.

---

## 🏗 Architecture & Technology Stack

The application ensures a strong separation of concerns between a mathematical Python backend and a reactive Javascript frontend.

### Frontend (Client-Tier)
* **Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS & CSS Modules (Glassmorphism & Enterprise UI)
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
* Git

### 1. Setup & Run the Backend

Open a terminal and navigate to the `backend` directory:
```bash
cd backend

# Install Python dependencies
pip install pandas scikit-learn openpyxl fastapi uvicorn pydantic

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

---

## 📂 Project Folder Structure

```text
msmeproject/
├── backend/                  # Python FastAPI Backend
│   ├── data/
│   │   ├── optimization_engine.py  # Phase 4/5: Knapsack Algorithm
│   │   ├── scheme_engine.py        # Phase 3: Eligibility Rules
│   │   ├── MSME_PROJECT_DATA.xlsx  # Raw Data
│   │   └── SCHEME_DATASET_FINAL.xlsx # Strategy Data
│   ├── model/
│   │   ├── train.py                # Phase 2: Random Forest Training
│   │   └── predict.py              # Phase 2: Inference Wrapper
│   ├── services/
│   │   ├── data_loader.py          # Internal IO handlers
│   │   └── preprocessing.py        # Feature Engineering Pipeline
│   └── main.py                     # Router & API Endpoints
│
└── frontend/                 # React UI Client
    ├── index.html
    └── src/
        ├── components/
        │   ├── Layout.jsx          # Unified UI Wrapper & Navbar
        │   ├── Card.jsx            # Reusable UI component
        │   └── SectorCharts.jsx    # Chart.js visualization wrappers
        ├── pages/
        │   ├── Dashboard.jsx       # Phase 2: ML Metrics
        │   ├── TablePage.jsx       # Phase 2: MSME Directory
        │   ├── DetailPage.jsx      # Phase 2: Specific MSME Analytics
        │   ├── OptimizationDashboard.jsx # Phase 4/5: Simulation UI
        │   └── OptimizationDashboard.module.css # Policy Styling
        ├── App.jsx                 # Route configurations
        └── main.jsx
```

---

## 🧠 Core Engineering Concepts

### How the Optimization Logic Works (Knapsack Algorithm)

The Optimization Engine (`optimization_engine.py`) solves a variation of the bounded Knapsack problem. 
1. **Eligibility Filter:** It maps all MSMEs against all schemes, checking Sector, Category, and Location matching.
2. **Impact Calculation:** For eligible pairs, it calculates the raw absolute `Revenue Gain` and `Jobs Created`.
3. **Min-Max Normalization:** It normalizes both impacts on a scale of 0 to 1 so they can be securely added together.
4. **Scoring:** It applies user-defined weights (`w_rev` & `w_emp`) to create a composite `Optimization_Score`.
5. **Density Sorting:** It calculates the `Score_per_Cost` (Value Density) and sorts all candidates from Highest Yield to Lowest.
6. **Greedy Allocation:** It iterates down the list, allocating the cost from the total `budget`. An MSME can only win ONE scheme maximum.

### How the Real-Time Simulation Works

The React UI features two responsive range sliders connected to React `useState`. 
* The sliders are mathematically bonded: If you slide *Revenue Priority* to `0.80` (80%), the system automatically forces *Jobs Priority* to `0.20` (20%).
* Clicking **Run Simulation** sends an Axois `GET` request to `/optimize?budget=X&w_rev=Y&w_emp=Z`.
* The server instantly recalculates the entire knapsack array across thousands of rows and returns the Approved Array, Rejected Array (with logical reasons), and Sector Aggregations.
* Chart.js instantly animates the layout of where the government funding was mathematically distributed.

---

## 🎯 Phase-wise Implementation Summary

* **Phase 1 (Setup):** Repository initialized, dependencies mapped, mock datasets connected.
* **Phase 2 (Growth Prediction):** Built a Random Forest classification pipeline achieving over 80% accuracy. Constructed endpoints to serve model metrics and a visual MSME directory.
* **Phase 3 (Scheme Integration):** Developed the `scheme_engine` to logically map multi-scheme eligibility and execute baseline rule evaluations.
* **Phase 4 (Budget Optimization):** Built the core Knapsack-approximation Python engine and connected it to a unified FastAPI endpoint. Developed the modern Glassmorphic simulation UI.
* **Phase 5 (Transparency & System Integration):** Added Chart.js visualizations aggregating sector performance. Built a secondary algorithm to map rejected candidates and assign explicit logical reasons for failure (Budget vs Score Priority). Implemented a unified global Layout wrapper across the entire full-stack platform.

---
*Developed for MSME Growth Prediction and Impact Analysis.*
