"""Persistent SQLite storage for registered artefact image features."""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator

from app.config import settings
from app.schemas.image_schemas import ImageFeatures


class FeatureIndex:
    """Stores one extracted feature record per registered artefact."""

    @staticmethod
    def _connect() -> sqlite3.Connection:
        database_path = Path(settings.FEATURE_DB_PATH)
        database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(database_path, timeout=30)
        connection.row_factory = sqlite3.Row
        return connection

    @classmethod
    @contextmanager
    def _connection(cls) -> Generator[sqlite3.Connection, None, None]:
        connection = cls._connect()
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    @classmethod
    def initialize(cls) -> None:
        with cls._connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS artefact_features (
                    artefact_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    image_url TEXT NOT NULL,
                    features_json TEXT NOT NULL,
                    ocr_json TEXT NOT NULL DEFAULT '{}',
                    recovery_json TEXT NOT NULL DEFAULT '{}',
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            columns = {
                row["name"]
                for row in connection.execute("PRAGMA table_info(artefact_features)")
            }
            if "ocr_json" not in columns:
                connection.execute(
                    "ALTER TABLE artefact_features ADD COLUMN ocr_json TEXT NOT NULL DEFAULT '{}'"
                )
            if "recovery_json" not in columns:
                connection.execute(
                    "ALTER TABLE artefact_features ADD COLUMN recovery_json TEXT NOT NULL DEFAULT '{}'"
                )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS visual_scans (
                    scan_id TEXT PRIMARY KEY,
                    features_json TEXT NOT NULL,
                    ocr_json TEXT NOT NULL,
                    recovery_json TEXT NOT NULL,
                    matches_json TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    @classmethod
    def upsert(
        cls,
        artefact_id: str,
        name: str,
        image_url: str,
        features: ImageFeatures,
        ocr_data: dict[str, Any] | None = None,
        recovery_data: dict[str, Any] | None = None,
    ) -> None:
        with cls._connection() as connection:
            connection.execute(
                """
                INSERT INTO artefact_features (
                    artefact_id, name, image_url, features_json, ocr_json, recovery_json, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(artefact_id) DO UPDATE SET
                    name = excluded.name,
                    image_url = excluded.image_url,
                    features_json = excluded.features_json,
                    ocr_json = excluded.ocr_json,
                    recovery_json = excluded.recovery_json,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (
                    artefact_id,
                    name,
                    image_url,
                    json.dumps(features.model_dump(exclude={"sift_descriptors", "color_histogram"})),
                    json.dumps(ocr_data or {}),
                    json.dumps(recovery_data or {}),
                ),
            )

    @classmethod
    def delete(cls, artefact_id: str) -> None:
        with cls._connection() as connection:
            connection.execute(
                "DELETE FROM artefact_features WHERE artefact_id = ?",
                (artefact_id,),
            )

    @classmethod
    def all(cls) -> list[dict[str, Any]]:
        with cls._connection() as connection:
            rows = connection.execute(
                """
                SELECT artefact_id, name, image_url, features_json, ocr_json, recovery_json
                FROM artefact_features
                """
            ).fetchall()
        return [
            {
                "artefact_id": row["artefact_id"],
                "name": row["name"],
                "image_url": row["image_url"],
                "features": ImageFeatures.model_validate(json.loads(row["features_json"])),
                "ocr": json.loads(row["ocr_json"]),
                "recovery": json.loads(row["recovery_json"]),
            }
            for row in rows
        ]

    @classmethod
    def save_scan(
        cls,
        scan_id: str,
        features: ImageFeatures,
        ocr_data: dict[str, Any],
        recovery_data: dict[str, Any],
        matches: list[dict[str, Any]],
    ) -> None:
        with cls._connection() as connection:
            connection.execute(
                """
                INSERT INTO visual_scans (
                    scan_id, features_json, ocr_json, recovery_json, matches_json
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    scan_id,
                    json.dumps(features.model_dump(exclude={"sift_descriptors", "color_histogram"})),
                    json.dumps(ocr_data),
                    json.dumps(recovery_data),
                    json.dumps(matches),
                ),
            )
