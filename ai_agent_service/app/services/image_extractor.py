"""
Image Feature Extraction Service
=================================
Extracts multiple feature representations from artefact images:
  - ORB keypoints + descriptors (fast, rotation-invariant)
  - SIFT keypoints + descriptors (scale-invariant)
  - Color histogram (HSV, 3×256 bins)
  - ResNet-50 deep feature vector (2048-d)
  - Image quality metrics
"""

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

import numpy as np
from PIL import Image
from loguru import logger
from typing import Optional
import io

from app.core.model_loader import ModelLoader
from app.schemas.image_schemas import ImageFeatures, QualityMetrics


class ImageFeatureExtractor:
    """Extracts rich feature sets from temple artefact images."""

    # ── ORB ─────────────────────────────────────────────────────────────────
    _orb = cv2.ORB_create(nfeatures=500)

    # ── SIFT ─────────────────────────────────────────────────────────────────
    _sift = cv2.SIFT_create(contrastThreshold=0.04, edgeThreshold=10)

    # ── Color histogram ──────────────────────────────────────────────────────
    _HIST_BINS = [8, 8, 8]          # H, S, V bins (compact)
    _HIST_RANGES = [0, 180, 0, 256, 0, 256]

    @classmethod
    def _load_image(cls, image_bytes: bytes):
        """Return (cv2_bgr, cv2_gray, pil_rgb) from raw bytes."""
        arr = np.frombuffer(image_bytes, np.uint8)
        bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Could not decode image bytes")
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        pil_rgb = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        return bgr, gray, pil_rgb

    # ── ORB ─────────────────────────────────────────────────────────────────
    @classmethod
    def extract_orb(cls, gray: np.ndarray):
        """Returns (keypoints, descriptors)."""
        kp, des = cls._orb.detectAndCompute(gray, None)
        return kp, des

    # ── SIFT ─────────────────────────────────────────────────────────────────
    @classmethod
    def extract_sift(cls, gray: np.ndarray):
        """Returns (keypoints, descriptors)."""
        if cls._sift is None:
            return [], None
        kp, des = cls._sift.detectAndCompute(gray, None)
        return kp, des

    # ── Color Histogram ───────────────────────────────────────────────────────
    @classmethod
    def extract_color_histogram(cls, bgr: np.ndarray) -> np.ndarray:
        """Returns a normalised flattened HSV histogram."""
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist(
            [hsv], [0, 1, 2], None,
            cls._HIST_BINS, cls._HIST_RANGES
        )
        cv2.normalize(hist, hist)
        return hist.flatten()

    # ── Deep Features ─────────────────────────────────────────────────────────
    @classmethod
    def extract_deep_features(cls, pil_rgb: Image.Image) -> Optional[np.ndarray]:
        """Returns a 2048-d ResNet-50 feature vector."""
        return ModelLoader.extract_deep_features(pil_rgb)

    # ── Quality Metrics ───────────────────────────────────────────────────────
    @classmethod
    def compute_quality_metrics(cls, gray: np.ndarray) -> QualityMetrics:
        """Blur score (Laplacian variance), brightness, contrast."""
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness = float(np.mean(gray))
        contrast = float(np.std(gray))
        is_blurry = laplacian_var < 100.0
        return QualityMetrics(
            blur_score=round(laplacian_var, 2),
            brightness=round(brightness, 2),
            contrast=round(contrast, 2),
            is_blurry=is_blurry,
        )

    # ── Full Extraction Pipeline ───────────────────────────────────────────────
    @classmethod
    async def extract_all(cls, image_bytes: bytes, filename: str) -> ImageFeatures:
        """Run all extractors and return structured result."""
        try:
            bgr, gray, pil_rgb = cls._load_image(image_bytes)

            orb_kp, orb_des = cls.extract_orb(gray)
            sift_kp, sift_des = cls.extract_sift(gray)
            color_hist = cls.extract_color_histogram(bgr)
            deep_vec = cls.extract_deep_features(pil_rgb)
            quality = cls.compute_quality_metrics(gray)

            height, width = bgr.shape[:2]

            logger.info(
                f"[{filename}] ORB={len(orb_kp)} kps | SIFT={len(sift_kp)} kps | "
                f"Deep={'yes' if deep_vec is not None else 'no'}"
            )

            return ImageFeatures(
                filename=filename,
                width=width,
                height=height,
                orb_keypoints_count=len(orb_kp),
                orb_descriptors=orb_des.tolist() if orb_des is not None else [],
                sift_keypoints_count=len(sift_kp),
                sift_descriptors=sift_des.tolist() if sift_des is not None else [],
                color_histogram=color_hist.tolist(),
                deep_features=deep_vec.tolist() if deep_vec is not None else [],
                quality=quality,
            )
        except Exception as exc:
            logger.error(f"Feature extraction failed for {filename}: {exc}")
            raise
