"""FastAPI router for AI course recommendations."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.services.recommender import get_recommendations, train_and_save
from app.routers.auth import get_current_user

router = APIRouter()


class PredictRequest(BaseModel):
    skills: str = ""
    interest: str = ""
    nsqf_level: int = Field(default=0, ge=0, le=10, description="User's NSQF level (0 = ignore)")
    preferred_duration_months: int = Field(default=0, ge=0, description="Max preferred course duration in months (0 = ignore)")
    job_role: str = Field(default="", description="User's target job role for boosting")
    top_n: int = Field(default=5, ge=1, le=10)


class TrainRequest(BaseModel):
    pass


@router.post("/predict")
async def predict(req: PredictRequest):
    """
    Generate top-5 course recommendations using TF-IDF cosine similarity + boosting.

    Inputs used:
    - skills   : space-separated skill keywords from learner profile
    - interest : target role or preferred industry
    - nsqf_level : learner's current NSQF level (courses within ±1 boosted +20%)
    - preferred_duration_months : max duration acceptable (courses within limit boosted +15%)
    - job_role : target job role keyword (substring match in course job_role boosted +25%)
    - top_n    : number of results (1–10, default 5)
    """
    try:
        top_n = min(max(req.top_n, 1), 10)
        recommendations = get_recommendations(
            skills=req.skills,
            interest=req.interest,
            nsqf_level=req.nsqf_level,
            preferred_duration_months=req.preferred_duration_months,
            job_role=req.job_role,
            top_n=top_n,
        )
        return {
            "recommendations": recommendations,
            "total": len(recommendations),
            "query": {
                "skills": req.skills,
                "interest": req.interest,
                "nsqf_level": req.nsqf_level,
                "preferred_duration_months": req.preferred_duration_months,
                "job_role": req.job_role,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend")
async def recommend_from_profile(current_user: dict = Depends(get_current_user)):
    """
    Generate personalised course recommendations using the user's stored profile.
    Reads: technical_skills, career_aspirations (target_role, preferred_industry),
           nsqf_level, and preferred_duration_months from the user document in MongoDB.
    """
    try:
        # Extract fields from the user's stored profile
        skills_list = current_user.get("technical_skills", [])
        skills = " ".join(skills_list) if isinstance(skills_list, list) else str(skills_list)

        career = current_user.get("career_aspirations", {})
        interest = career.get("preferred_industry", "") or career.get("target_role", "")
        job_role = career.get("target_role", "")

        nsqf_level = int(current_user.get("nsqf_level", 0))
        preferred_duration_months = int(current_user.get("preferred_duration_months", 0))

        recommendations = get_recommendations(
            skills=skills,
            interest=interest,
            nsqf_level=nsqf_level,
            preferred_duration_months=preferred_duration_months,
            job_role=job_role,
            top_n=5,
        )
        return {
            "recommendations": recommendations,
            "total": len(recommendations),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train")
async def train_model():
    """Re-train and refresh the TF-IDF model from courses.csv."""
    try:
        count = train_and_save()
        return {"message": f"Model trained on {count} courses.", "courses_indexed": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
