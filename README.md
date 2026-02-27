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

### 3. Running the Frontend

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
