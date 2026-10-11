"""Pydantic schemas for OCR responses."""

from pydantic import BaseModel, Field
from typing import List, Dict


class OCRBlock(BaseModel):
    text: str
    confidence: float          = Field(ge=0.0, le=1.0)
    source: str                = Field(description="'tesseract' or 'easyocr'")
    bounding_box: Dict[str, int] = Field(description="x, y, w, h in pixels")


class OCRResult(BaseModel):
    filename: str
    full_text: str
    blocks: List[OCRBlock]
    total_blocks: int
    avg_confidence: float
    engines_used: List[str]
