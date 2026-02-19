from app.schemas.learner import LearnerProfileRequest, LearnerPathwayResponse, PathwayStep, CareerOutcomes
# In a real scenario, we would load trained models here
# form sklearn.externals import joblib
# model = joblib.load('career_model.pkl')

class ProfilingService:
    def analyze_learner(self, profile: LearnerProfileRequest) -> LearnerPathwayResponse:
        # 1. Determine NSQF Level based on qualification
        nsqf_level, justification = self._determine_nsqf_level(profile.academic_info.highest_qualification)
        
        # 2. Identify Skill Gaps
        skill_gaps = self._analyze_skill_gaps(profile.skills.technical_skills, profile.career_aspirations.target_role)
        
        # 3. Generate Pathway
        pathway = self._generate_pathway(nsqf_level, profile.career_aspirations.target_role)

        # 4. Career Outcomes
        outcomes = self._predict_outcomes(profile.career_aspirations.target_role)

        estimated_timeline = "6 Months" if nsqf_level < 5 else "1 Year"

        return LearnerPathwayResponse(
            learner_summary=f"Learner with {profile.academic_info.highest_qualification} interested in {profile.career_aspirations.preferred_industry}.",
            recommended_nsqf_level=str(nsqf_level),
            justification=justification,
            learning_path=pathway,
            skill_gap=skill_gaps,
            estimated_timeline=estimated_timeline,
            career_outcomes=outcomes
        )

    def _determine_nsqf_level(self, qualification: str):
        qualification = qualification.lower()
        if "8th" in qualification or "below" in qualification:
            return 1, "Entry level due to basic schooling."
        elif "10th" in qualification:
            return 3, "Standard entry for trade roles."
        elif "12th" in qualification:
            return 4, "Higher secondary qualified."
        elif "diploma" in qualification:
            return 5, "Technical diploma holder."
        elif "graduate" in qualification or "btech" in qualification or "degree" in qualification:
            return 6, "Graduate level entry."
        else:
            return 1, "Default entry level."

    def _analyze_skill_gaps(self, current_skills, target_role):
        # Mock logic
        required_skills = {
            "developer": ["python", "sql", "git"],
            "data scientist": ["python", "statistics", "ml"],
            "electrician": ["wiring", "safety", "tools"]
        }
        
        target = target_role.lower()
        needed = []
        for role, skills in required_skills.items():
            if role in target:
                needed = skills
                break
        
        if not needed:
            needed = ["industry knowledge", "communication"]

        current_lower = [s.lower() for s in current_skills]
        gaps = [s for s in needed if s not in current_lower]
        return gaps if gaps else ["Advanced specialized skills"]

    def _generate_pathway(self, start_level, role):
        steps = []
        steps.append(PathwayStep(step_name="Foundation", description="Basic industry orientation", duration="1 Month"))
        steps.append(PathwayStep(step_name="Core Certification", description=f"NSQF Level {start_level} Certification in {role}", duration="3 Months"))
        steps.append(PathwayStep(step_name="Practical Training", description="On-job training or simulation", duration="2 Months"))
        
        if start_level >= 4:
            steps.append(PathwayStep(step_name="Advanced Certification", description=f"NSQF Level {start_level+1} Specialization", duration="6 Months"))

        return steps

    def _predict_outcomes(self, role):
        return CareerOutcomes(
            entry_level=f"Junior {role}",
            mid_level=f"Senior {role}",
            future_specialization=f"Lead {role} / Specialist"
        )

profiling_service = ProfilingService()
