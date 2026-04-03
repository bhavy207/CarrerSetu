import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

# mock job roles
data = {
    'job_role': ['Data Analyst', 'Frontend Dev'],
    'skills_list': [['python', 'sql', 'excel'], ['html', 'css', 'react']]
}
job_df = pd.DataFrame(data)

mlb = MultiLabelBinarizer()
all_skill_lists = job_df['skills_list'].tolist()
mlb.fit(all_skill_lists)

X_rows, y_rows = [], []
rng = np.random.default_rng(42)

for skills in all_skill_lists:
    full_vec = mlb.transform([skills])[0]
    indices  = np.where(full_vec == 1)[0]
    n        = len(indices)

    # 100%
    X_rows.append(full_vec.copy()); y_rows.append(1)
    # 75%
    mask75 = full_vec.copy(); drop = rng.choice(indices, max(1, n // 4), replace=False); mask75[drop] = 0; X_rows.append(mask75); y_rows.append(1)
    # 50%
    mask50 = full_vec.copy(); drop = rng.choice(indices, max(1, n // 2), replace=False); mask50[drop] = 0; X_rows.append(mask50); y_rows.append(0)
    # 25%
    mask25 = np.zeros_like(full_vec); keep = rng.choice(indices, max(1, n // 4), replace=False); mask25[keep] = 1; X_rows.append(mask25); y_rows.append(0)

X = np.array(X_rows)
y = np.array(y_rows)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

# Predict for learner with "html, css, react"
# If target is Data Analyst, we currently pass ALL learner skills:
learner_skills = ['html', 'css', 'react']
print("CURRENT (passes all learner skills):")
for job in job_df['job_role']:
    req = job_df[job_df['job_role']==job]['skills_list'].values[0]
    learner_vec = mlb.transform([learner_skills])[0].reshape(1, -1)
    print(f"{job}:", rf.predict_proba(learner_vec)[0][1])

print("\nPROPOSED (passes only matched skills):")
for job in job_df['job_role']:
    req = job_df[job_df['job_role']==job]['skills_list'].values[0]
    matched = [r for r in req if r in learner_skills]
    learner_vec = mlb.transform([matched])[0].reshape(1, -1)
    print(f"{job}:", rf.predict_proba(learner_vec)[0][1])

