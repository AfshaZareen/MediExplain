"""
Process Route - Analyzes uploaded medical reports
FIXED: Returns actual OCR content, never fake data.
Shows clear error if OCR fails or no lab values found.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pathlib import Path

from api.models.schemas import ProcessReportResponse, AbnormalValue
from services.ocr_service import OCRService
from services.ner_service import NERService
from services.simplification_service import SimplificationService
from services.risk_assessment import RiskAssessmentService

router = APIRouter()

ocr_service = OCRService()
ner_service = NERService()
simplification_service = SimplificationService()
risk_service = RiskAssessmentService()


@router.post("/report/{report_id}", response_model=ProcessReportResponse)
async def process_report(
    report_id: str,
    file_path: str = Query(...),
    patient_age: Optional[int] = Query(None),
    patient_gender: str = Query("male"),
    language: str = Query("en")
):
    """Process and analyze a medical report"""

    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Report file not found")

    # ── Step 1: OCR ───────────────────────────────────────────
    try:
        extracted_text = ocr_service.extract_text(file_path)
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # ── Step 2: Extract medical entities ─────────────────────
    entities = ner_service.extract_entities(extracted_text)
    lab_values = entities.get("lab_values", [])

    # ── Step 3: Build response depending on report type ──────
    # Case A: Lab report with numerical values
    if lab_values:
        risk_result = risk_service.assess(
            entities,
            patient_gender=patient_gender,
            patient_age=patient_age
        )
        explanation = simplification_service.simplify(
            extracted_text=extracted_text,
            entities=entities,
            risk_result=risk_result,
            patient_age=patient_age,
            patient_gender=patient_gender
        )
        abnormal_values = [
            AbnormalValue(
                test=item["test"],
                value=item["value"],
                unit=item.get("unit", ""),
                status=item["status"],
                severity=item.get("severity", "moderate"),
                normal_range=item.get("normal_range", "See reference")
            )
            for item in risk_result.get("abnormal_values", [])
        ]
        return ProcessReportResponse(
            report_id=report_id,
            status="completed",
            risk_level=risk_result.get("risk_level", "LOW"),
            simplified_explanation=explanation["explanation"],
            abnormal_values=abnormal_values,
            recommendations=explanation["recommendations"],
            questions_to_ask_doctor=explanation["questions"],
            extracted_text=extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
            language=language
        )

    # Case B: Clinical/narrative report (no lab numbers found)
    else:
        explanation = _summarize_clinical_report(extracted_text, entities)
        return ProcessReportResponse(
            report_id=report_id,
            status="completed",
            risk_level="INFO",
            simplified_explanation=explanation["explanation"],
            abnormal_values=[],
            recommendations=explanation["recommendations"],
            questions_to_ask_doctor=explanation["questions"],
            extracted_text=extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
            language=language
        )


def _summarize_clinical_report(extracted_text: str, entities: dict) -> dict:
    """
    Handle clinical/narrative reports (letters, consultations, discharge summaries)
    that don't contain numerical lab values.
    """
    medications = entities.get("medications", [])
    diagnoses = entities.get("diagnoses", [])
    patient_info = entities.get("patient_info", {})

    lines = []
    lines.append("=== CLINICAL REPORT SUMMARY ===\n")
    lines.append("This appears to be a clinical/consultation report (not a lab test report).")
    lines.append("No numerical lab values were detected in this document.\n")

    lines.append("=== WHAT WAS FOUND IN YOUR REPORT ===\n")

    if diagnoses:
        lines.append(f"Conditions/Diagnoses mentioned: {', '.join(diagnoses)}")
    if medications:
        lines.append(f"Medications mentioned: {', '.join(medications)}")
    if patient_info.get("age"):
        lines.append(f"Patient Age: {patient_info['age']}")

    lines.append("\n=== RAW TEXT EXTRACTED FROM YOUR DOCUMENT ===\n")
    lines.append(extracted_text[:1500])

    recommendations = [
        "This is a clinical consultation or narrative report",
        "Please read the full extracted text above for your doctor's notes",
        "If you expected lab values, ensure you uploaded the correct report",
        "Consult your doctor directly for interpretation of clinical notes",
    ]

    questions = [
        "What do the findings in this report mean for my health?",
        "Are any follow-up tests or investigations needed?",
        "What treatment plan do you recommend based on this report?",
        "Should I see any specialist based on these findings?",
    ]

    return {
        "explanation": "\n".join(lines),
        "recommendations": recommendations,
        "questions": questions,
    }
