"""Six-stage registration and visual-match workflow."""

import re
from typing import Any
from uuid import uuid4

import cv2
import numpy as np
from loguru import logger

from app.config import settings
from app.schemas.image_schemas import ImageFeatures
from app.schemas.ocr_schemas import OCRResult
from app.schemas.similarity_schemas import IndexedMatch, MatchDetail, SimilarityResult
from app.services.feature_index import FeatureIndex
from app.services.image_extractor import ImageFeatureExtractor
from app.services.ocr_service import OCRService
from app.services.similarity_matcher import SimilarityMatcher


class VisualMatchPipeline:
    """Coordinates inscription recovery, feature indexing, OCR, search, and reporting."""

    @staticmethod
    def _recovery_test(image_bytes: bytes) -> dict[str, Any]:
        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Could not decode image bytes")
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        mask[0, 0] = 255
        restored = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
        if restored.shape != image.shape:
            raise RuntimeError("OpenCV inpainting returned an unexpected image shape")
        return {
            "status": "inpaint_test_passed",
            "restoration_applied": False,
            "note": "Inpainting was validated on a copy; no source-image pixels were altered.",
        }

    @staticmethod
    async def _extract(image_bytes: bytes, filename: str) -> ImageFeatures:
        return await ImageFeatureExtractor.extract_all(image_bytes, filename)

    @staticmethod
    async def _read_inscription(image_bytes: bytes, filename: str) -> tuple[OCRResult, dict[str, Any]]:
        result = await OCRService.extract_text(image_bytes, filename)
        data = result.model_dump()
        data["status"] = "text_detected" if result.full_text else "no_text_detected"
        data["interpretation"] = (
            f"Recovered {result.total_blocks} text block(s) with average confidence "
            f"{result.avg_confidence:.3f}."
            if result.full_text
            else "No legible inscription was detected."
        )
        return result, data

    @staticmethod
    def _ocr_similarity(query_text: str, reference_text: str) -> float:
        query_tokens = set(re.findall(r"\w+", query_text.casefold()))
        reference_tokens = set(re.findall(r"\w+", reference_text.casefold()))
        if not query_tokens or not reference_tokens:
            return 0.0
        return len(query_tokens & reference_tokens) / len(query_tokens | reference_tokens)

    @classmethod
    def _compare(
        cls,
        query_features: ImageFeatures,
        candidates: list[dict[str, Any]],
        query_ocr: dict[str, Any],
    ) -> list[IndexedMatch]:
        matches: list[IndexedMatch] = []
        query_text = str(query_ocr.get("full_text", ""))
        for item in candidates:
            orb_score, deep_score, visual_score = SimilarityMatcher.score_features(
                query_features,
                item["features"],
            )
            ocr_score = cls._ocr_similarity(
                query_text,
                str(item.get("ocr", {}).get("full_text", "")),
            )
            has_both_inscriptions = bool(query_text.strip()) and bool(
                str(item.get("ocr", {}).get("full_text", "")).strip()
            )
            score = (
                0.9 * visual_score + 0.1 * ocr_score
                if has_both_inscriptions
                else visual_score
            )
            matches.append(
                IndexedMatch(
                    artefact_id=item["artefact_id"],
                    name=item["name"],
                    image_url=item["image_url"],
                    orb_score=round(orb_score, 4),
                    deep_score=round(deep_score, 4),
                    fused_score=round(score, 4),
                    is_match=score >= settings.SIMILARITY_THRESHOLD,
                    visual_score=round(visual_score, 4),
                    ocr_score=round(ocr_score, 4),
                )
            )
        matches.sort(key=lambda match: match.fused_score, reverse=True)
        return matches

    @staticmethod
    def _report(matches: list[IndexedMatch], ocr_data: dict[str, Any]) -> dict[str, Any]:
        best = matches[0] if matches else None
        return {
            "summary": (
                f"Best candidate is {best.name} ({best.artefact_id}) at "
                f"{best.fused_score * 100:.2f}% similarity."
                if best
                else "No artefacts are currently available in the visual index."
            ),
            "top_match": best.model_dump() if best else None,
            "inscription_status": ocr_data["status"],
            "inscription_text": ocr_data["full_text"],
            "ranked_candidates": len(matches),
        }

    @classmethod
    async def _run_search(
        cls,
        image_bytes: bytes,
        filename: str,
        query_features: ImageFeatures | None = None,
        query_ocr: dict[str, Any] | None = None,
        recovery_data: dict[str, Any] | None = None,
        extra_candidates: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        recovery_data = recovery_data or cls._recovery_test(image_bytes)
        features = query_features or await cls._extract(image_bytes, filename)
        if query_ocr is None:
            _, query_ocr = await cls._read_inscription(image_bytes, filename)

        stages = [
            {"stage": 1, "agent": "Inscription Recovery Agent", "status": "completed", "result": recovery_data},
            {
                "stage": 2,
                "agent": "Image Analysis Agent",
                "status": "completed",
                "result": {
                    "resnet_dimensions": len(features.deep_features),
                    "orb_keypoints": features.orb_keypoints_count,
                },
            },
            {"stage": 3, "agent": "OCR Agent", "status": "completed", "result": query_ocr},
        ]

        candidates = FeatureIndex.all()
        if extra_candidates:
            candidates.extend(extra_candidates)
        stages.append(
            {
                "stage": 4,
                "agent": "Vector Index Search Agent",
                "status": "completed",
                "result": {"candidate_count": len(candidates)},
            }
        )
        matches = cls._compare(features, candidates, query_ocr)
        stages.append(
            {
                "stage": 5,
                "agent": "Weighted Comparison Agent",
                "status": "completed",
                "result": {
                    "weights": {"visual": 0.9, "inscription": 0.1},
                    "inscription_weight_applied": bool(query_ocr.get("full_text"))
                    and any(item.get("ocr", {}).get("full_text") for item in candidates),
                },
            }
        )
        report = cls._report(matches, query_ocr)
        stages.append(
            {
                "stage": 6,
                "agent": "Match Report Agent",
                "status": "completed",
                "result": report,
            }
        )
        return {
            "features": features,
            "ocr": query_ocr,
            "recovery": recovery_data,
            "matches": matches,
            "workflow": stages,
            "report": report,
        }

    @classmethod
    async def register(
        cls,
        artefact_id: str,
        name: str,
        image_url: str,
        image_bytes: bytes,
        filename: str,
    ) -> dict[str, Any]:
        recovery_data = cls._recovery_test(image_bytes)
        features = await cls._extract(image_bytes, filename)
        _, ocr_data = await cls._read_inscription(image_bytes, filename)
        FeatureIndex.upsert(artefact_id, name, image_url, features, ocr_data, recovery_data)
        result = await cls._run_search(
            image_bytes,
            filename,
            query_features=features,
            query_ocr=ocr_data,
            recovery_data=recovery_data,
        )
        scan_id = f"registration-{uuid4()}"
        FeatureIndex.save_scan(
            scan_id,
            features,
            ocr_data,
            recovery_data,
            [match.model_dump() for match in result["matches"]],
        )
        logger.info(f"Registered and indexed artefact {artefact_id} through six-stage pipeline")
        return {"artefact_id": artefact_id, "scan_id": scan_id, **result}

    @classmethod
    async def search(cls, image_bytes: bytes, filename: str) -> dict[str, Any]:
        recovery_data = cls._recovery_test(image_bytes)
        features = await cls._extract(image_bytes, filename)
        _, ocr_data = await cls._read_inscription(image_bytes, filename)
        result = await cls._run_search(
            image_bytes,
            filename,
            query_features=features,
            query_ocr=ocr_data,
            recovery_data=recovery_data,
        )
        scan_id = str(uuid4())
        FeatureIndex.save_scan(
            scan_id,
            features,
            ocr_data,
            recovery_data,
            [match.model_dump() for match in result["matches"]],
        )
        return {"scan_id": scan_id, **result}

    @classmethod
    async def compare_pair(
        cls,
        query_bytes: bytes,
        reference_bytes: bytes,
        query_filename: str,
        reference_filename: str,
    ) -> SimilarityResult:
        query_recovery = cls._recovery_test(query_bytes)
        reference_recovery = cls._recovery_test(reference_bytes)
        query_features = await cls._extract(query_bytes, query_filename)
        reference_features = await cls._extract(reference_bytes, reference_filename)
        _, query_ocr = await cls._read_inscription(query_bytes, query_filename)
        _, reference_ocr = await cls._read_inscription(reference_bytes, reference_filename)
        reference_candidate = {
            "artefact_id": "uploaded-reference",
            "name": reference_filename,
            "image_url": "",
            "features": reference_features,
            "ocr": reference_ocr,
            "recovery": reference_recovery,
        }
        result = await cls._run_search(
            query_bytes,
            query_filename,
            query_features,
            query_ocr,
            query_recovery,
            extra_candidates=[reference_candidate],
        )
        reference_match = next(
            match for match in result["matches"] if match.artefact_id == "uploaded-reference"
        )
        return SimilarityResult(
            query_image=query_filename,
            reference_image=reference_filename,
            orb_score=reference_match.orb_score,
            sift_score=round(
                SimilarityMatcher._sift_score(
                    query_features.sift_descriptors,
                    reference_features.sift_descriptors,
                ),
                4,
            ),
            color_score=round(
                SimilarityMatcher._color_score(
                    query_features.color_histogram,
                    reference_features.color_histogram,
                ),
                4,
            ),
            deep_score=reference_match.deep_score,
            fused_score=reference_match.fused_score,
            is_match=reference_match.is_match,
            threshold_used=settings.SIMILARITY_THRESHOLD,
            details=MatchDetail(
                query_keypoints=query_features.orb_keypoints_count,
                reference_keypoints=reference_features.orb_keypoints_count,
                query_quality=query_features.quality,
                reference_quality=reference_features.quality,
            ),
            workflow=result["workflow"],
            report=result["report"],
        )
