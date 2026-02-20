"""
NSQF Progression Engine
Maps learner to correct NSQF level and suggests vertical progression.
"""
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ── Paths ─────────────────────────────────────────────────────────────────────
_DIR         = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR    = os.path.join(_DIR, '..', '..', '..', 'backend', 'data')
_NSQF_CSV    = os.path.join(_DATA_DIR, 'nsqf_levels.csv')
_JOB_CSV     = os.path.join(_DATA_DIR, 'job_roles.csv')

def _load_data():
    if not os.path.exists(_NSQF_CSV):
        raise FileNotFoundError(f"Missing {_NSQF_CSV}")
    if not os.path.exists(_JOB_CSV):
        raise FileNotFoundError(f"Missing {_JOB_CSV}")
    
    nsqf_df = pd.read_csv(_NSQF_CSV)
    job_df  = pd.read_csv(_JOB_CSV)
    return nsqf_df, job_df

def _calculate_skill_score(learner_skills: List[str], required_text: str) -> float:
    req_list = [s.strip().lower() for s in required_text.split() if s.strip()]
    if not req_list:
        return 100.0
    learner_lower = [s.lower() for s in learner_skills]
    
    matched = set()
    for req in req_list:
        if any(req in l or l in req for l in learner_lower):
            matched.add(req)
            
    return (len(matched) / len(req_list)) * 100.0

class ProgressRequest(BaseModel):
    current_level: int
    learner_skills: List[str]

@router.post("/progress")
async def check_progression(req: ProgressRequest):
    """
    Evaluate if learner is ready for vertical progression.
    Uses Rule-Based + Skill Scoring Model.
    """
    try:
        nsqf_df, job_df = _load_data()
        
        # Current Level validation
        current_row = nsqf_df[nsqf_df['nsqf_level'] == req.current_level]
        if current_row.empty:
            raise ValueError(f"NSQF Level {req.current_level} not found.")
        
        next_level = current_row.iloc[0]['next_level']
        
        # Check next level requirements
        next_row = nsqf_df[nsqf_df['nsqf_level'] == next_level]
        if next_row.empty:
            return {
                "current_level": req.current_level,
                "status": "Max Level Reached",
                "message": "You have reached the highest defined NSQF level."
            }
            
        required_skills_next = next_row.iloc[0]['required_skills']
        
        # Calculate skill score
        skill_score = _calculate_skill_score(req.learner_skills, required_skills_next)
        
        if skill_score >= 80.0:
            recommendation = f"You exhibit {skill_score:.0f}% mastery of the next level skills. We recommend officially advancing to NSQF Level {int(next_level)}."
            action = "Promote to Next Level"
            target_level = int(next_level)
        else:
            missing_pct = 100.0 - skill_score
            recommendation = f"You need {missing_pct:.0f}% more skill alignment to reach Level {int(next_level)}. Enroll in an upskilling course focusing on: {required_skills_next}."
            action = "Recommend Upskilling Course"
            target_level = req.current_level
            
        # Lateral mobility (roles at current level)
        lateral_df = job_df[job_df['nsqf_level'] == req.current_level]
        lateral_options = lateral_df['job_role'].tolist()[:5]
        
        return {
            "current_nsqf_level": req.current_level,
            "next_nsqf_level": int(next_level) if pd.notna(next_level) else None,
            "next_level_skills": required_skills_next,
            "skill_score_pct": round(skill_score, 1),
            "progression_algorithm_result": action,
            "recommendation": recommendation,
            "lateral_mobility_options": lateral_options,
            "certification_stacking_pathway": [
                f"Level {req.current_level} Foundation",
                f"Level {int(next_level)} Specialized Training",
                f"Level {int(next_level)+1 if pd.notna(next_level) else 'Advanced'} Expert Certification"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
