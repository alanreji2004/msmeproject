# MSME Project

This repository contains the full-stack application and data modeling scripts for evaluating MSME (Micro, Small, and Medium Enterprises) growth predictions and scheme eligibility.

## Project Structure

- `backend/` - FastAPI backend, Machine Learning models, and Phase 3 scheme simulation scripts.
- `frontend/` - React (Vite) frontend application with Tailwind CSS and Chart.js.

## Setup Instructions

### 1. Running the Backend

The backend is built with Python and FastAPI. It serves the machine learning model predictions and provides the API for the frontend.

**Prerequisites:** Ensure you have Python installed.

**Installation:**
Navigate to the backend folder and install the dependencies from the requirements file.

```bash
cd backend
pip install -r requirements.txt
```

**Running the Server:**
Start the FastAPI server using Uvicorn. The `--reload` flag enables auto-reloading during development.

```bash
cd backend
python -m uvicorn main:app --reload
```
The backend API will be available at `http://127.0.0.1:8000`.

### 2. Running Phase 3 (Scheme Eligibility Engine)

Phase 3 focuses on cross-matching MSMEs with eligible government schemes and calculating the mathematical projections (Revenue impact and Jobs created).

This is a standalone Python CLI script located in the `backend/data` directory.

**How to run the Simulation Engine:**
Open your terminal and execute the `scheme_engine.py` script.

```bash
cd backend/data
python scheme_engine.py
```

The script will read the `MSME_PROJECT_DATA.xlsx` and `SCHEME_DATASET_FINAL.xlsx` files, compute eligibility across Sector, Category, and Location, and output a "Before vs After" table directly to your terminal.

### 3. Running Phase 4 (Budget-Constrained Optimization Engine)

Phase 4 introduces an advanced resource allocation algorithm (`optimization_engine.py`). It simulates how a government body would distribute a limited pool of money (budget) across eligible MSME schemes to maximize economic impact.

**How the Optimization Logic Works:**
1. **Eligibility Check:** It first finds all matching MSME and Scheme pairs (similar to Phase 3).
2. **Impact Calculation:** For every match, it calculates the absolute projected revenue increase and the total jobs created.
3. **Min-Max Scaling:** Since revenue deals in millions of Rupees, and jobs deal in single digits (e.g., 5 jobs), the script normalizes both values to a scale between `0.0` and `1.0`.
4. **Weighted Scoring:** It calculates a composite "Optimization Score" using adjustable policy weights. For example, if a policymaker values revenue generation more than jobs, they can weight Revenue at 70% (`0.7`) and Jobs at 30% (`0.3`).
5. **Knapsack Approximation:** It calculates the "Score per Cost" (Yield) for every allocation. It then greedily sorts and selects the allocations that provide the highest impact per Rupee spent.
6. **Constraint Enforcement:** It rigorously loops down the ranked list, ensuring the running total cost never exceeds the `--budget` limit, and ensuring no single MSME receives more than one scheme simultaneously.

**How to run the Optimization Engine:**
You can pass dynamic arguments via the CLI sliders: `--budget` (Max Subsidy constraint), `--w_rev` (Revenue Weight), and `--w_emp` (Employment Weight).

```bash
cd backend/data

# Example 1: Large Budget, balanced priorities (50% Revenue / 50% Jobs)
python optimization_engine.py --budget 50000000.0 --w_rev 0.5 --w_emp 0.5

# Example 2: Strict Budget (50L), prioritizing Revenue heavily (70%) over Jobs (30%)
python optimization_engine.py --budget 5000000.0 --w_rev 0.7 --w_emp 0.3

# Example 3: Prioritizing 100% on Job Creation
python optimization_engine.py --budget 20000000 --w_rev 0 --w_emp 1
```

### 4. Running the Frontend

The frontend is a React SPA built with Vite.

**Installation:**
```bash
cd frontend
npm install
```

**Running the Dev Server:**
```bash
cd frontend
npm run dev
```
The React frontend will be accessible at `http://localhost:5173` (or `5174` if `5173` is in use).
