"""
nlp/skill_extractor.py
Standalone NLP-based skill extraction module.

Can be run directly for testing:
  python nlp/skill_extractor.py
"""

import re
import sys
import os

# Allow running standalone
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

SKILL_KEYWORDS = {
    "Programming": ["python", "javascript", "java", "coding", "developer",
                    "programming", "software", "react", "nodejs", "typescript", "html", "css", "sql"],
    "Data Science": ["data analysis", "machine learning", "ai", "statistics",
                     "excel", "tableau", "power bi", "data science", "analytics"],
    "Communication": ["communication", "writing", "public speaking", "presentation",
                      "storytelling", "content", "copywriting", "journalism"],
    "Teaching": ["teaching", "tutoring", "mentoring", "training", "education",
                 "curriculum", "coaching"],
    "Healthcare": ["medical", "nursing", "healthcare", "first aid", "cpr",
                   "counseling", "mental health", "therapy"],
    "Design": ["design", "graphic", "photoshop", "figma", "illustrator",
               "ui/ux", "branding", "creative", "photography"],
    "Management": ["project management", "leadership", "management", "team lead",
                   "agile", "scrum", "planning", "coordination"],
    "Languages": ["translation", "bilingual", "multilingual", "interpreter",
                  "spanish", "french", "hindi", "arabic", "mandarin"],
    "Legal": ["legal", "law", "attorney", "paralegal", "compliance"],
    "Finance": ["finance", "accounting", "budget", "audit", "tax", "bookkeeping"],
    "Social Work": ["social work", "community", "outreach", "welfare", "advocacy", "nonprofit"],
    "Environment": ["environment", "sustainability", "ecology", "conservation", "recycling", "climate"],
    "Construction": ["construction", "carpentry", "plumbing", "electrical", "building", "repairs"],
    "Driving": ["driving", "transportation", "logistics", "delivery"],
    "Cooking": ["cooking", "culinary", "baking", "nutrition", "food service", "chef"],
}

# Named tech terms to extract directly
TECH_TERMS = re.compile(
    r'\b(Python|JavaScript|React|Java|SQL|AWS|Docker|Kubernetes|Figma|Tableau|'
    r'Excel|TensorFlow|PyTorch|Pandas|FastAPI|Node\.?js|TypeScript|Git)\b',
    re.IGNORECASE
)


def extract_skills(text: str) -> list[str]:
    """
    Extract skills from a free-text description.

    Args:
        text: Volunteer's self-description or bio

    Returns:
        Sorted list of detected skill category strings
    """
    text_lower = text.lower()
    found = set()

    for category, keywords in SKILL_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                found.add(category)
                break

    # Specific tech term extraction
    for match in TECH_TERMS.finditer(text):
        found.add(match.group(0).capitalize())

    return sorted(found)


def demo():
    samples = [
        "I'm a Python developer with 5 years experience in Django and React. "
        "I love teaching others and have mentored several junior devs.",

        "Registered nurse with 10 years of experience. Fluent in Spanish and English. "
        "Certified in CPR and first aid. Passionate about community healthcare.",

        "Graphic designer and photographer. Proficient in Figma, Photoshop, and Illustrator. "
        "Experience creating branding for nonprofits.",
    ]

    for sample in samples:
        print(f"\nInput: {sample[:80]}...")
        skills = extract_skills(sample)
        print(f"Skills: {skills}")


if __name__ == '__main__':
    demo()
