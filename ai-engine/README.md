# AI Engine — Volunteer Intelligence System

Standalone AI/ML modules. These are integrated into the FastAPI backend
via `app/services/ai_service.py`, but can also be run independently for
training, evaluation, or batch processing.

## Modules

| Module | Purpose |
|--------|---------|
| `nlp/skill_extractor.py` | NLP-based skill extraction |
| `ml/dropout_predictor.py` | Logistic regression dropout model |
| `chatbot/voly_bot.py` | Claude-powered chatbot wrapper |

## Running standalone

```bash
cd ai-engine
python nlp/skill_extractor.py
python ml/dropout_predictor.py
```
