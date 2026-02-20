"""FastAPI router for AI course recommendations."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.recommender import get_recommendations, train_and_save

router = APIRouter()


class PredictRequest(BaseModel):
    skills: str = ""
    interest: str = ""
    top_n: int = 5


class TrainRequest(BaseModel):
    pass


@router.post("/predict")
async def predict(req: PredictRequest):
    """
    Generate course recommendations using TF-IDF cosine similarity.
    - skills:   space-separated skill keywords
    - interest: target role or industry
    - top_n:    number of results (max 10)
    """
    try:
        top_n = min(max(req.top_n, 1), 10)
        recommendations = get_recommendations(
            skills=req.skills,
            interest=req.interest,
            top_n=top_n,
        )
        return {
            "recommendations": recommendations,
            "total": len(recommendations),
            "query": {"skills": req.skills, "interest": req.interest},
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
