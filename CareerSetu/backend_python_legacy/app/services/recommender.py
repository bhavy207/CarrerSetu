"""
AI Recommendation Engine — TF-IDF + Cosine Similarity
Recommends vocational courses based on learner skills and interest.
"""
import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Paths ────────────────────────────────────────────────────────────────────
_DIR       = os.path.dirname(__file__)
_DATA_DIR  = os.path.join(_DIR, '..', '..', '..', '..', 'backend', 'data')
_CSV_PATH  = os.path.join(_DATA_DIR, 'courses.csv')
_PKL_DIR   = os.path.join(_DIR, '..', 'models')
_VEC_PATH  = os.path.join(_PKL_DIR, 'vectorizer.pkl')
_MAT_PATH  = os.path.join(_PKL_DIR, 'recommender.pkl')
_DF_PATH   = os.path.join(_PKL_DIR, 'courses_df.pkl')


def _load_csv() -> pd.DataFrame:
    df = pd.read_csv(_CSV_PATH)
    df.fillna('', inplace=True)
    # skills_covered is comma-separated in CSV — join with spaces for TF-IDF
    df['skills_covered_text'] = df['skills_covered'].apply(
        lambda s: s.replace(',', ' ') if isinstance(s, str) else ''
    )
    # Combine text features for TF-IDF (weighted by repetition)
    df['features'] = (
        df['skills_covered_text'].astype(str) + ' ' +
        df['skills_covered_text'].astype(str) + ' ' +    # double weight
        df['sector'].astype(str) + ' ' +
        df['job_role'].astype(str) + ' ' +
        df['job_role'].astype(str) + ' ' +               # double weight
        df['course_name'].astype(str)
    )
    return df


def train_and_save():
    """Train TF-IDF model on courses.csv and persist to disk."""
    os.makedirs(_PKL_DIR, exist_ok=True)
    df = _load_csv()
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['features'])
    with open(_VEC_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    with open(_MAT_PATH, 'wb') as f:
        pickle.dump(tfidf_matrix, f)
    with open(_DF_PATH, 'wb') as f:
        pickle.dump(df, f)
    return len(df)


def _load_model():
    """Load persisted model or train if missing."""
    if not (os.path.exists(_VEC_PATH) and os.path.exists(_MAT_PATH)):
        train_and_save()
    with open(_VEC_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    with open(_MAT_PATH, 'rb') as f:
        tfidf_matrix = pickle.load(f)
    with open(_DF_PATH, 'rb') as f:
        df = pickle.load(f)
    return vectorizer, tfidf_matrix, df


def get_recommendations(skills: str, interest: str, top_n: int = 5) -> list:
    """
    Return top_n course recommendations as list of dicts.
    Args:
        skills   : space-separated skill keywords from learner profile
        interest : target role / preferred industry
        top_n    : number of results (default 5)
    """
    vectorizer, tfidf_matrix, df = _load_model()

    query = f"{skills} {interest}".strip()
    if not query:
        query = 'general vocational'

    query_vec = vectorizer.transform([query])
    scores    = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # Get top_n indices sorted by score descending
    top_indices = scores.argsort()[::-1][:top_n]

    results = []
    for idx in top_indices:
        row = df.iloc[idx]
        results.append({
            'course_id':   row['course_id'],
            'course_name': row['course_name'],
            'sector':      row['sector'],
            'skills':      row['skills'].split() if isinstance(row['skills'], str) else [],
            'nsqf_level':  int(row['nsqf_level']),
            'duration':    row['duration'],
            'job_role':    row['job_role'],
            'score':       round(float(scores[idx]), 4),
        })
    return results
