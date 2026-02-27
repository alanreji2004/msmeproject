from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model.train import train_model
from model.predict import get_predictions, get_prediction_by_id
from data.optimization_engine import run_optimization

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

@app.get("/optimize")
async def optimize(budget: float = 100000000, w_rev: float = 0.5, w_emp: float = 0.5):
    try:
        results = run_optimization(budget, w_rev, w_emp)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
