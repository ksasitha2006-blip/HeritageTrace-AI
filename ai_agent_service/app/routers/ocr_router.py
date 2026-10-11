"""OCR router."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from loguru import logger

from app.services.ocr_service import OCRService
from app.schemas.ocr_schemas import OCRResult

router = APIRouter()


@router.post("/extract", response_model=OCRResult, summary="Extract text from artefact image")
async def extract_text(
    file: UploadFile = File(..., description="Artefact image containing text/inscriptions"),
):
    """
    Extract text and inscriptions from a temple artefact image using:
    - Tesseract OCR (with denoising + adaptive thresholding pre-processing)
    - EasyOCR (deep-learning model, better for degraded or historical text)

    Results from both engines are merged, deduplicated, and returned.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    try:
        image_bytes = await file.read()
        result = await OCRService.extract_text(image_bytes, file.filename or "upload")
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error(f"OCR error: {exc}")
        raise HTTPException(status_code=500, detail="OCR extraction failed")
