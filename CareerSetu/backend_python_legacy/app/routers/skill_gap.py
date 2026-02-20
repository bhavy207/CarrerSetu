"""
Skill Gap Analyzer — Random Forest Classifier
Identifies missing skills, readiness %, and training recommendations.
"""
import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ── Paths ─────────────────────────────────────────────────────────────────────
_DIR         = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR    = os.path.join(_DIR, '..', '..', '..', 'backend', 'data')
_JOB_CSV     = os.path.join(_DATA_DIR, 'job_roles.csv')
_COURSES_CSV = os.path.join(_DATA_DIR, 'courses.csv')

# pickle cache inside this same folder
_CACHE_DIR   = os.path.join(_DIR, '..', 'models')
_RF_PATH     = os.path.join(_CACHE_DIR, 'skill_gap_rf.pkl')
_MLB_PATH    = os.path.join(_CACHE_DIR, 'skill_gap_mlb.pkl')
_ROLES_PATH  = os.path.join(_CACHE_DIR, 'skill_gap_roles.pkl')

# ── Internals ─────────────────────────────────────────────────────────────────
def _normalise(text: str) -> List[str]:
    """Lowercase + tokenise a skill string."""
    return [t.strip().lower() for t in re.split(r'[,\s]+', text) if t.strip()]


def _load_job_roles() -> pd.DataFrame:
    path = os.path.abspath(_JOB_CSV)
    if not os.path.exists(path):
        raise FileNotFoundError(f"job_roles.csv not found at {path}")
    df = pd.read_csv(path)
    df.fillna('', inplace=True)
    df['skills_list'] = df['required_skills'].apply(_normalise)
    return df


def _load_courses() -> pd.DataFrame:
    path = os.path.abspath(_COURSES_CSV)
    if not os.path.exists(path):
        return pd.DataFrame()
    df = pd.read_csv(path)
    df.fillna('', inplace=True)
    df['skills_list'] = df['skills_covered'].apply(_normalise)
    return df


def _train_model(job_df: pd.DataFrame):
    """
    Train a Random Forest on job-role skill vectors.
    X = binary skill vector (per role), y = 1 if "fully ready", 0 otherwise.
    We generate synthetic training examples:
      - Fully-skilled learner   → label 1
      - 75 % skills present     → label 1
      - 50 % skills present     → label 0
      - 25 % or fewer skills    → label 0
    """
    mlb = MultiLabelBinarizer()
    all_skill_lists = job_df['skills_list'].tolist()
    mlb.fit(all_skill_lists)

    X_rows, y_rows = [], []
    rng = np.random.default_rng(42)

    for skills in all_skill_lists:
        full_vec = mlb.transform([skills])[0]
        indices  = np.where(full_vec == 1)[0]
        n        = len(indices)

        if n == 0:
            continue

        # 100 % ready
        X_rows.append(full_vec.copy()); y_rows.append(1)

        # 75 % ready
        mask75 = full_vec.copy()
        drop   = rng.choice(indices, max(1, n // 4), replace=False)
        mask75[drop] = 0
        X_rows.append(mask75); y_rows.append(1)

        # 50 % ready
        mask50 = full_vec.copy()
        drop   = rng.choice(indices, max(1, n // 2), replace=False)
        mask50[drop] = 0
        X_rows.append(mask50); y_rows.append(0)

        # 25 % ready
        mask25 = np.zeros_like(full_vec)
        keep   = rng.choice(indices, max(1, n // 4), replace=False)
        mask25[keep] = 1
        X_rows.append(mask25); y_rows.append(0)

    X = np.array(X_rows)
    y = np.array(y_rows)

    rf = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
    rf.fit(X, y)
    return rf, mlb


def _get_model():
    os.makedirs(_CACHE_DIR, exist_ok=True)
    if os.path.exists(_RF_PATH) and os.path.exists(_MLB_PATH) and os.path.exists(_ROLES_PATH):
        try:
            with open(_RF_PATH,  'rb') as f: rf  = pickle.load(f)
            with open(_MLB_PATH, 'rb') as f: mlb = pickle.load(f)
            with open(_ROLES_PATH,'rb') as f: job_df = pickle.load(f)
            return rf, mlb, job_df
        except Exception:
            pass  # fall through to retrain

    job_df = _load_job_roles()
    rf, mlb = _train_model(job_df)

    with open(_RF_PATH,  'wb') as f: pickle.dump(rf,     f)
    with open(_MLB_PATH, 'wb') as f: pickle.dump(mlb,    f)
    with open(_ROLES_PATH,'wb') as f: pickle.dump(job_df, f)
    return rf, mlb, job_df


def _suggest_courses(gap_skills: List[str], courses_df: pd.DataFrame, top_n: int = 3) -> List[dict]:
    if courses_df.empty or not gap_skills:
        return []
    scored = []
    for _, row in courses_df.iterrows():
        overlap = sum(1 for g in gap_skills if any(g in s or s in g for s in row['skills_list']))
        if overlap > 0:
            scored.append({'course_id': row['course_id'], 'course_name': row['course_name'],
                           'sector': row['sector'], 'duration': row['duration'],
                           'nsqf_level': int(row['nsqf_level']), 'match_count': overlap})
    scored.sort(key=lambda x: x['match_count'], reverse=True)
    return [{'course_id': c['course_id'], 'course_name': c['course_name'],
             'sector': c['sector'], 'duration': c['duration'],
             'nsqf_level': c['nsqf_level']} for c in scored[:top_n]]


# ── Core analysis function ─────────────────────────────────────────────────────
def analyze_skill_gap(learner_skills: List[str], target_role: str):
    rf, mlb, job_df = _get_model()
    courses_df = _load_courses()

    # Find best-matching job role
    role_lower = target_role.lower().strip()
    job_df['_score'] = job_df['job_role'].str.lower().apply(
        lambda r: (
            10 if r == role_lower else
            8 if role_lower in r else
            6 if r in role_lower else
            sum(2 for word in role_lower.split() if len(word) > 2 and word in r)
        )
    )
    best_row = job_df.loc[job_df['_score'].idxmax()]

    if best_row['_score'] == 0:
        # No match — use generic analysis
        required = learner_skills          # treat user skills as baseline
        matched  = learner_skills
        gaps     = []
    else:
        required = best_row['skills_list']
        l_skills = _normalise(' '.join(learner_skills))
        matched  = [r for r in required if any(r in l or l in r for l in l_skills)]
        gaps     = [r for r in required if r not in matched]

    n_req     = max(len(required), 1)
    readiness = round((len(matched) / n_req) * 100, 1)

    # Random Forest prediction
    try:
        learner_vec = mlb.transform([_normalise(' '.join(learner_skills))])[0].reshape(1, -1)
        rf_prob     = rf.predict_proba(learner_vec)[0]
        job_ready_prob = round(float(rf_prob[1]) * 100, 1)   # class 1 = ready
    except Exception:
        job_ready_prob = readiness

    # Priority-rank gaps by frequency in related roles
    gap_priority = {}
    for _, row in job_df.iterrows():
        for g in gaps:
            if g in row['skills_list']:
                gap_priority[g] = gap_priority.get(g, 0) + 1
    ranked_gaps = sorted(gaps, key=lambda g: gap_priority.get(g, 0), reverse=True)

    # Course suggestions
    suggestions = _suggest_courses(ranked_gaps[:5], courses_df, top_n=5)

    return {
        'target_role':         best_row['job_role'] if best_row['_score'] > 0 else target_role,
        'sector':              best_row['sector']    if best_row['_score'] > 0 else 'General',
        'nsqf_level':          int(best_row['nsqf_level']) if best_row['_score'] > 0 else 1,
        'required_skills':     required,
        'matched_skills':      matched,
        'missing_skills':      ranked_gaps,
        'skill_match_pct':     readiness,
        'job_ready_pct':       job_ready_prob,
        'job_ready':           job_ready_prob >= 60.0,
        'total_required':      n_req,
        'total_matched':       len(matched),
        'total_missing':       len(gaps),
        'training_suggestions': suggestions,
    }


def rebuild_skill_gap_model():
    """Force retrain and overwrite cached model."""
    for p in [_RF_PATH, _MLB_PATH, _ROLES_PATH]:
        if os.path.exists(p): os.remove(p)
    job_df = _load_job_roles()
    rf, mlb = _train_model(job_df)
    os.makedirs(_CACHE_DIR, exist_ok=True)
    with open(_RF_PATH,  'wb') as f: pickle.dump(rf,     f)
    with open(_MLB_PATH, 'wb') as f: pickle.dump(mlb,    f)
    with open(_ROLES_PATH,'wb') as f: pickle.dump(job_df, f)
    return len(job_df)


# ── FastAPI Router ─────────────────────────────────────────────────────────────
class SkillGapRequest(BaseModel):
    learner_skills: List[str]
    target_role: str
    top_n: Optional[int] = 5


@router.post("/analyze")
async def analyze(req: SkillGapRequest):
    """
    Analyze skill gap for a learner against a target job role.
    Uses Random Forest classifier for job-readiness prediction.
    """
    try:
        if not req.target_role.strip():
            raise ValueError("target_role is required")
        result = analyze_skill_gap(req.learner_skills, req.target_role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rebuild")
async def rebuild():
    """Rebuild and retrain the Random Forest model from job_roles.csv."""
    try:
        count = rebuild_skill_gap_model()
        return {"message": f"Model retrained on {count} job roles.", "roles_indexed": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roles")
async def get_roles():
    """Return list of all supported job roles."""
    try:
        job_df = _load_job_roles()
        roles  = job_df[['job_role', 'sector', 'nsqf_level']].to_dict(orient='records')
        return {"roles": roles, "total": len(roles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
