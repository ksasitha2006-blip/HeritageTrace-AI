"""
LangChain Agent router – expose individual agent endpoints for
flexible frontend integration.
"""

from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException
from loguru import logger
from typing import Optional
import json

from app.services.image_extractor import ImageFeatureExtractor
from app.services.ocr_service import OCRService
from app.services.langchain_agents import (
    ImageAnalysisAgent,
    OCRAnalysisAgent,
    ReportGenerationAgent,
)

router = APIRouter()


@router.post("/analyze-image", summary="LangChain agent: analyse artefact image")
async def analyze_image(
    file: UploadFile = File(...),
    description: str = Form(default="", description="Optional visual description hint"),
):
    """Run the ImageAnalysisAgent on an uploaded artefact image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must upload an image")

    try:
        img_bytes = await file.read()
        features = await ImageFeatureExtractor.extract_all(img_bytes, file.filename or "upload")
        features_dict = features.model_dump(
            exclude={"orb_descriptors", "sift_descriptors", "color_histogram", "deep_features"}
        )
        result = await ImageAnalysisAgent.analyze(features_dict, description)
        return {"status": "success", "agent": "ImageAnalysisAgent", "result": result}
    except Exception as exc:
        logger.error(f"ImageAnalysisAgent error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/analyze-ocr", summary="LangChain agent: analyse OCR text")
async def analyze_ocr(
    file: UploadFile = File(..., description="Artefact image with inscriptions"),
):
    """Extract text via OCR then run the OCRAnalysisAgent for interpretation."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must upload an image")

    try:
        img_bytes = await file.read()
        ocr_result = await OCRService.extract_text(img_bytes, file.filename or "upload")
        agent_result = await OCRAnalysisAgent.analyze(ocr_result.full_text, file.filename or "")
        return {
            "status": "success",
            "agent": "OCRAnalysisAgent",
            "ocr_text": ocr_result.full_text,
            "result": agent_result,
        }
    except Exception as exc:
        logger.error(f"OCRAnalysisAgent error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/generate-report", summary="LangChain agent: generate report from JSON data")
async def generate_report_from_json(
    image_analysis: dict = Body(..., description="Output from ImageAnalysisAgent"),
    ocr_analysis: dict   = Body(..., description="Output from OCRAnalysisAgent"),
    similarity_result: Optional[dict] = Body(None, description="Output from similarity matcher"),
    case_id: str         = Body(default="AUTO", description="Case reference ID"),
    reporting_officer: str = Body(default="AI System"),
):
    """
    Call the ReportGenerationAgent directly with pre-existing analysis data.
    Useful when you already have image/OCR analysis and just want a report.
    """
    try:
        result = await ReportGenerationAgent.generate(
            image_analysis=image_analysis,
            ocr_analysis=ocr_analysis,
            similarity_result=similarity_result,
            case_id=case_id,
            reporting_officer=reporting_officer,
        )
        return {"status": "success", "agent": "ReportGenerationAgent", "report": result}
    except Exception as exc:
        logger.error(f"ReportGenerationAgent error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
