"""
Model pre-loader: initialises heavy ML models once at startup
so every request can reuse them without re-loading.
"""

import numpy as np
from loguru import logger
from typing import Optional
import io

try:
    import torch
    from torchvision import models, transforms
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False
    logger.warning("torch/torchvision not installed — deep feature extraction disabled")

try:
    from sentence_transformers import SentenceTransformer
    _ST_AVAILABLE = True
except ImportError:
    _ST_AVAILABLE = False
    logger.warning("sentence-transformers not installed — embedding model disabled")


class ModelLoader:
    """Singleton holder for all AI models."""

    _ready: bool = False

    # ── Vision backbone (ResNet-50 features) ─────────────────────────────────
    resnet_model: Optional[torch.nn.Module] = None
    resnet_transform: Optional[transforms.Compose] = None

    # ── Sentence / image embedding model ─────────────────────────────────────
    sentence_model: Optional[SentenceTransformer] = None

    @classmethod
    async def initialize(cls) -> None:
        """Load all models into memory."""
        if not _TORCH_AVAILABLE:
            logger.warning("Skipping ResNet model load — torch not available")
            cls._ready = False
            return
        try:
            logger.info("Loading ResNet-50 feature extractor …")
            backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
            cls.resnet_model = torch.nn.Sequential(*list(backbone.children())[:-1])
            cls.resnet_model.eval()

            cls.resnet_transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])

            if _ST_AVAILABLE:
                logger.info("Loading Sentence Transformer …")
                cls.sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

            cls._ready = True
            logger.success("All models loaded ✅")

        except Exception as exc:
            logger.error(f"Model loading failed: {exc}")
            cls._ready = False

    @classmethod
    def is_ready(cls) -> bool:
        return cls._ready

    @classmethod
    def extract_deep_features(cls, pil_image) -> Optional[np.ndarray]:
        """Return a 2048-d ResNet feature vector for a PIL image."""
        if not _TORCH_AVAILABLE or cls.resnet_model is None or cls.resnet_transform is None:
            return None
        tensor = cls.resnet_transform(pil_image).unsqueeze(0)
        with torch.no_grad():
            features = cls.resnet_model(tensor)
        return features.squeeze().numpy()
