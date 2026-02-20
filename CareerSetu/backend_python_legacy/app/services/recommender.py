"""
AI Recommendation Engine — TF-IDF + Cosine Similarity
Recommends vocational courses based on learner skills, interest,
NSQF level, preferred duration, and target job role.
"""
import os
import re
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Paths ────────────────────────────────────────────────────────────────────
_DIR = os.path.dirname(os.path.abspath(__file__))

def _find_project_root(start: str) -> str:
    """Walk up from `start` until we find a directory containing backend/data/courses.csv."""
    current = start
    for _ in range(10):   # max 10 levels up
        candidate = os.path.join(current, 'backend', 'data', 'courses.csv')
        if os.path.exists(candidate):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    raise FileNotFoundError(
        f"Could not find 'backend/data/courses.csv' by walking up from: {start}"
    )

_PROJECT_ROOT = _find_project_root(_DIR)
_CSV_PATH = os.path.join(_PROJECT_ROOT, 'backend', 'data', 'courses.csv')
_PKL_DIR  = os.path.join(_DIR, '..', 'models')
_VEC_PATH = os.path.join(_PKL_DIR, 'vectorizer.pkl')
_MAT_PATH = os.path.join(_PKL_DIR, 'recommender.pkl')
_DF_PATH  = os.path.join(_PKL_DIR, 'courses_df.pkl')



def _parse_months(duration_str: str) -> int:
    """Extract the numeric month count from a duration string like '6 Months' or '1 Month'."""
    if not isinstance(duration_str, str):
        return 999
    m = re.search(r'(\d+)', duration_str)
    return int(m.group(1)) if m else 999


def _load_csv() -> pd.DataFrame:
    csv_abs = os.path.abspath(_CSV_PATH)
    if not os.path.exists(csv_abs):
        raise FileNotFoundError(
            f"courses.csv not found at: {csv_abs}\n"
            f"_DIR={os.path.abspath(_DIR)}\n"
            "Check that backend/data/courses.csv exists relative to the repo root."
        )
    df = pd.read_csv(csv_abs)
    df.fillna('', inplace=True)

    # skills_covered is comma-separated in CSV — join with spaces for TF-IDF
    df['skills_covered_text'] = df['skills_covered'].apply(
        lambda s: s.replace(',', ' ') if isinstance(s, str) else ''
    )

    # Combine text features for TF-IDF (weighted by repetition)
    df['features'] = (
        df['skills_covered_text'].astype(str) + ' ' +
        df['skills_covered_text'].astype(str) + ' ' +    # double weight on skills
        df['sector'].astype(str) + ' ' +
        df['job_role'].astype(str) + ' ' +
        df['job_role'].astype(str) + ' ' +               # double weight on job role
        df['course_name'].astype(str)
    )

    # Pre-compute numeric duration for filtering
    df['duration_months'] = df['duration'].apply(_parse_months)
    return df


def train_and_save():
    """Train TF-IDF model on courses.csv and persist to disk."""
    os.makedirs(_PKL_DIR, exist_ok=True)
    df = _load_csv()
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['features'])
    with open(_VEC_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    with open(_MAT_PATH, 'wb') as f:
        pickle.dump(tfidf_matrix, f)
    with open(_DF_PATH, 'wb') as f:
        pickle.dump(df.to_dict('records'), f)
    return len(df)


def _load_model():
    """Load persisted model or train if missing."""
    if not (os.path.exists(_VEC_PATH) and os.path.exists(_MAT_PATH) and os.path.exists(_DF_PATH)):
        train_and_save()
    with open(_VEC_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    with open(_MAT_PATH, 'rb') as f:
        tfidf_matrix = pickle.load(f)
    with open(_DF_PATH, 'rb') as f:
        records = pickle.load(f)
        df = pd.DataFrame(records)
    return vectorizer, tfidf_matrix, df


def get_recommendations(
    skills: str,
    interest: str,
    nsqf_level: int = 0,
    preferred_duration_months: int = 0,
    job_role: str = "",
    top_n: int = 5,
) -> list:
    """
    Return top_n course recommendations as list of dicts.

    Args:
        skills                   : space-separated skill keywords from learner profile
        interest                 : target role / preferred industry
        nsqf_level               : user's current / preferred NSQF level (1–8), 0 = ignore
        preferred_duration_months: maximum course duration the user prefers (months), 0 = ignore
        job_role                 : user's target job role (substring match used for boosting)
        top_n                    : number of results (default 5)
    """
    vectorizer, tfidf_matrix, df = _load_model()

    # ── Build query string ────────────────────────────────────────────────────
    # Heavily weight skills in the base TF-IDF calculation by duplicating them
    parts = [skills, skills, skills, interest, job_role]
    query = ' '.join(p for p in parts if p).strip()
    if not query:
        query = 'general vocational training'

    query_vec = vectorizer.transform([query])
    base_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # ── Apply boosting multipliers ────────────────────────────────────────────
    boosted_scores = base_scores.copy()
    for idx in range(len(df)):
        row = df.iloc[idx]
        multiplier = 1.0

        # NSQF Level boost: course within ±1 of user's NSQF level
        if nsqf_level > 0:
            course_nsqf = int(row.get('nsqf_level', 0))
            if abs(course_nsqf - nsqf_level) <= 1:
                multiplier += 0.20

        # Duration boost: course duration ≤ user's preferred max
        if preferred_duration_months > 0:
            course_months = int(row.get('duration_months', 999))
            if course_months <= preferred_duration_months:
                multiplier += 0.15

        # Job Role boost: substring match (case-insensitive)
        if job_role:
            course_job = str(row.get('job_role', '')).lower()
            user_job   = job_role.lower()
            # Check if any word from user's job role appears in course job role
            if any(word in course_job for word in user_job.split() if len(word) > 2):
                multiplier += 0.25

        # Skills boost: strong multiplier for every matching skill
        if skills:
            course_skills = str(row.get('skills_covered', row.get('skills', ''))).lower()
            user_skills_list = [s.strip().lower() for s in skills.split() if len(s.strip()) > 1]
            matched_skills = sum(1 for s in user_skills_list if s in course_skills)
            if matched_skills > 0:
                multiplier += (0.35 * matched_skills)  # VERY strong boost for matching technical skills

        boosted_scores[idx] *= multiplier

    # ── Rank and return top_n ─────────────────────────────────────────────────
    top_indices = boosted_scores.argsort()[::-1][:top_n]

    # Determine match quality thresholds relative to max score
    max_score = float(boosted_scores[top_indices[0]]) if len(top_indices) > 0 else 1.0

    results = []
    for rank, idx in enumerate(top_indices, start=1):
        row = df.iloc[idx]
        raw_score = float(boosted_scores[idx])
        normalised = raw_score / max_score if max_score > 0 else 0

        if normalised >= 0.75:
            match_quality = 'High'
        elif normalised >= 0.45:
            match_quality = 'Medium'
        else:
            match_quality = 'Low'

        # skills_covered can be a comma-separated string or list
        skills_raw = row.get('skills_covered', row.get('skills', ''))
        if isinstance(skills_raw, str):
            skills_list = [s.strip() for s in skills_raw.split(',') if s.strip()]
        else:
            skills_list = list(skills_raw)

        results.append({
            'rank':           rank,
            'course_id':      row['course_id'],
            'course_name':    row['course_name'],
            'sector':         row['sector'],
            'skills_covered': skills_list,
            'nsqf_level':     int(row['nsqf_level']),
            'duration':       row['duration'],
            'job_role':       row['job_role'],
            'similarity_score': round(normalised, 4),
            'raw_score':      round(raw_score, 4),
            'match_quality':  match_quality,
        })
    return results
