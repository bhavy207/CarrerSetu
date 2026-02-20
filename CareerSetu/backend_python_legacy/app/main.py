from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import learner_routes, auth, recommend, skill_gap, nsqf_progression, job_market

app = FastAPI(title="Career Setu AI Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learner_routes.router, prefix="/api/v1/learner", tags=["learner"])
app.include_router(auth.router,           prefix="/api/v1/auth",    tags=["auth"])
app.include_router(recommend.router,      prefix="/api/v1",         tags=["recommend"])
app.include_router(skill_gap.router,      prefix="/api/v1/skill-gap", tags=["skill-gap"])
app.include_router(nsqf_progression.router, prefix="/api/v1/nsqf",  tags=["nsqf"])
app.include_router(job_market.router,     prefix="/api/v1/market",  tags=["market"])

@app.get("/")
async def root():
    return {"message": "Welcome to Career Setu AI Engine", "version": "2.0"}
