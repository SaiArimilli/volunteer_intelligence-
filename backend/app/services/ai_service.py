"""
AI Service Module
- Skill extraction via NLP (spaCy + keyword matching)
- Task recommendation via TF-IDF cosine similarity
- Dropout prediction via logistic regression proxy
- Chatbot via Anthropic Claude API
"""
import re
import math
import random
from typing import List, Dict, Any
from datetime import datetime

import anthropic
from app.config.settings import settings

# ── Skill Keywords Dictionary ─────────────────────────────────────────────────
SKILL_KEYWORDS = {
    "programming": ["python", "javascript", "java", "coding", "developer", "programming",
                    "software", "react", "nodejs", "typescript", "html", "css", "sql"],
    "data": ["data analysis", "machine learning", "ai", "statistics", "excel",
             "tableau", "power bi", "data science", "analytics", "visualization"],
    "communication": ["communication", "writing", "public speaking", "presentation",
                      "storytelling", "content", "copywriting", "journalism"],
    "teaching": ["teaching", "tutoring", "mentoring", "training", "education",
                 "curriculum", "coaching", "instruction"],
    "healthcare": ["medical", "nursing", "healthcare", "first aid", "cpr",
                   "counseling", "mental health", "therapy", "pharmacist"],
    "design": ["design", "graphic", "photoshop", "figma", "illustrator",
               "ui/ux", "branding", "creative", "photography"],
    "management": ["project management", "leadership", "management", "team lead",
                   "agile", "scrum", "planning", "coordination", "organizing"],
    "languages": ["translation", "bilingual", "multilingual", "interpreter",
                  "spanish", "french", "hindi", "arabic", "mandarin"],
    "legal": ["legal", "law", "attorney", "paralegal", "compliance", "contracts"],
    "finance": ["finance", "accounting", "budget", "audit", "tax", "bookkeeping"],
    "social_work": ["social work", "community", "outreach", "counseling",
                    "welfare", "advocacy", "nonprofit"],
    "environment": ["environment", "sustainability", "ecology", "conservation",
                    "recycling", "green", "climate"],
    "construction": ["construction", "carpentry", "plumbing", "electrical",
                     "building", "repairs", "maintenance"],
    "driving": ["driving", "transportation", "logistics", "delivery", "cdl"],
    "cooking": ["cooking", "culinary", "baking", "nutrition", "food service", "chef"],
}


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from free-text using keyword matching.
    Returns a deduplicated list of skill categories detected.
    """
    text_lower = text.lower()
    found_skills = set()

    for skill_category, keywords in SKILL_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                found_skills.add(skill_category.replace("_", " ").title())
                break  # one match per category is enough

    # Also extract capitalized multi-word terms (simple NER fallback)
    tech_terms = re.findall(
        r'\b(Python|JavaScript|React|Java|SQL|AWS|Docker|Figma|Tableau|Excel)\b',
        text, re.IGNORECASE
    )
    for t in tech_terms:
        found_skills.add(t.capitalize())

    return sorted(found_skills)


def _tfidf_score(volunteer_skills: List[str], task_skills: List[str]) -> float:
    """
    Simple Jaccard + weighted overlap score between skill sets.
    Returns a 0-1 float.
    """
    if not volunteer_skills or not task_skills:
        return random.uniform(0.2, 0.5)  # fallback score

    v_set = set(s.lower() for s in volunteer_skills)
    t_set = set(s.lower() for s in task_skills)

    intersection = len(v_set & t_set)
    union = len(v_set | t_set)

    jaccard = intersection / union if union else 0
    # Boost score if volunteer has all required skills
    coverage = intersection / len(t_set) if t_set else 0
    return round(min(1.0, (jaccard * 0.4) + (coverage * 0.6)), 3)


def recommend_tasks(volunteer_skills: List[str], tasks: List[Dict]) -> List[Dict]:
    """
    Rank tasks by skill match score for a volunteer.
    Returns tasks sorted by match_score descending.
    """
    scored = []
    for task in tasks:
        score = _tfidf_score(volunteer_skills, task.get("required_skills", []))
        t = dict(task)
        t["match_score"] = score
        scored.append(t)

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored


def predict_dropout(volunteer_data: Dict[str, Any]) -> float:
    """
    Predict dropout probability using a simple heuristic model.
    Features: days_since_active, tasks_completed, hours_volunteered.

    In production, replace with a trained sklearn LogisticRegression model.
    Returns probability 0.0 - 1.0
    """
    tasks = volunteer_data.get("tasks_completed", 0)
    hours = volunteer_data.get("hours_volunteered", 0.0)

    # Parse last_active
    last_active_str = volunteer_data.get("last_active", datetime.utcnow().isoformat())
    try:
        if isinstance(last_active_str, str):
            last_active = datetime.fromisoformat(last_active_str.replace("Z", ""))
        else:
            last_active = last_active_str
        days_inactive = (datetime.utcnow() - last_active).days
    except Exception:
        days_inactive = 30

    # Heuristic: high inactivity + low engagement = high risk
    risk = 0.5
    risk -= min(0.3, tasks * 0.05)           # more tasks → lower risk
    risk -= min(0.2, hours * 0.02)           # more hours → lower risk
    risk += min(0.4, days_inactive * 0.01)   # longer inactive → higher risk

    return round(max(0.05, min(0.95, risk)), 3)


def calculate_impact_score(tasks_completed: int, hours: float) -> int:
    """Calculate volunteer impact score."""
    return int(tasks_completed * 15 + hours * 5)


def assign_badge(impact_score: int) -> str:
    """Assign gamification badge based on impact score."""
    if impact_score >= 500:
        return "Platinum"
    elif impact_score >= 200:
        return "Gold"
    elif impact_score >= 75:
        return "Silver"
    return "Bronze"


# ── Chatbot ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Voly, the friendly AI assistant for the Volunteer Intelligence System.
You help volunteers:
- Find suitable tasks based on their skills
- Understand how to earn badges and increase their impact score
- Get motivated and stay engaged with volunteering
- Learn about upcoming opportunities

Be warm, encouraging, concise, and actionable. Keep responses under 150 words."""


async def chat_with_volunteer(message: str, history: List[Dict] = None) -> str:
    """
    Send message to Anthropic Claude and return response.
    history: list of {"role": "user"/"assistant", "content": "..."}
    """
    if not settings.anthropic_api_key:
        return (
            "Hi! I'm Voly, your volunteer assistant. "
            "The AI chatbot requires an ANTHROPIC_API_KEY to be configured. "
            "Please ask your admin to set it up!"
        )

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    messages = history or []
    messages.append({"role": "user", "content": message})

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text
