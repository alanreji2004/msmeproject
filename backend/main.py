from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from model.train import train_model, MODEL_DIR
from model.predict import get_predictions, get_prediction_by_id
from data.optimization_engine import run_optimization, generate_tradeoff_curve
from data.scheme_engine import get_msme_schemes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/train")
async def train():
    try:
        metrics = train_model()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    try:
        metrics_path = os.path.join(MODEL_DIR, 'metrics.json')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="Metrics not found. Please train model first.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/msmes")
async def msmes():
    try:
        predictions = get_predictions()
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/msme/{id}")
async def msme(id: str):
    try:
        prediction = get_prediction_by_id(id)
        if prediction:
            return prediction
        raise HTTPException(status_code=404, detail="MSME not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/msme/{id}/schemes")
async def msme_schemes(id: str):
    try:
        prediction = get_prediction_by_id(id)
        if prediction and "original_data" in prediction:
            schemes = get_msme_schemes(prediction["original_data"])
            return schemes
        raise HTTPException(status_code=404, detail="MSME not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/optimize/tradeoff")
async def optimize_tradeoff(budget: float = 100000000):
    try:
        points = generate_tradeoff_curve(budget)
        return points
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/optimize")
async def optimize(budget: float = 100000000, w_rev: float = 0.5, w_emp: float = 0.5):
    try:
        results = run_optimization(budget, w_rev, w_emp)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
