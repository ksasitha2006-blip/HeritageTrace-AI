"""Image feature extraction router."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from loguru import logger

from app.services.image_extractor import ImageFeatureExtractor
from app.schemas.image_schemas import ImageFeaturesResponse

router = APIRouter()


@router.post("/extract", response_model=ImageFeaturesResponse, summary="Extract image features")
async def extract_image_features(file: UploadFile = File(..., description="Artefact image (JPEG/PNG/WebP)")):
    """
    Upload a temple artefact image and extract:
    - ORB & SIFT keypoints
    - Color histogram
    - ResNet-50 deep feature vector
    - Image quality metrics (blur, brightness, contrast)
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    try:
        image_bytes = await file.read()
        features = await ImageFeatureExtractor.extract_all(image_bytes, file.filename or "upload")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error(f"Feature extraction error: {exc}")
        raise HTTPException(status_code=500, detail="Feature extraction failed")

    return ImageFeaturesResponse(
        filename=features.filename,
        width=features.width,
        height=features.height,
        orb_keypoints_count=features.orb_keypoints_count,
        sift_keypoints_count=features.sift_keypoints_count,
        deep_features_dims=len(features.deep_features),
        quality=features.quality,
    )
