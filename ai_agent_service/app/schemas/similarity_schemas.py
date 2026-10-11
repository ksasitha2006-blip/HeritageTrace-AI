"""Pydantic schemas for similarity matching responses."""

from typing import Any

from pydantic import BaseModel, Field
from app.schemas.image_schemas import QualityMetrics


class IndexedMatch(BaseModel):
    artefact_id: str
    name: str
    image_url: str
    orb_score: float
    deep_score: float
    fused_score: float
    is_match: bool
    visual_score: float = 0.0
    ocr_score: float = 0.0


class IndexedSearchResponse(BaseModel):
    count: int
    matches: list[IndexedMatch]
    scan_id: str = ""
    query_ocr: dict[str, Any] = Field(default_factory=dict)
    workflow: list[dict[str, Any]] = Field(default_factory=list)
    report: dict[str, Any] = Field(default_factory=dict)


class MatchDetail(BaseModel):
    query_keypoints: int
    reference_keypoints: int
    query_quality: QualityMetrics
    reference_quality: QualityMetrics


class SimilarityResult(BaseModel):
    query_image: str
    reference_image: str

    # Per-strategy scores [0, 1]
    orb_score: float   = Field(description="ORB keypoint matching score")
    sift_score: float  = Field(description="SIFT keypoint matching score")
    color_score: float = Field(description="Bhattacharyya color histogram similarity")
    deep_score: float  = Field(description="ResNet cosine similarity")

    # Fused result
    fused_score: float     = Field(description="Weighted combination of ORB (70%) and ResNet deep features (30%)")
    is_match: bool         = Field(description="True if fused_score ≥ threshold")
    threshold_used: float

    details: MatchDetail
    workflow: list[dict[str, Any]] = Field(default_factory=list)
    report: dict[str, Any] = Field(default_factory=dict)
