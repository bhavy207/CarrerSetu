from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import learner_routes, auth, recommend

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

@app.get("/")
async def root():
    return {"message": "Welcome to Career Setu AI Engine", "version": "2.0"}
