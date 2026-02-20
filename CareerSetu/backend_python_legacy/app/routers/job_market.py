"""
Job Market Integration
Aligns recommendations with real-time demand using Linear Regression.
"""
import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ── Paths ─────────────────────────────────────────────────────────────────────
_DIR         = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR    = os.path.join(_DIR, '..', '..', '..', 'backend', 'data')
_MARKET_CSV  = os.path.join(_DATA_DIR, 'job_market.csv')

def _load_market_data():
    if not os.path.exists(_MARKET_CSV):
        raise FileNotFoundError(f"Missing {_MARKET_CSV}")
    return pd.read_csv(_MARKET_CSV)

class MarketRequest(BaseModel):
    skill: str
    target_year: int

@router.post("/predict")
async def predict_demand(req: MarketRequest):
    """
    Predict Demand Score, Salary Estimate, and Sector Growth % based on past trends.
    Uses Linear Regression trained on job_market.csv.
    """
    try:
        df = _load_market_data()
        
        # Filter data for specific skill
        skill_df = df[df['skill'].str.lower() == req.skill.lower().strip()]
        
        if skill_df.empty:
            return {
                "skill": req.skill,
                "target_year": req.target_year,
                "status": "No historical data available",
                "demand_score": 0,
                "salary_estimate": 0,
                "sector_growth_pct": "0%"
            }
            
        # Ensure data is sorted by year
        skill_df = skill_df.sort_values(by="year")
        
        X = skill_df[['year']].values
        y_demand = skill_df['demand_count'].values
        y_salary = skill_df['avg_salary'].values
        
        # Train Demand Linear Regression
        model_demand = LinearRegression()
        model_demand.fit(X, y_demand)
        
        # Train Salary Linear Regression
        model_salary = LinearRegression()
        model_salary.fit(X, y_salary)
        
        # Predictions
        future_X = [[req.target_year]]
        pred_demand = int(model_demand.predict(future_X)[0])
        pred_salary = int(model_salary.predict(future_X)[0])
        
        # Sector growth %
        # Compute growth vs previous year prediction or last known year
        last_known_year = int(skill_df.iloc[-1]['year'])
        last_known_demand = float(skill_df.iloc[-1]['demand_count'])
        
        if last_known_demand > 0:
            growth_pct = ((pred_demand - last_known_demand) / last_known_demand) * 100
        else:
            growth_pct = 0.0
            
        return {
            "skill": req.skill,
            "target_year": req.target_year,
            "demand_score": pred_demand,
            "salary_estimate": pred_salary,
            "sector_growth_pct": f"{growth_pct:.1f}%",
            "model_type": "Linear Regression"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skills")
async def list_market_skills():
    """Returns unique skills tracked in the job market dataset."""
    try:
        df = _load_market_data()
        return {"tracked_skills": df['skill'].unique().tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
