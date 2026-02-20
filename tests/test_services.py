"""
MediExplain AI - Backend Tests
Run with: pytest tests/
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from services.ner_service import NERService
from services.risk_assessment import RiskAssessmentService
from services.simplification_service import SimplificationService


# ===== NER Service Tests =====

def test_ner_extracts_hemoglobin():
    ner = NERService()
    text = "Hemoglobin: 10.5 g/dL"
    result = ner.extract_entities(text)
    labs = result["lab_values"]
    assert any(l["test"] == "Hemoglobin" and l["value"] == 10.5 for l in labs)


def test_ner_extracts_fbs():
    ner = NERService()
    text = "FBS: 145 mg/dL"
    result = ner.extract_entities(text)
    labs = result["lab_values"]
    assert any(l["test"] == "FBS" and l["value"] == 145 for l in labs)


def test_ner_extracts_medications():
    ner = NERService()
    text = "Patient is taking Metformin 500mg and Aspirin 75mg"
    result = ner.extract_entities(text)
    meds = result["medications"]
    assert "Metformin" in meds
    assert "Aspirin" in meds


def test_ner_extracts_gender():
    ner = NERService()
    text = "Patient: Male, Age: 45"
    result = ner.extract_entities(text)
    assert result["patient_info"].get("gender") == "male"


# ===== Risk Assessment Tests =====

def test_risk_low_all_normal():
    risk = RiskAssessmentService()
    entities = {
        "lab_values": [
            {"test": "Hemoglobin", "value": 14.5, "unit": "g/dL"},
            {"test": "FBS", "value": 90, "unit": "mg/dL"},
        ]
    }
    result = risk.assess(entities, patient_gender="male")
    assert result["risk_level"] == "LOW"
    assert result["abnormal_count"] == 0


def test_risk_medium_one_abnormal():
    risk = RiskAssessmentService()
    entities = {
        "lab_values": [
            {"test": "FBS", "value": 130, "unit": "mg/dL"},
        ]
    }
    result = risk.assess(entities, patient_gender="male")
    assert result["risk_level"] in ("MEDIUM", "HIGH")
    assert result["abnormal_count"] == 1


def test_risk_high_multiple_critical():
    risk = RiskAssessmentService()
    entities = {
        "lab_values": [
            {"test": "FBS", "value": 250, "unit": "mg/dL"},
            {"test": "HbA1c", "value": 9.5, "unit": "%"},
            {"test": "Creatinine", "value": 3.5, "unit": "mg/dL"},
        ]
    }
    result = risk.assess(entities, patient_gender="male")
    assert result["risk_level"] == "HIGH"


def test_risk_low_hemoglobin_flagged():
    risk = RiskAssessmentService()
    entities = {
        "lab_values": [
            {"test": "Hemoglobin", "value": 8.0, "unit": "g/dL"},
        ]
    }
    result = risk.assess(entities, patient_gender="male")
    assert result["abnormal_count"] == 1
    assert result["abnormal_values"][0]["status"] == "low"


# ===== Simplification Tests =====

def test_simplify_text_replaces_medical_terms():
    svc = SimplificationService()
    result = svc.simplify_text("Patient presents with hypertension and elevated SGPT")
    assert "high blood pressure" in result["simplified"]
    assert len(result["terms_found"]) > 0


def test_simplify_generates_recommendations():
    svc = SimplificationService()
    entities = {"lab_values": [], "medications": [], "diagnoses": [], "patient_info": {}}
    risk_result = {
        "risk_level": "HIGH",
        "abnormal_values": [{"test": "FBS", "value": 200, "unit": "mg/dL", "status": "high", "severity": "severe", "normal_range": "70-100 mg/dL"}],
        "normal_values": [],
        "total_tests": 1,
        "abnormal_count": 1,
    }
    result = svc.simplify(
        extracted_text="FBS: 200 mg/dL",
        entities=entities,
        risk_result=risk_result
    )
    assert "explanation" in result
    assert len(result["recommendations"]) > 0
    assert len(result["questions"]) > 0
    assert "URGENT" in result["recommendations"][0]
