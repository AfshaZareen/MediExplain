"""
Pydantic Models for MediExplain AI API
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ReportUploadResponse(BaseModel):
    report_id: str
    file_path: str
    file_name: str
    file_size: int
    message: str


class AbnormalValue(BaseModel):
    test: str
    value: float
    unit: str
    status: str
    severity: str
    normal_range: str


class ProcessReportResponse(BaseModel):
    report_id: str
    status: str
    risk_level: str  # LOW, MEDIUM, HIGH, INFO (for clinical/narrative reports)
    simplified_explanation: str
    abnormal_values: List[AbnormalValue]
    recommendations: List[str]
    questions_to_ask_doctor: List[str]
    extracted_text: Optional[str] = None
    language: str = "en"


class SimplifyTextRequest(BaseModel):
    text: str
    language: str = "en"
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = "male"


class SimplifyTextResponse(BaseModel):
    original_text: str
    simplified_text: str
    medical_terms_found: List[str]
    language: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "en"


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str


class LabTestInfo(BaseModel):
    name: str
    unit: str
    normal_range_male: str
    normal_range_female: str
    description: str
    high_meaning: str
    low_meaning: str


class MedicationInfo(BaseModel):
    name: str
    category: str
    purpose: str
    side_effects: List[str]
    precautions: str
