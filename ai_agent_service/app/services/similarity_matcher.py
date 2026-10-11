"""
Similarity Matching Service
============================
Compares two artefact images using multiple strategies and returns
a fused similarity score.

Fused score:
  1. ORB feature matching  – 70%, structural / shape similarity
  2. Deep feature cosine   – 30%, global appearance via ResNet-50

SIFT and color histogram scores are returned as diagnostics and do not affect
the fused score.
"""

import cv2
import numpy as np
from loguru import logger
from sklearn.metrics.pairwise import cosine_similarity

from app.services.image_extractor import ImageFeatureExtractor
from app.schemas.image_schemas import ImageFeatures
from app.schemas.similarity_schemas import SimilarityResult, MatchDetail
from app.config import settings


class SimilarityMatcher:
    """Multi-strategy similarity scorer for temple artefact images."""

    # ── Feature Matchers ─────────────────────────────────────────────────────
    _bf_hamming  = cv2.BFMatcher(cv2.NORM_HAMMING,  crossCheck=True)   # ORB
    _bf_l2       = cv2.BFMatcher(cv2.NORM_L2,        crossCheck=False)  # SIFT
    _flann       = cv2.FlannBasedMatcher(
        {"algorithm": 1, "trees": 5},   # KD-Tree for SIFT
        {"checks": 50},
    )

    # ── Fusion Weights (must sum to 1.0) ──────────────────────────────────────
    _WEIGHTS = {
        "orb":  0.70,
        "deep": 0.30,
    }

    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def _orb_score(cls, des1, des2) -> float:
        """Ratio of good ORB matches to total keypoints."""
        if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
            return 0.0
        des1 = np.array(des1, dtype=np.uint8)
        des2 = np.array(des2, dtype=np.uint8)
        matches = cls._bf_hamming.match(des1, des2)
        if not matches:
            return 0.0
        good = [m for m in matches if m.distance < 64]
        score = len(good) / max(len(des1), len(des2))
        return min(score * 3, 1.0)   # scale to [0, 1]

    @classmethod
    def _sift_score(cls, des1, des2) -> float:
        """Lowe ratio test on SIFT descriptors."""
        if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
            return 0.0
        des1 = np.array(des1, dtype=np.float32)
        des2 = np.array(des2, dtype=np.float32)
        try:
            matches = cls._flann.knnMatch(des1, des2, k=2)
        except cv2.error:
            return 0.0
        good = [pair[0] for pair in matches if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
        score = len(good) / max(len(des1), len(des2))
        return min(score * 4, 1.0)

    @classmethod
    def _color_score(cls, hist1: list, hist2: list) -> float:
        """Bhattacharyya distance → similarity score."""
        h1 = np.array(hist1, dtype=np.float32)
        h2 = np.array(hist2, dtype=np.float32)
        dist = cv2.compareHist(h1, h2, cv2.HISTCMP_BHATTACHARYYA)
        return float(1.0 - dist)   # 1 = identical, 0 = completely different

    @classmethod
    def _deep_score(cls, feat1: list, feat2: list) -> float:
        """Cosine similarity of ResNet deep feature vectors."""
        if not feat1 or not feat2:
            return 0.0
        v1 = np.array(feat1).reshape(1, -1)
        v2 = np.array(feat2).reshape(1, -1)
        if v1.shape != v2.shape:
            return 0.0
        score = cosine_similarity(v1, v2)[0][0]
        return float(np.clip(score, 0.0, 1.0))

    @classmethod
    def score_features(
        cls,
        feat1: ImageFeatures,
        feat2: ImageFeatures,
    ) -> tuple[float, float, float]:
        """Score already-extracted features, reweighting when a feature is unavailable."""
        orb_score = cls._orb_score(feat1.orb_descriptors, feat2.orb_descriptors)
        deep_score = cls._deep_score(feat1.deep_features, feat2.deep_features)

        active_weights = {}
        if feat1.orb_descriptors and feat2.orb_descriptors:
            active_weights["orb"] = cls._WEIGHTS["orb"]
        if feat1.deep_features and feat2.deep_features:
            active_weights["deep"] = cls._WEIGHTS["deep"]

        weight_total = sum(active_weights.values())
        fused = (
            sum(active_weights[key] * score for key, score in (
                ("orb", orb_score),
                ("deep", deep_score),
            ) if key in active_weights) / weight_total
            if weight_total
            else 0.0
        )
        return orb_score, deep_score, round(float(fused), 4)

    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    async def compute_similarity(
        cls,
        img1_bytes: bytes,
        img2_bytes: bytes,
        filename1: str = "query",
        filename2: str = "reference",
    ) -> SimilarityResult:
        """Extract features from both images and return fused similarity."""

        feat1 = await ImageFeatureExtractor.extract_all(img1_bytes, filename1)
        feat2 = await ImageFeatureExtractor.extract_all(img2_bytes, filename2)

        orb_score, deep_score, fused = cls.score_features(feat1, feat2)
        sift_score  = cls._sift_score(feat1.sift_descriptors, feat2.sift_descriptors)
        color_score = cls._color_score(feat1.color_histogram,  feat2.color_histogram)

        is_match = fused >= settings.SIMILARITY_THRESHOLD

        logger.info(
            f"Similarity [{filename1} ↔ {filename2}]: "
            f"ORB={orb_score:.3f} SIFT={sift_score:.3f} "
            f"Color={color_score:.3f} Deep={deep_score:.3f} → Fused={fused:.4f} "
            f"({'MATCH ✅' if is_match else 'NO MATCH ❌'})"
        )

        return SimilarityResult(
            query_image=filename1,
            reference_image=filename2,
            orb_score=round(orb_score, 4),
            sift_score=round(sift_score, 4),
            color_score=round(color_score, 4),
            deep_score=round(deep_score, 4),
            fused_score=fused,
            is_match=is_match,
            threshold_used=settings.SIMILARITY_THRESHOLD,
            details=MatchDetail(
                query_keypoints=feat1.orb_keypoints_count,
                reference_keypoints=feat2.orb_keypoints_count,
                query_quality=feat1.quality,
                reference_quality=feat2.quality,
            ),
        )
