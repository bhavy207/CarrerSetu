from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import learner_routes, auth

app = FastAPI(title="Career Setu MVP", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learner_routes.router, prefix="/api/v1/learner", tags=["learner"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to Career Setu AI Engine"}
