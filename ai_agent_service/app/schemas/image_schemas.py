"""Pydantic schemas for image feature extraction responses."""

from pydantic import BaseModel, Field
from typing import List, Optional


class QualityMetrics(BaseModel):
    blur_score: float = Field(description="Laplacian variance – higher = sharper")
    brightness: float = Field(description="Mean pixel intensity (0–255)")
    contrast: float   = Field(description="Std deviation of pixel intensity")
    is_blurry: bool   = Field(description="True if blur_score < 100")


class ImageFeatures(BaseModel):
    filename: str
    width: int
    height: int

    # ORB
    orb_keypoints_count: int
    orb_descriptors: List[List[int]] = Field(default_factory=list)

    # SIFT
    sift_keypoints_count: int
    sift_descriptors: List[List[float]] = Field(default_factory=list)

    # Color
    color_histogram: List[float] = Field(default_factory=list)

    # Deep (ResNet)
    deep_features: List[float] = Field(default_factory=list)

    # Quality
    quality: QualityMetrics


class ImageFeaturesResponse(BaseModel):
    """Lightweight version returned by the API (descriptors excluded for size)."""
    filename: str
    width: int
    height: int
    orb_keypoints_count: int
    sift_keypoints_count: int
    deep_features_dims: int
    quality: QualityMetrics
    message: str = "Feature extraction successful"
