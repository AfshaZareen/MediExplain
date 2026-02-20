"""
Risk Assessment Service - Evaluate lab values against reference ranges
"""

from typing import Dict, List, Any, Optional
import json
from pathlib import Path


class RiskAssessmentService:
    def __init__(self):
        self.reference_ranges = {
            "Hemoglobin": {
                "male": {"min": 13.5, "max": 17.5, "unit": "g/dL"},
                "female": {"min": 12.0, "max": 15.5, "unit": "g/dL"},
            },
            "WBC": {
                "all": {"min": 4000, "max": 11000, "unit": "/cumm"},
            },
            "RBC": {
                "male": {"min": 4.5, "max": 5.9, "unit": "million/cumm"},
                "female": {"min": 4.0, "max": 5.2, "unit": "million/cumm"},
            },
            "Platelet": {
                "all": {"min": 150000, "max": 400000, "unit": "/cumm"},
            },
            "FBS": {
                "all": {"min": 70, "max": 100, "unit": "mg/dL"},
            },
            "HbA1c": {
                "all": {"min": 4.0, "max": 5.6, "unit": "%"},
            },
            "SGPT": {
                "male": {"min": 7, "max": 56, "unit": "U/L"},
                "female": {"min": 7, "max": 45, "unit": "U/L"},
            },
            "SGOT": {
                "male": {"min": 10, "max": 40, "unit": "U/L"},
                "female": {"min": 10, "max": 35, "unit": "U/L"},
            },
            "Cholesterol": {
                "all": {"min": 0, "max": 200, "unit": "mg/dL"},
            },
            "LDL": {
                "all": {"min": 0, "max": 100, "unit": "mg/dL"},
            },
            "HDL": {
                "male": {"min": 40, "max": 999, "unit": "mg/dL"},
                "female": {"min": 50, "max": 999, "unit": "mg/dL"},
            },
            "Triglycerides": {
                "all": {"min": 0, "max": 150, "unit": "mg/dL"},
            },
            "Creatinine": {
                "male": {"min": 0.7, "max": 1.3, "unit": "mg/dL"},
                "female": {"min": 0.6, "max": 1.1, "unit": "mg/dL"},
            },
            "Urea": {
                "all": {"min": 7, "max": 20, "unit": "mg/dL"},
            },
            "TSH": {
                "all": {"min": 0.4, "max": 4.0, "unit": "mIU/L"},
            },
            "Sodium": {
                "all": {"min": 136, "max": 145, "unit": "mEq/L"},
            },
            "Potassium": {
                "all": {"min": 3.5, "max": 5.0, "unit": "mEq/L"},
            },
        }

        # Tests that are HIGH priority (critical to flag)
        self.critical_tests = {"FBS", "HbA1c", "Cholesterol", "LDL", "Creatinine", "TSH"}

    def assess(
        self,
        entities: Dict,
        patient_gender: str = "male",
        patient_age: Optional[int] = None
    ) -> Dict[str, Any]:
        """Full risk assessment based on extracted entities"""

        lab_values = entities.get("lab_values", [])
        abnormal_values = []
        normal_values = []

        for lab in lab_values:
            test_name = lab["test"]
            value = lab["value"]
            unit = lab.get("unit", "")

            result = self._check_value(test_name, value, patient_gender)
            if result["is_abnormal"]:
                severity = self._get_severity(test_name, value, result, patient_gender)
                normal_range = self._get_normal_range_str(test_name, patient_gender)
                abnormal_values.append({
                    "test": test_name,
                    "value": value,
                    "unit": result.get("unit", unit),
                    "status": result["status"],
                    "severity": severity,
                    "normal_range": normal_range,
                })
            else:
                normal_values.append(test_name)

        risk_level = self._compute_risk_level(abnormal_values)

        return {
            "risk_level": risk_level,
            "abnormal_values": abnormal_values,
            "normal_values": normal_values,
            "total_tests": len(lab_values),
            "abnormal_count": len(abnormal_values),
        }

    def _check_value(self, test_name: str, value: float, gender: str) -> Dict:
        """Check if a lab value is abnormal"""
        if test_name not in self.reference_ranges:
            return {"is_abnormal": False, "status": "unknown"}

        ranges = self.reference_ranges[test_name]
        if gender in ranges:
            ref = ranges[gender]
        else:
            ref = ranges.get("all", {})

        if not ref:
            return {"is_abnormal": False, "status": "unknown"}

        unit = ref.get("unit", "")
        min_val = ref["min"]
        max_val = ref["max"]

        if value < min_val:
            return {"is_abnormal": True, "status": "low", "unit": unit,
                    "min": min_val, "max": max_val}
        elif value > max_val:
            return {"is_abnormal": True, "status": "high", "unit": unit,
                    "min": min_val, "max": max_val}
        else:
            return {"is_abnormal": False, "status": "normal", "unit": unit}

    def _get_severity(self, test_name: str, value: float, result: Dict, gender: str) -> str:
        """Determine severity of abnormal value"""
        status = result["status"]
        min_val = result.get("min", 0)
        max_val = result.get("max", 999999)

        if status == "low" and min_val > 0:
            deviation = (min_val - value) / min_val
        elif status == "high":
            deviation = (value - max_val) / max_val
        else:
            return "mild"

        if deviation > 0.5:
            return "severe"
        elif deviation > 0.2:
            return "moderate"
        else:
            return "mild"

    def _get_normal_range_str(self, test_name: str, gender: str) -> str:
        """Get formatted normal range string"""
        if test_name not in self.reference_ranges:
            return "Not available"

        ranges = self.reference_ranges[test_name]
        ref = ranges.get(gender) or ranges.get("all", {})
        if not ref:
            return "Not available"

        unit = ref.get("unit", "")
        return f"{ref['min']} - {ref['max']} {unit}".strip()

    def _compute_risk_level(self, abnormal_values: List[Dict]) -> str:
        """Compute overall risk level"""
        if not abnormal_values:
            return "LOW"

        # Count critical test abnormalities
        critical_abnormal = sum(
            1 for v in abnormal_values
            if v["test"] in self.critical_tests
        )

        severe_count = sum(1 for v in abnormal_values if v.get("severity") == "severe")
        total_abnormal = len(abnormal_values)

        if severe_count >= 2 or critical_abnormal >= 2 or total_abnormal >= 4:
            return "HIGH"
        elif severe_count >= 1 or critical_abnormal >= 1 or total_abnormal >= 2:
            return "MEDIUM"
        else:
            return "LOW"
