"""
ml/dropout_predictor.py
Volunteer dropout prediction using scikit-learn LogisticRegression.

In production the model is trained on historical volunteer data.
Here we provide a demo with synthetic training data so the module
can be run and tested standalone.

Run:
  python ml/dropout_predictor.py
"""

import numpy as np
import pickle
import os
from datetime import datetime

try:
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import cross_val_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not installed. Using heuristic model.")


MODEL_PATH = os.path.join(os.path.dirname(__file__), 'dropout_model.pkl')


def _generate_synthetic_data(n=500):
    """
    Generate synthetic training data for demo purposes.
    Features: [tasks_completed, hours_volunteered, days_inactive]
    Label: 1 = dropped out, 0 = active
    """
    np.random.seed(42)
    tasks   = np.random.poisson(3, n).clip(0, 20).astype(float)
    hours   = (tasks * np.random.uniform(1, 4, n)).clip(0, 100)
    days    = np.random.exponential(20, n).clip(0, 180).astype(float)

    # Heuristic ground truth: few tasks + long inactivity → dropout
    prob_dropout = 1 / (1 + np.exp(-(0.05 * days - 0.3 * tasks - 0.05 * hours + 1)))
    labels = (np.random.rand(n) < prob_dropout).astype(int)

    X = np.column_stack([tasks, hours, days])
    return X, labels


def train_model():
    """Train and save the dropout prediction model."""
    if not SKLEARN_AVAILABLE:
        print("scikit-learn not available — skipping training.")
        return None

    X, y = _generate_synthetic_data()

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('clf',    LogisticRegression(max_iter=500, random_state=42)),
    ])

    scores = cross_val_score(pipeline, X, y, cv=5, scoring='roc_auc')
    print(f"✅ Model trained — CV AUC: {scores.mean():.3f} ± {scores.std():.3f}")

    pipeline.fit(X, y)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(pipeline, f)
    print(f"💾 Model saved to {MODEL_PATH}")
    return pipeline


def load_model():
    """Load saved model or train a fresh one."""
    if os.path.exists(MODEL_PATH) and SKLEARN_AVAILABLE:
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    return train_model()


def predict_dropout(
    tasks_completed: int,
    hours_volunteered: float,
    last_active: str | None = None,
) -> float:
    """
    Predict dropout probability for a volunteer.

    Args:
        tasks_completed:   Number of tasks completed
        hours_volunteered: Total hours volunteered
        last_active:       ISO datetime string of last activity

    Returns:
        Dropout probability 0.0 – 1.0
    """
    # Compute days inactive
    if last_active:
        try:
            dt = datetime.fromisoformat(last_active.replace('Z', ''))
            days_inactive = (datetime.utcnow() - dt).days
        except ValueError:
            days_inactive = 30
    else:
        days_inactive = 30

    model = load_model()

    if model and SKLEARN_AVAILABLE:
        X = np.array([[tasks_completed, hours_volunteered, days_inactive]])
        prob = model.predict_proba(X)[0][1]
    else:
        # Heuristic fallback
        risk = 0.5
        risk -= min(0.3, tasks_completed * 0.05)
        risk -= min(0.2, hours_volunteered * 0.02)
        risk += min(0.4, days_inactive * 0.01)
        prob = max(0.05, min(0.95, risk))

    return round(float(prob), 3)


def demo():
    print("=== Dropout Prediction Demo ===\n")
    volunteers = [
        {"name": "Active Aisha",  "tasks": 10, "hours": 40, "last_active": "2024-06-01"},
        {"name": "Fading Felix",  "tasks": 1,  "hours": 2,  "last_active": "2024-01-01"},
        {"name": "New Nadia",     "tasks": 0,  "hours": 0,  "last_active": "2024-06-10"},
        {"name": "Regular Ravi",  "tasks": 5,  "hours": 20, "last_active": "2024-05-15"},
    ]
    for v in volunteers:
        prob = predict_dropout(v["tasks"], v["hours"], v["last_active"])
        level = "🔴 HIGH" if prob > 0.65 else "🟡 MED" if prob > 0.35 else "🟢 LOW"
        print(f"{v['name']:20s} | Risk: {prob:.2f} {level}")


if __name__ == '__main__':
    demo()
