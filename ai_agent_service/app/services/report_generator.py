"""
PDF Report Generator
====================
Converts the structured report dict from ReportGenerationAgent into
a professionally formatted PDF using ReportLab.
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, darkgrey
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from loguru import logger
import re

from app.config import settings


# ── Colours ──────────────────────────────────────────────────────────────────
SAFFRON    = HexColor("#f97316")
DARK_BG    = HexColor("#1a120b")
MEDIUM_BG  = HexColor("#2d1f0f")
LIGHT_TEXT = HexColor("#fef3c7")
GREY_TEXT  = HexColor("#78716c")


class PDFReportGenerator:
    """Generates a PDF investigation report for a temple artefact case."""

    @classmethod
    def _styles(cls):
        base = getSampleStyleSheet()
        styles = {
            "title": ParagraphStyle(
                "Title",
                parent=base["Title"],
                fontSize=20,
                textColor=SAFFRON,
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName="Helvetica-Bold",
            ),
            "subtitle": ParagraphStyle(
                "Subtitle",
                parent=base["Normal"],
                fontSize=10,
                textColor=GREY_TEXT,
                spaceAfter=12,
                alignment=TA_CENTER,
            ),
            "section": ParagraphStyle(
                "Section",
                parent=base["Heading2"],
                fontSize=13,
                textColor=SAFFRON,
                spaceBefore=14,
                spaceAfter=6,
                fontName="Helvetica-Bold",
            ),
            "body": ParagraphStyle(
                "Body",
                parent=base["Normal"],
                fontSize=10,
                textColor=black,
                leading=14,
                alignment=TA_JUSTIFY,
            ),
            "label": ParagraphStyle(
                "Label",
                parent=base["Normal"],
                fontSize=9,
                textColor=GREY_TEXT,
                fontName="Helvetica-Bold",
            ),
            "value": ParagraphStyle(
                "Value",
                parent=base["Normal"],
                fontSize=10,
                textColor=black,
            ),
            "confidence": ParagraphStyle(
                "Confidence",
                parent=base["Normal"],
                fontSize=12,
                textColor=SAFFRON,
                alignment=TA_CENTER,
                fontName="Helvetica-Bold",
            ),
        }
        return styles

    @classmethod
    def generate(cls, report_data: dict, output_path: str) -> str:
        """
        Build PDF from report dict and save to output_path.
        Returns the saved file path.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        s = cls._styles()
        story = []

        # ── Header ─────────────────────────────────────────────────────────
        story.append(Paragraph("HeritageTrace AI", s["title"]))
        story.append(Paragraph("Artefact Investigation Report", s["subtitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=SAFFRON, spaceAfter=12))

        # ── Meta table ──────────────────────────────────────────────────────
        meta = [
            ["Case ID:", report_data.get("case_id", "N/A"),
             "Date:", report_data.get("date", datetime.now().strftime("%Y-%m-%d"))],
            ["Confidence Level:", report_data.get("confidence_level", "N/A"), "", ""],
        ]
        t = Table(meta, colWidths=[3.5 * cm, 6 * cm, 2.5 * cm, 5.5 * cm])
        t.setStyle(TableStyle([
            ("FONTNAME",  (0, 0), (-1, -1), "Helvetica"),
            ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME",  (2, 0), (2, -1), "Helvetica-Bold"),
            ("FONTSIZE",  (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), GREY_TEXT),
            ("TEXTCOLOR", (2, 0), (2, -1), GREY_TEXT),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.3 * cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=GREY_TEXT, spaceAfter=8))

        # ── Sections ────────────────────────────────────────────────────────
        sections = [
            ("Executive Summary",        "executive_summary"),
            ("Artefact Description",      "artefact_description"),
            ("Image Analysis Findings",   "image_findings"),
            ("Inscription / Text Analysis", "inscription_findings"),
            ("Similarity Match Assessment", "similarity_assessment"),
            ("Authenticity Assessment",   "authenticity_assessment"),
            ("Recommendations",           "recommendations"),
        ]

        for title, key in sections:
            content = report_data.get(key, "")
            if not content:
                continue
            story.append(Paragraph(title, s["section"]))
            if isinstance(content, list):
                for item in content:
                    story.append(Paragraph(f"• {item}", s["body"]))
            elif isinstance(content, dict):
                for k, v in content.items():
                    story.append(Paragraph(f"<b>{k}:</b> {v}", s["body"]))
            else:
                story.append(Paragraph(str(content), s["body"]))
            story.append(Spacer(1, 0.2 * cm))

        # ── Full report text (fallback / supplement) ─────────────────────
        if report_data.get("full_report_text") and report_data.get("parse_error"):
            story.append(Paragraph("Full Report", s["section"]))
            story.append(Paragraph(
                report_data["full_report_text"].replace("\n", "<br/>"),
                s["body"]
            ))

        # ── Footer ──────────────────────────────────────────────────────────
        story.append(Spacer(1, 0.5 * cm))
        story.append(HRFlowable(width="100%", thickness=1, color=SAFFRON))
        story.append(Paragraph(
            "Generated by HeritageTrace AI · Artefact Recovery &amp; Tracking System",
            s["subtitle"]
        ))

        doc.build(story)
        logger.info(f"PDF report saved to {output_path}")
        return output_path
