"""
Knowledge Route - Lab tests and medication information
"""

from fastapi import APIRouter, HTTPException
import json
from pathlib import Path

from api.models.schemas import LabTestInfo, MedicationInfo

router = APIRouter()

KB_DIR = Path("knowledge_base")


def load_json(filename: str) -> dict:
    path = KB_DIR / filename
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}


@router.get("/test/{test_name}", response_model=LabTestInfo)
async def get_lab_test_info(test_name: str):
    """Get information about a specific lab test"""
    lab_tests = load_json("lab_tests.json")

    # Case-insensitive search
    for key, data in lab_tests.items():
        if key.lower() == test_name.lower():
            ranges = data.get("male") or data.get("all", {})
            male_range = data.get("male", data.get("all", {}))
            female_range = data.get("female", data.get("all", {}))
            unit = male_range.get("unit", "")

            return LabTestInfo(
                name=key,
                unit=unit,
                normal_range_male=f"{male_range.get('min', '?')} - {male_range.get('max', '?')} {unit}",
                normal_range_female=f"{female_range.get('min', '?')} - {female_range.get('max', '?')} {unit}",
                description=data.get("explanation", ""),
                high_meaning=data.get("high_meaning", ""),
                low_meaning=data.get("low_meaning", "")
            )

    raise HTTPException(status_code=404, detail=f"Lab test '{test_name}' not found")


@router.get("/medication/{name}", response_model=MedicationInfo)
async def get_medication_info(name: str):
    """Get information about a specific medication"""
    medications = load_json("medications.json")

    for key, data in medications.items():
        if key.lower() == name.lower():
            return MedicationInfo(
                name=key,
                category=data.get("category", ""),
                purpose=data.get("purpose", ""),
                side_effects=data.get("side_effects", []),
                precautions=data.get("precautions", "")
            )

    raise HTTPException(status_code=404, detail=f"Medication '{name}' not found")


@router.get("/tests")
async def list_lab_tests():
    """List all available lab tests"""
    lab_tests = load_json("lab_tests.json")
    return {"tests": list(lab_tests.keys()), "count": len(lab_tests)}


@router.get("/medications")
async def list_medications():
    """List all available medications"""
    medications = load_json("medications.json")
    return {"medications": list(medications.keys()), "count": len(medications)}
