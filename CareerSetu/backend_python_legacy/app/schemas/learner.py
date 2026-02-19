from pydantic import BaseModel
from typing import List, Optional

class AcademicInfo(BaseModel):
    highest_qualification: str
    background_stream: str
    performance_level: str  # e.g., "High", "Mid", "Low"

class Skills(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    digital_literacy: str  # e.g., "Basic", "Advanced"

class SocioEconomic(BaseModel):
    location: str  # "Urban", "Rural"
    access_to_internet: bool
    financial_constraints: bool
    time_availability: str  # "Full-time", "Part-time"

class LearningPreferences(BaseModel):
    pace: str
    language: str
    mode: str  # "Online", "Offline", "Hybrid"

class CareerAspirations(BaseModel):
    target_role: str
    preferred_industry: str
    short_term_goal: str
    long_term_goal: str

class LearnerProfileRequest(BaseModel):
    academic_info: AcademicInfo
    skills: Skills
    socio_economic: SocioEconomic
    learning_preferences: LearningPreferences
    career_aspirations: CareerAspirations

class PathwayStep(BaseModel):
    step_name: str
    description: str
    duration: str

class CareerOutcomes(BaseModel):
    entry_level: str
    mid_level: str
    future_specialization: str

class LearnerPathwayResponse(BaseModel):
    learner_summary: str
    recommended_nsqf_level: str
    justification: str
    learning_path: List[PathwayStep]
    skill_gap: List[str]
    estimated_timeline: str
    career_outcomes: CareerOutcomes
