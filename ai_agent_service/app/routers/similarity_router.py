"""Similarity matching router."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from loguru import logger

from app.services.feature_index import FeatureIndex
from app.schemas.similarity_schemas import SimilarityResult, IndexedSearchResponse
from app.services.visual_match_pipeline import VisualMatchPipeline

router = APIRouter()
SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}


def _validate_image(upload: UploadFile) -> None:
    if upload.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and BMP images are accepted")


@router.post("/index", summary="Extract and persist a registered artefact's features")
async def index_artefact(
    artefact_id: str = Form(...),
    name: str = Form(...),
    image_url: str = Form(...),
    image: UploadFile = File(...),
):
    _validate_image(image)
    try:
        image_bytes = await image.read()
        result = await VisualMatchPipeline.register(
            artefact_id,
            name,
            image_url,
            image_bytes,
            image.filename or artefact_id,
        )
        features = result["features"]
        return {
            "success": True,
            "artefact_id": artefact_id,
            "orb_keypoints": features.orb_keypoints_count,
            "deep_features": len(features.deep_features),
            "scan_id": result["scan_id"],
            "workflow": result["workflow"],
            "report": result["report"],
        }
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception(f"Could not index artefact {artefact_id}: {exc}")
        raise HTTPException(status_code=500, detail="Artefact feature indexing failed")


@router.delete("/index/{artefact_id}", summary="Remove an artefact from the feature index")
async def delete_indexed_artefact(artefact_id: str):
    FeatureIndex.delete(artefact_id)
    return {"success": True, "artefact_id": artefact_id}


@router.post("/search", response_model=IndexedSearchResponse, summary="Search indexed artefacts by image")
async def search_indexed_artefacts(query_image: UploadFile = File(...)):
    _validate_image(query_image)
    try:
        query_bytes = await query_image.read()
        result = await VisualMatchPipeline.search(
            query_bytes,
            query_image.filename or "query",
        )
        return IndexedSearchResponse(
            count=len(result["matches"]),
            matches=result["matches"],
            scan_id=result["scan_id"],
            query_ocr=result["ocr"],
            workflow=result["workflow"],
            report=result["report"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception(f"Indexed similarity search failed: {exc}")
        raise HTTPException(status_code=500, detail="Indexed similarity search failed")


@router.post("/match", response_model=SimilarityResult, summary="Compare two artefact images")
async def match_artefacts(
    query_image: UploadFile = File(...,     description="The query / suspect artefact image"),
    reference_image: UploadFile = File(..., description="The reference / registered artefact image"),
):
    """
    Upload two artefact images and receive a fused similarity score using
    70% ORB keypoint matching and 30% ResNet deep-feature cosine similarity.
    SIFT descriptor and color-histogram scores are included as diagnostics.

    Returns a fused score [0-1] and a MATCH / NO MATCH verdict.
    """
    _validate_image(query_image)
    _validate_image(reference_image)

    try:
        q_bytes = await query_image.read()
        r_bytes = await reference_image.read()

        return await VisualMatchPipeline.compare_pair(
            q_bytes, r_bytes,
            query_image.filename or "query",
            reference_image.filename or "reference",
        )

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception(f"Similarity matching error: {exc}")
        raise HTTPException(status_code=500, detail="Similarity computation failed")
