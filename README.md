# 🌱 Volunteer Intelligence System

An AI-powered full-stack web application for volunteer management, built for social impact.

## 🏗️ Architecture

```
ai-volunteer-system/
├── frontend/          # React 18 + Vite
├── backend/           # FastAPI + Python 3.11
├── ai-engine/         # NLP + ML modules
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+


### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/volunteers/register | Register volunteer |
| GET | /api/volunteers/{id} | Get volunteer profile |
| GET | /api/tasks/recommendations/{volunteer_id} | AI task recommendations |
| POST | /api/ai/extract-skills | NLP skill extraction |
| POST | /api/ai/predict-dropout | Dropout prediction |
| POST | /api/ai/chat | Chatbot endpoint |
| GET | /api/admin/analytics | Dashboard analytics |

## 🤖 AI Features

- **Skill Extraction**: NLP-based automatic skill detection from free text
- **Task Matching**: Cosine similarity + weighted scoring for recommendations
- **Dropout Prediction**: ML model based on engagement metrics
- **AI Chatbot**: Claude-powered assistant for volunteers

## 🎮 Gamification

- Bronze / Silver / Gold / Platinum badges
- Impact score calculation
- Hours leaderboard

## 📊 Admin Dashboard

- Volunteer statistics
- Task completion analytics
- Retention risk heatmap
- Real-time activity feed
