"""
OCR Service
============
Extracts text from artefact images using two engines:
  - Tesseract (fast, works offline)
  - EasyOCR   (deep-learning based, better for low-quality / multilingual text)

Results are merged and deduplicated before returning.
"""

import cv2
import numpy as np
import pytesseract
import easyocr
from loguru import logger
from typing import Optional

from app.config import settings
from app.schemas.ocr_schemas import OCRResult, OCRBlock


# ── Tesseract path (Windows) ──────────────────────────────────────────────────
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

# ── EasyOCR reader (initialised once – lazy) ─────────────────────────────────
_easy_reader: Optional[easyocr.Reader] = None
_easy_reader_unavailable = False


def _get_easy_reader() -> Optional[easyocr.Reader]:
    global _easy_reader, _easy_reader_unavailable
    if _easy_reader_unavailable:
        return None
    if _easy_reader is None:
        logger.info("Initialising EasyOCR reader …")
        try:
            _easy_reader = easyocr.Reader(["en"], gpu=False, download_enabled=False)
        except Exception as exc:
            _easy_reader_unavailable = True
            logger.warning(f"EasyOCR model unavailable; continuing with Tesseract: {exc}")
    return _easy_reader


class OCRService:
    """Dual-engine OCR for temple artefact inscriptions."""

    # ── Pre-processing ────────────────────────────────────────────────────────
    @staticmethod
    def _preprocess(bgr: np.ndarray) -> np.ndarray:
        """Denoise, upscale, and threshold for better OCR results."""
        # Convert to grayscale
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        # Upscale 2× for small text
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        # Denoise
        gray = cv2.fastNlMeansDenoising(gray, h=10)
        # Adaptive threshold
        binary = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return binary

    # ── Tesseract ─────────────────────────────────────────────────────────────
    @staticmethod
    def _run_tesseract(bgr: np.ndarray) -> list[OCRBlock]:
        processed = OCRService._preprocess(bgr)
        try:
            data = pytesseract.image_to_data(
                processed,
                output_type=pytesseract.Output.DICT,
                config="--psm 6 --oem 3",
            )
        except Exception as exc:
            logger.warning(f"Tesseract failed: {exc}")
            return []

        blocks: list[OCRBlock] = []
        for i, text in enumerate(data["text"]):
            text = text.strip()
            conf = float(data["conf"][i])
            if text and conf > 40:
                blocks.append(OCRBlock(
                    text=text,
                    confidence=conf / 100.0,
                    source="tesseract",
                    bounding_box={
                        "x": data["left"][i],
                        "y": data["top"][i],
                        "w": data["width"][i],
                        "h": data["height"][i],
                    },
                ))
        return blocks

    # ── EasyOCR ───────────────────────────────────────────────────────────────
    @staticmethod
    def _run_easyocr(bgr: np.ndarray) -> list[OCRBlock]:
        try:
            reader = _get_easy_reader()
            if reader is None:
                return []
            results = reader.readtext(bgr)
        except Exception as exc:
            logger.warning(f"EasyOCR failed: {exc}")
            return []

        blocks: list[OCRBlock] = []
        for bbox, text, conf in results:
            text = text.strip()
            if text and conf > 0.40:
                # bbox is [[x1,y1],[x2,y1],[x2,y2],[x1,y2]]
                xs = [p[0] for p in bbox]
                ys = [p[1] for p in bbox]
                blocks.append(OCRBlock(
                    text=text,
                    confidence=round(conf, 3),
                    source="easyocr",
                    bounding_box={
                        "x": int(min(xs)),
                        "y": int(min(ys)),
                        "w": int(max(xs) - min(xs)),
                        "h": int(max(ys) - min(ys)),
                    },
                ))
        return blocks

    # ── Public API ────────────────────────────────────────────────────────────
    @classmethod
    async def extract_text(cls, image_bytes: bytes, filename: str) -> OCRResult:
        """Run both OCR engines and merge results."""
        arr = np.frombuffer(image_bytes, np.uint8)
        bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Cannot decode image for OCR")

        logger.info(f"Running OCR on {filename} …")

        tess_blocks = cls._run_tesseract(bgr)
        easy_blocks = cls._run_easyocr(bgr)

        all_blocks = tess_blocks + easy_blocks

        # Build merged plain text (deduplicate by lowercased text)
        seen: set[str] = set()
        unique_blocks: list[OCRBlock] = []
        for b in sorted(all_blocks, key=lambda x: -x.confidence):
            key = b.text.lower().strip()
            if key not in seen:
                seen.add(key)
                unique_blocks.append(b)

        full_text = " ".join(b.text for b in unique_blocks)
        avg_confidence = (
            sum(b.confidence for b in unique_blocks) / len(unique_blocks)
            if unique_blocks else 0.0
        )

        logger.info(
            f"OCR [{filename}]: {len(unique_blocks)} blocks, "
            f"avg_conf={avg_confidence:.2f}"
        )

        return OCRResult(
            filename=filename,
            full_text=full_text.strip(),
            blocks=unique_blocks,
            total_blocks=len(unique_blocks),
            avg_confidence=round(avg_confidence, 3),
            engines_used=["tesseract", "easyocr"],
        )
