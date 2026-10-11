"""
LangChain Agents
================
Three specialised agents:
  1. ImageAnalysisAgent   – describes artefact, detects iconography, period, style
  2. OCRAnalysisAgent     – interprets extracted text, identifies inscriptions/language
  3. ReportGenerationAgent – drafts a structured expert report from combined data
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from loguru import logger
from typing import Optional
import json

from app.config import settings


# ── LLM shared instance ───────────────────────────────────────────────────────
def _get_llm(temperature: float = None) -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        temperature=temperature if temperature is not None else settings.LLM_TEMPERATURE,
        api_key=settings.OPENAI_API_KEY,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 1. IMAGE ANALYSIS AGENT
# ═══════════════════════════════════════════════════════════════════════════════

IMAGE_ANALYSIS_SYSTEM = """You are an expert archaeologist and art historian specialising in 
Indian temple artefacts, sculptures, and iconography. 

When given feature data from an artefact image, you will:
1. Identify the likely type of artefact (idol, plaque, vessel, jewellery, inscription stone, etc.)
2. Detect iconographic details (deity, pose, mudra, attributes, vahana)
3. Estimate the artistic period and regional style (Chola, Pallava, Hoysala, Vijayanagara, etc.)
4. Note material and craftsmanship clues
5. Flag any damage, weathering, or restoration signs
6. Assess authenticity indicators

Always respond in structured JSON with keys:
artefact_type, deity_identified, period_estimate, style, material_clues,
iconographic_details, condition_notes, authenticity_flags, confidence_score, summary
"""


class ImageAnalysisAgent:
    """LangChain agent for image-based artefact classification."""

    @classmethod
    async def analyze(
        cls,
        features: dict,
        image_description: str = "",
    ) -> dict:
        """Analyse extracted image features with LLM."""
        llm = _get_llm()

        prompt_text = f"""Analyse this temple artefact based on the following extracted data:

Image Quality:
- Dimensions: {features.get('width', '?')}×{features.get('height', '?')} px
- Blur score: {features.get('quality', {}).get('blur_score', '?')}
- Brightness: {features.get('quality', {}).get('brightness', '?')}
- ORB keypoints detected: {features.get('orb_keypoints_count', '?')}
- SIFT keypoints detected: {features.get('sift_keypoints_count', '?')}

Additional description: {image_description or 'None provided'}

Provide a detailed expert analysis in the JSON format specified."""

        try:
            messages = [
                SystemMessage(content=IMAGE_ANALYSIS_SYSTEM),
                HumanMessage(content=prompt_text),
            ]
            response = await llm.ainvoke(messages)
            content = response.content

            # Try to parse JSON from response
            try:
                # Strip markdown code fences if present
                clean = content.strip()
                if clean.startswith("```"):
                    clean = "\n".join(clean.split("\n")[1:-1])
                return json.loads(clean)
            except json.JSONDecodeError:
                return {"raw_analysis": content, "parse_error": True}

        except Exception as exc:
            logger.error(f"ImageAnalysisAgent failed: {exc}")
            return {"error": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# 2. OCR ANALYSIS AGENT
# ═══════════════════════════════════════════════════════════════════════════════

OCR_ANALYSIS_SYSTEM = """You are an expert epigrapher and linguist specialising in 
ancient South Indian inscriptions (Tamil, Sanskrit, Telugu, Kannada, Grantha script).

When given OCR-extracted text from a temple artefact, you will:
1. Identify the language and script
2. Attempt transliteration to Roman script
3. Provide an English translation / interpretation
4. Identify names, dates, donors, deities, or historical references mentioned
5. Assess the text's historical significance
6. Flag any illegible or uncertain portions

Respond in structured JSON with keys:
language_identified, script_type, transliteration, english_translation,
historical_references, named_entities, period_estimate, significance, confidence_score, notes
"""


class OCRAnalysisAgent:
    """LangChain agent for interpreting OCR-extracted artefact inscriptions."""

    @classmethod
    async def analyze(cls, ocr_text: str, filename: str = "") -> dict:
        llm = _get_llm(temperature=0.05)

        prompt_text = f"""The following text was extracted via OCR from a temple artefact image ({filename}):

---
{ocr_text if ocr_text.strip() else '[No text detected]'}
---

Please analyse this text and provide your expert interpretation in the specified JSON format."""

        try:
            messages = [
                SystemMessage(content=OCR_ANALYSIS_SYSTEM),
                HumanMessage(content=prompt_text),
            ]
            response = await llm.ainvoke(messages)
            content = response.content
            try:
                clean = content.strip()
                if clean.startswith("```"):
                    clean = "\n".join(clean.split("\n")[1:-1])
                return json.loads(clean)
            except json.JSONDecodeError:
                return {"raw_analysis": content, "parse_error": True}

        except Exception as exc:
            logger.error(f"OCRAnalysisAgent failed: {exc}")
            return {"error": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# 3. REPORT GENERATION AGENT
# ═══════════════════════════════════════════════════════════════════════════════

REPORT_SYSTEM = """You are a senior ASI (Archaeological Survey of India) expert 
who drafts official investigation and authentication reports for temple artefacts.

Given image analysis, OCR analysis, and similarity match data, produce a comprehensive
structured report suitable for law enforcement, courts, and government records.

The report must include:
1. Executive Summary
2. Artefact Description
3. Image Analysis Findings
4. Inscription / Text Analysis
5. Similarity Match Assessment (if provided)
6. Authenticity Assessment
7. Recommendations (for recovery, preservation, legal action)
8. Expert Confidence Level (Low / Medium / High)

Write in formal, professional English. Be factual and evidence-based."""


class ReportGenerationAgent:
    """LangChain agent that produces structured ASI investigation reports."""

    @classmethod
    async def generate(
        cls,
        image_analysis: dict,
        ocr_analysis: dict,
        similarity_result: Optional[dict] = None,
        case_id: str = "UNKNOWN",
        reporting_officer: str = "AI System",
    ) -> dict:
        llm = _get_llm(temperature=0.2)

        sim_section = ""
        if similarity_result:
            sim_section = f"""
Similarity Match Data:
- Query image: {similarity_result.get('query_image', 'N/A')}
- Reference image: {similarity_result.get('reference_image', 'N/A')}
- Fused similarity score: {similarity_result.get('fused_score', 'N/A')}
- Match verdict: {'MATCH' if similarity_result.get('is_match') else 'NO MATCH'}
- ORB score: {similarity_result.get('orb_score', 'N/A')}
- SIFT score: {similarity_result.get('sift_score', 'N/A')}
- Deep feature score: {similarity_result.get('deep_score', 'N/A')}
"""

        prompt_text = f"""
Case ID: {case_id}
Reporting Officer: {reporting_officer}
Date: {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}

=== IMAGE ANALYSIS DATA ===
{json.dumps(image_analysis, indent=2)}

=== OCR / INSCRIPTION ANALYSIS ===
{json.dumps(ocr_analysis, indent=2)}

{sim_section}

Please generate a complete, formal expert investigation report as described.
Return the report as a JSON object with keys:
case_id, date, executive_summary, artefact_description, image_findings,
inscription_findings, similarity_assessment, authenticity_assessment,
recommendations, confidence_level, full_report_text
"""
        try:
            messages = [
                SystemMessage(content=REPORT_SYSTEM),
                HumanMessage(content=prompt_text),
            ]
            response = await llm.ainvoke(messages)
            content = response.content
            try:
                clean = content.strip()
                if clean.startswith("```"):
                    clean = "\n".join(clean.split("\n")[1:-1])
                return json.loads(clean)
            except json.JSONDecodeError:
                return {"full_report_text": content, "parse_error": True, "case_id": case_id}

        except Exception as exc:
            logger.error(f"ReportGenerationAgent failed: {exc}")
            return {"error": str(exc), "case_id": case_id}
