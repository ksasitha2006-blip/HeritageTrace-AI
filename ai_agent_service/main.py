"""
HeritageTrace AI Agent Service
Entry point – configures and starts FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from app.config import settings
from app.routers import image_router, ocr_router, similarity_router, report_router, agent_router
from app.core.model_loader import ModelLoader
from app.services.feature_index import FeatureIndex


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("🚀 HeritageTrace AI Agent Service starting up...")
    FeatureIndex.initialize()
    await ModelLoader.initialize()
    logger.info("✅ Models loaded successfully")
    yield
    logger.info("🛑 Shutting down AI Agent Service")


app = FastAPI(
    title="HeritageTrace AI Agent Service",
    description=(
        "AI-powered backend for temple artefact image analysis, "
        "OCR extraction, similarity matching, and report generation."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(image_router.router,      prefix="/api/image",      tags=["Image Analysis"])
app.include_router(similarity_router.router, prefix="/api/similarity",  tags=["Similarity Matching"])
app.include_router(ocr_router.router,        prefix="/api/ocr",         tags=["OCR"])
app.include_router(report_router.router,     prefix="/api/report",      tags=["Report Generation"])
app.include_router(agent_router.router,      prefix="/api/agent",       tags=["LangChain Agents"])


@app.get("/", tags=["Health"])
async def root():
    return {"service": "HeritageTrace AI Agent Service", "status": "running", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "models_loaded": ModelLoader.is_ready()}
