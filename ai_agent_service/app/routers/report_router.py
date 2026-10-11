"""Report generation router."""

import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from loguru import logger
from typing import Optional

from app.services.image_extractor import ImageFeatureExtractor
from app.services.ocr_service import OCRService
from app.services.similarity_matcher import SimilarityMatcher
from app.services.langchain_agents import ImageAnalysisAgent, OCRAnalysisAgent, ReportGenerationAgent
from app.services.report_generator import PDFReportGenerator
from app.config import settings

router = APIRouter()


@router.post("/generate", summary="Generate a full artefact investigation report")
async def generate_report(
    artefact_image: UploadFile = File(..., description="Primary artefact image to analyse"),
    reference_image: Optional[UploadFile] = File(None, description="Optional reference image for similarity check"),
    case_id: str = Form(default="", description="Case / FIR reference ID"),
    reporting_officer: str = Form(default="AI System", description="Name of the reporting officer"),
    output_format: str = Form(default="json", description="Response format: 'json' or 'pdf'"),
):
    """
    Full pipeline:
    1. Extract image features (OpenCV)
    2. Run OCR (Tesseract + EasyOCR)
    3. Optionally compute similarity with a reference image
    4. Run LangChain agents (image analysis + OCR interpretation + report writing)
    5. Return structured JSON or a downloadable PDF report
    """
    if not artefact_image.content_type or not artefact_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Artefact image must be an image file")

    case_id = case_id or f"HT-{uuid.uuid4().hex[:8].upper()}"
    img_bytes = await artefact_image.read()
    filename = artefact_image.filename or "artefact.jpg"

    try:
        # ── Step 1: Feature extraction ────────────────────────────────────
        logger.info(f"[{case_id}] Extracting features …")
        features = await ImageFeatureExtractor.extract_all(img_bytes, filename)
        features_dict = features.model_dump(exclude={"orb_descriptors", "sift_descriptors", "color_histogram", "deep_features"})

        # ── Step 2: OCR ───────────────────────────────────────────────────
        logger.info(f"[{case_id}] Running OCR …")
        ocr_result = await OCRService.extract_text(img_bytes, filename)

        # ── Step 3: Similarity (optional) ─────────────────────────────────
        similarity_dict = None
        if reference_image and reference_image.content_type and reference_image.content_type.startswith("image/"):
            logger.info(f"[{case_id}] Computing similarity …")
            ref_bytes = await reference_image.read()
            sim_result = await SimilarityMatcher.compute_similarity(
                img_bytes, ref_bytes, filename, reference_image.filename or "reference"
            )
            similarity_dict = sim_result.model_dump()

        # ── Step 4: LangChain agents ──────────────────────────────────────
        logger.info(f"[{case_id}] Running LangChain Image Analysis Agent …")
        image_analysis = await ImageAnalysisAgent.analyze(features_dict)

        logger.info(f"[{case_id}] Running LangChain OCR Analysis Agent …")
        ocr_analysis = await OCRAnalysisAgent.analyze(ocr_result.full_text, filename)

        logger.info(f"[{case_id}] Running LangChain Report Generation Agent …")
        report_data = await ReportGenerationAgent.generate(
            image_analysis=image_analysis,
            ocr_analysis=ocr_analysis,
            similarity_result=similarity_dict,
            case_id=case_id,
            reporting_officer=reporting_officer,
        )
        report_data["case_id"] = case_id

        # ── Step 5: Output ────────────────────────────────────────────────
        if output_format.lower() == "pdf":
            pdf_path = os.path.join(settings.REPORTS_DIR, f"{case_id}.pdf")
            PDFReportGenerator.generate(report_data, pdf_path)
            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename=f"HeritageTrace_{case_id}_Report.pdf",
            )

        return {
            "case_id": case_id,
            "status": "success",
            "features_summary": features_dict,
            "ocr_summary": {
                "full_text": ocr_result.full_text,
                "total_blocks": ocr_result.total_blocks,
                "avg_confidence": ocr_result.avg_confidence,
            },
            "similarity": similarity_dict,
            "image_analysis": image_analysis,
            "ocr_analysis": ocr_analysis,
            "report": report_data,
        }

    except Exception as exc:
        logger.error(f"[{case_id}] Report generation failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(exc)}")
