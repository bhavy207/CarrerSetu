import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

data = {
    'job_role': ['Data Analyst', 'Frontend Dev', 'Backend Dev'],
    'skills_list': [
        ['python', 'sql', 'excel'], 
        ['html', 'css', 'react', 'javascript'],
        ['nodejs', 'python', 'sql', 'mongodb']
    ]
}
job_df = pd.DataFrame(data)

mlb = MultiLabelBinarizer()
all_skill_lists = job_df['skills_list'].tolist()
mlb.fit(all_skill_lists)

X_rows, y_rows = [], []
rng = np.random.default_rng(42)

for skills in all_skill_lists:
    job_vec = mlb.transform([skills])[0]
    indices  = np.where(job_vec == 1)[0]
    n        = len(indices)

    # We add noise / cross-jobs to make it learn negative pairs?
    # If we only train on matching jobs, it might just learn to compare them.
    # 100%
    full_vec = job_vec.copy()
    X_rows.append(np.concatenate([job_vec, full_vec])); y_rows.append(1)
    
    # 75%
    mask75 = job_vec.copy(); drop = rng.choice(indices, max(1, n // 4), replace=False); mask75[drop] = 0
    X_rows.append(np.concatenate([job_vec, mask75])); y_rows.append(1)
    
    # 50%
    mask50 = job_vec.copy(); drop = rng.choice(indices, max(1, n // 2), replace=False); mask50[drop] = 0
    X_rows.append(np.concatenate([job_vec, mask50])); y_rows.append(0)
    
    # 25% (or noise)
    mask25 = np.zeros_like(job_vec); keep = rng.choice(indices, max(1, n // 4), replace=False); mask25[keep] = 1
    X_rows.append(np.concatenate([job_vec, mask25])); y_rows.append(0)

X = np.array(X_rows)
y = np.array(y_rows)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

learner_skills = ['python']
learner_vec = mlb.transform([learner_skills])[0]
print("Learner:", learner_skills)
for job in job_df['job_role']:
    req = job_df[job_df['job_role']==job]['skills_list'].values[0]
    target_job_vec = mlb.transform([req])[0]
    X_inf = np.concatenate([target_job_vec, learner_vec]).reshape(1, -1)
    print(f"{job}:", rf.predict_proba(X_inf)[0][1])

