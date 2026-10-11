# HeritageTrace AI Agent Service

Python FastAPI microservice that provides AI-powered image analysis, OCR, similarity matching, and report generation for temple artefacts.

---

## Features

| Module | Technology | Purpose |
|---|---|---|
| Image Feature Extraction | OpenCV (ORB, SIFT), ResNet-50 | Extract keypoints, descriptors, and deep features |
| Similarity Matching | Multi-strategy fused scoring | Match stolen artefacts to registry images |
| Visual Match Pipeline | Six coordinated stages | Recover/test, extract, OCR, retrieve, compare, and report |
| OCR | Tesseract + EasyOCR | Extract text and inscriptions from artefact images |
| Image Analysis Agent | LangChain + GPT-4o | Classify artefact type, period, iconography |
| OCR Analysis Agent | LangChain + GPT-4o | Interpret inscriptions and identify language/script |
| Report Generation Agent | LangChain + GPT-4o | Draft formal ASI investigation reports |
| PDF Export | ReportLab | Export reports as branded PDF documents |

---

## Setup

### 1. Prerequisites

- Python 3.11+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) installed (Windows: `C:\Program Files\Tesseract-OCR\`)

### 2. Create Virtual Environment

```bash
cd ai_agent_service
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 5. Run the Service

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/image/extract` | Extract image features |
| POST | `/api/similarity/match` | Compare two artefact images |
| POST | `/api/similarity/index` | Run the six-stage registration workflow and persist ORB, ResNet, OCR, and recovery metadata |
| POST | `/api/similarity/search` | Run the six-stage scanner workflow and return ranked artefacts, workflow results, and a report |
| DELETE | `/api/similarity/index/{artefact_id}` | Remove an artefact from the feature index |
| POST | `/api/ocr/extract` | Extract text via OCR |
| POST | `/api/report/generate` | Full pipeline → JSON or PDF report |
| POST | `/api/agent/analyze-image` | LangChain image analysis agent |
| POST | `/api/agent/analyze-ocr` | LangChain OCR interpretation agent |
| POST | `/api/agent/generate-report` | LangChain report generation from JSON |

Interactive docs: **http://localhost:8001/docs**

---

## Similarity Scoring

Scores are weighted and fused:

| Strategy | Weight | Method |
|---|---|---|
| ORB keypoints | 70% | Hamming distance + ratio of good matches |
| ResNet-50 deep features | 30% | Cosine similarity (global embedding) |

SIFT keypoint and color-histogram scores are also returned for diagnostics, but do not contribute to the fused score. A **fused score ≥ 0.75** (configurable) triggers a MATCH verdict.
When both the query and a registered artefact have readable inscriptions, the workflow
combines 90% visual similarity with 10% OCR token overlap; otherwise, the visual score
is used without a text penalty.
Registered image features are persisted in SQLite at `FEATURE_DB_PATH` (default:
`ai_agent_service/data/features.sqlite3`) and reused by scanner searches. Scanner queries
and their ranked results are persisted in the `visual_scans` table. The workflow's
match-report stage is deterministic and does not require an OpenAI API key.

---

## Directory Structure

```
ai_agent_service/
├── main.py                        # FastAPI app entry point
├── requirements.txt
├── .env.example
├── app/
│   ├── config.py                  # Settings (pydantic-settings)
│   ├── core/
│   │   └── model_loader.py        # ResNet-50 + SentenceTransformer pre-loader
│   ├── services/
│   │   ├── image_extractor.py     # OpenCV feature extraction
│   │   ├── similarity_matcher.py  # Multi-strategy similarity
│   │   ├── visual_match_pipeline.py # Six-stage registration and scanner workflow
│   │   ├── ocr_service.py         # Tesseract + EasyOCR
│   │   ├── langchain_agents.py    # Three LangChain agents
│   │   └── report_generator.py   # ReportLab PDF generator
│   ├── routers/
│   │   ├── image_router.py
│   │   ├── similarity_router.py
│   │   ├── ocr_router.py
│   │   ├── report_router.py
│   │   └── agent_router.py
│   └── schemas/
│       ├── image_schemas.py
│       ├── similarity_schemas.py
│       └── ocr_schemas.py
```
