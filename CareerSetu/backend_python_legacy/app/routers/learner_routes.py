from fastapi import APIRouter, HTTPException, Depends
from app.schemas.learner import LearnerProfileRequest, LearnerPathwayResponse
from app.services.profiling import profiling_service
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/profile", response_model=LearnerPathwayResponse)
async def generate_learner_pathway(profile: LearnerProfileRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Here we invoke the service logic
        response = profiling_service.analyze_learner(profile)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
