"""
Simplification Service - Convert medical jargon to plain language
Uses rule-based simplification + Claude API when available
"""

import os
from typing import Dict, List, Any, Optional


class SimplificationService:
    def __init__(self):
        self.medical_glossary = {
            # Common medical terms -> plain language
            "elevated": "higher than normal",
            "decreased": "lower than normal",
            "hepatic": "liver",
            "cardiac": "heart",
            "renal": "kidney",
            "pulmonary": "lung",
            "cerebral": "brain",
            "dysfunction": "not working properly",
            "hypertension": "high blood pressure",
            "hypotension": "low blood pressure",
            "hyperglycemia": "high blood sugar",
            "hypoglycemia": "low blood sugar",
            "tachycardia": "fast heartbeat",
            "bradycardia": "slow heartbeat",
            "inflammation": "swelling and irritation",
            "chronic": "long-term",
            "acute": "sudden and severe",
            "benign": "not cancerous",
            "malignant": "cancerous",
            "edema": "swelling caused by fluid",
            "dyspnea": "shortness of breath",
            "anemia": "low blood count",
            "leukocytosis": "high white blood cell count",
            "thrombocytopenia": "low platelet count",
            "hyperlipidemia": "high fat levels in blood",
            "hepatomegaly": "enlarged liver",
            "splenomegaly": "enlarged spleen",
        }

        self.test_explanations = {
            "Hemoglobin": {
                "what": "the protein in red blood cells that carries oxygen",
                "low": "your blood has less oxygen-carrying capacity than normal (anemia)",
                "high": "your blood has more oxygen-carrying capacity, could mean dehydration",
                "low_action": "Eat iron-rich foods (spinach, beans, red meat). See doctor for iron supplements.",
                "high_action": "Stay well hydrated. Doctor may check for other causes.",
            },
            "WBC": {
                "what": "white blood cells that fight infections and disease",
                "low": "your immune system may be weakened",
                "high": "your body is fighting an infection or inflammation",
                "low_action": "See doctor immediately. Avoid crowds and sick people.",
                "high_action": "See doctor to find and treat the underlying cause.",
            },
            "FBS": {
                "what": "your blood sugar level after not eating overnight",
                "low": "blood sugar is too low, can cause dizziness and weakness",
                "high": "blood sugar is higher than normal, may indicate pre-diabetes or diabetes",
                "low_action": "Eat something immediately. Discuss with doctor about meal timing.",
                "high_action": "Reduce sugary foods. Increase exercise. See doctor for diabetes evaluation.",
            },
            "HbA1c": {
                "what": "average blood sugar level over the past 2-3 months",
                "low": "blood sugar has been low, check for hypoglycemia risk",
                "high": "blood sugar has been high over past months, likely diabetes or pre-diabetes",
                "low_action": "Monitor blood sugar levels regularly.",
                "high_action": "This is important! See doctor for diabetes management plan.",
            },
            "SGPT": {
                "what": "a liver enzyme - high levels mean the liver is stressed or damaged",
                "low": "usually not a concern",
                "high": "liver is under stress, possibly from alcohol, medications, or fatty liver",
                "low_action": "No action needed.",
                "high_action": "Avoid alcohol completely. Reduce fatty foods. See doctor for liver evaluation.",
            },
            "SGOT": {
                "what": "a liver/heart enzyme that increases when these organs are stressed",
                "low": "usually not a concern",
                "high": "may indicate liver or heart stress",
                "low_action": "No action needed.",
                "high_action": "See doctor to determine the cause. Avoid alcohol.",
            },
            "Cholesterol": {
                "what": "total fat (cholesterol) in your blood",
                "low": "very low cholesterol is rare, discuss with doctor",
                "high": "too much fat in blood increases risk of heart attack and stroke",
                "low_action": "Discuss with doctor.",
                "high_action": "Reduce saturated fats, fried foods, and sweets. Exercise daily. See doctor.",
            },
            "LDL": {
                "what": "LDL (bad cholesterol) - builds up in arteries and increases heart risk",
                "low": "low LDL is generally good",
                "high": "bad cholesterol is too high, increasing heart disease risk",
                "low_action": "This is good! Maintain healthy lifestyle.",
                "high_action": "Reduce red meat, butter, and fried foods. Doctor may prescribe statins.",
            },
            "Creatinine": {
                "what": "waste product filtered by kidneys - high levels indicate kidney stress",
                "low": "usually not a concern",
                "high": "kidneys may not be filtering blood properly",
                "low_action": "No action needed.",
                "high_action": "Drink plenty of water. Avoid NSAIDs. See doctor urgently.",
            },
            "TSH": {
                "what": "thyroid stimulating hormone - controls your metabolism",
                "low": "thyroid is overactive (hyperthyroidism)",
                "high": "thyroid is underactive (hypothyroidism)",
                "low_action": "See doctor. May need thyroid medication adjustment.",
                "high_action": "See doctor. May need thyroid hormone replacement.",
            },
        }

    def simplify(
        self,
        extracted_text: str,
        entities: Dict,
        risk_result: Dict,
        patient_age: Optional[int] = None,
        patient_gender: str = "male"
    ) -> Dict[str, Any]:
        """Generate full simplified explanation of the report"""

        abnormal_values = risk_result.get("abnormal_values", [])
        risk_level = risk_result.get("risk_level", "LOW")
        total_tests = risk_result.get("total_tests", 0)
        normal_count = total_tests - len(abnormal_values)

        # Build explanation
        lines = []

        # Summary
        lines.append("=== YOUR MEDICAL REPORT SUMMARY ===\n")

        if not abnormal_values:
            lines.append("Good news! All your test results are within normal range.")
            lines.append("Continue maintaining a healthy lifestyle.\n")
        else:
            lines.append(f"Your report shows {len(abnormal_values)} value(s) outside the normal range.")
            if normal_count > 0:
                lines.append(f"{normal_count} other test(s) are normal.\n")

        lines.append(f"Overall Risk Level: {risk_level}\n")

        # Detailed abnormal explanations
        if abnormal_values:
            lines.append("=== WHAT'S DIFFERENT FROM NORMAL ===\n")
            for item in abnormal_values:
                test = item["test"]
                value = item["value"]
                status = item["status"]
                unit = item.get("unit", "")
                normal_range = item.get("normal_range", "")

                lines.append(f"▸ {test}: {value} {unit} — {status.upper()}")
                if normal_range:
                    lines.append(f"  Normal range: {normal_range}")

                if test in self.test_explanations:
                    info = self.test_explanations[test]
                    lines.append(f"  What is it: {info['what']}")
                    lines.append(f"  What it means: {info[status]}")
                    lines.append(f"  What to do: {info[f'{status}_action']}")
                lines.append("")

        # Recommendations
        recommendations = self._generate_recommendations(
            abnormal_values, risk_level, patient_age
        )

        # Questions
        questions = self._generate_questions(abnormal_values)

        return {
            "explanation": "\n".join(lines),
            "recommendations": recommendations,
            "questions": questions,
        }

    def simplify_text(self, text: str, language: str = "en") -> Dict:
        """Simplify a block of medical text"""
        result = text.lower()
        terms_found = []

        for medical, plain in self.medical_glossary.items():
            if medical in result:
                result = result.replace(medical, plain)
                terms_found.append(medical)

        return {
            "simplified": result,
            "terms_found": terms_found,
        }

    def _generate_recommendations(
        self,
        abnormal_values: List[Dict],
        risk_level: str,
        patient_age: Optional[int]
    ) -> List[str]:
        """Generate actionable recommendations"""
        recs = []

        # Urgency based on risk
        if risk_level == "HIGH":
            recs.append("⚠️  URGENT: Please consult your doctor as soon as possible")
        elif risk_level == "MEDIUM":
            recs.append("Schedule a doctor appointment within this week")
        else:
            recs.append("Discuss results at your next routine checkup")

        # Test-specific recommendations
        test_names = {v["test"] for v in abnormal_values}

        if "FBS" in test_names or "HbA1c" in test_names:
            recs.append("Reduce sugar, white rice, and refined carbohydrates in your diet")
            recs.append("Exercise at least 30 minutes per day, 5 days a week")

        if "Cholesterol" in test_names or "LDL" in test_names:
            recs.append("Avoid fried foods, red meat, and full-fat dairy products")
            recs.append("Increase fiber intake: oats, fruits, vegetables, and legumes")

        if "SGPT" in test_names or "SGOT" in test_names:
            recs.append("Avoid alcohol completely until liver values normalize")
            recs.append("Reduce fatty and processed foods")

        if "Hemoglobin" in test_names:
            recs.append("Eat iron-rich foods: spinach, lentils, beans, lean red meat")
            recs.append("Include Vitamin C to help iron absorption")

        if "Creatinine" in test_names:
            recs.append("Drink at least 8-10 glasses of water daily")
            recs.append("Avoid painkillers like ibuprofen without doctor advice")

        if "TSH" in test_names:
            recs.append("Take thyroid medication exactly as prescribed by your doctor")

        # Age-based recommendations
        if patient_age and patient_age > 40:
            recs.append("Consider getting a comprehensive health checkup every 6 months")

        recs.append("This report is for educational purposes only — always follow your doctor's advice")

        return recs

    def _generate_questions(self, abnormal_values: List[Dict]) -> List[str]:
        """Generate questions to ask the doctor"""
        questions = [
            "What is the main cause of my abnormal results?",
            "Do I need any additional tests or investigations?",
            "What treatment or medication do you recommend?",
            "How soon should I come back for a follow-up test?",
            "Are there specific foods or activities I should avoid?",
            "Should I be worried about any of these results?",
        ]

        test_names = {v["test"] for v in abnormal_values}

        if "FBS" in test_names or "HbA1c" in test_names:
            questions.append("Do I have diabetes or pre-diabetes? What are my next steps?")

        if "Cholesterol" in test_names or "LDL" in test_names:
            questions.append("What is my risk for heart disease based on these results?")

        if "SGPT" in test_names or "SGOT" in test_names:
            questions.append("Should I get an ultrasound of my liver?")

        if "Creatinine" in test_names:
            questions.append("Are my kidneys functioning properly? Do I need a kidney specialist?")

        return questions
