"""
NER Service - Medical Named Entity Recognition
Extracts lab values, medications, diagnoses from medical text
"""

import re
from typing import Dict, List, Any


class NERService:
    def __init__(self):
        # Common lab test patterns with units
        self.lab_patterns = [
            # Pattern: Test Name: Value Unit
            r'(Hemoglobin|Hb|HGB)[:\s]+(\d+\.?\d*)\s*(g/dL|g/dl)?',
            r'(WBC|White Blood Cell|Leucocytes)[:\s]+(\d+[,.]?\d*)\s*(/cumm|/mm3|cells/cumm)?',
            r'(RBC|Red Blood Cell)[:\s]+(\d+\.?\d*)\s*(million/cumm|M/uL)?',
            r'(Platelet|PLT)[:\s]+(\d+[,.]?\d*)\s*(/cumm|thousand/cumm)?',
            r'(FBS|Fasting Blood Sugar|Fasting Glucose)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(HbA1c|Glycated Hemoglobin)[:\s]+(\d+\.?\d*)\s*(%)?',
            r'(SGPT|ALT|Alanine)[:\s]+(\d+\.?\d*)\s*(U/L|IU/L)?',
            r'(SGOT|AST|Aspartate)[:\s]+(\d+\.?\d*)\s*(U/L|IU/L)?',
            r'(Total Cholesterol|Cholesterol)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(LDL|LDL Cholesterol)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(HDL|HDL Cholesterol)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(Triglycerides|TG)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(Creatinine|Serum Creatinine)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(Urea|Blood Urea)[:\s]+(\d+\.?\d*)\s*(mg/dL|mg/dl)?',
            r'(TSH)[:\s]+(\d+\.?\d*)\s*(mIU/L|uIU/mL)?',
            r'(Sodium|Na\+?)[:\s]+(\d+\.?\d*)\s*(mEq/L|mmol/L)?',
            r'(Potassium|K\+?)[:\s]+(\d+\.?\d*)\s*(mEq/L|mmol/L)?',
        ]

        # Medication patterns
        self.medication_keywords = [
            'metformin', 'aspirin', 'atorvastatin', 'lisinopril', 'amlodipine',
            'omeprazole', 'pantoprazole', 'paracetamol', 'ibuprofen', 'amoxicillin',
            'azithromycin', 'ciprofloxacin', 'insulin', 'glipizide', 'ramipril',
            'telmisartan', 'losartan', 'enalapril', 'warfarin', 'clopidogrel',
        ]

        # Disease/diagnosis keywords
        self.disease_keywords = [
            'diabetes', 'hypertension', 'anemia', 'hepatitis', 'thyroid',
            'cholesterol', 'infection', 'inflammation', 'fatty liver',
            'kidney disease', 'heart disease', 'diabetes mellitus',
        ]

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract all medical entities from text"""
        return {
            "lab_values": self._extract_lab_values(text),
            "medications": self._extract_medications(text),
            "diagnoses": self._extract_diagnoses(text),
            "patient_info": self._extract_patient_info(text),
        }

    def _extract_lab_values(self, text: str) -> List[Dict]:
        """Extract lab test names and values"""
        lab_values = []
        seen_tests = set()

        for pattern in self.lab_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                test_name = groups[0].strip()
                value_str = groups[1].replace(',', '')
                unit = groups[2].strip() if len(groups) > 2 and groups[2] else ""

                # Normalize test name
                normalized = self._normalize_test_name(test_name)

                if normalized not in seen_tests:
                    try:
                        value = float(value_str)
                        lab_values.append({
                            "test": normalized,
                            "raw_name": test_name,
                            "value": value,
                            "unit": unit,
                        })
                        seen_tests.add(normalized)
                    except ValueError:
                        continue

        return lab_values

    def _normalize_test_name(self, name: str) -> str:
        """Normalize test name to standard format"""
        name_map = {
            'hb': 'Hemoglobin',
            'hgb': 'Hemoglobin',
            'hemoglobin': 'Hemoglobin',
            'wbc': 'WBC',
            'white blood cell': 'WBC',
            'leucocytes': 'WBC',
            'rbc': 'RBC',
            'red blood cell': 'RBC',
            'platelet': 'Platelet',
            'plt': 'Platelet',
            'fbs': 'FBS',
            'fasting blood sugar': 'FBS',
            'fasting glucose': 'FBS',
            'hba1c': 'HbA1c',
            'glycated hemoglobin': 'HbA1c',
            'sgpt': 'SGPT',
            'alt': 'SGPT',
            'alanine': 'SGPT',
            'sgot': 'SGOT',
            'ast': 'SGOT',
            'aspartate': 'SGOT',
            'total cholesterol': 'Cholesterol',
            'cholesterol': 'Cholesterol',
            'ldl': 'LDL',
            'ldl cholesterol': 'LDL',
            'hdl': 'HDL',
            'hdl cholesterol': 'HDL',
            'triglycerides': 'Triglycerides',
            'tg': 'Triglycerides',
            'creatinine': 'Creatinine',
            'serum creatinine': 'Creatinine',
            'urea': 'Urea',
            'blood urea': 'Urea',
            'tsh': 'TSH',
            'sodium': 'Sodium',
            'potassium': 'Potassium',
        }
        return name_map.get(name.lower().strip(), name.title())

    def _extract_medications(self, text: str) -> List[str]:
        """Extract medication names from text"""
        found = []
        text_lower = text.lower()
        for med in self.medication_keywords:
            if med in text_lower:
                found.append(med.title())
        return found

    def _extract_diagnoses(self, text: str) -> List[str]:
        """Extract diagnosis/condition mentions"""
        found = []
        text_lower = text.lower()
        for disease in self.disease_keywords:
            if disease in text_lower:
                found.append(disease.title())
        return found

    def _extract_patient_info(self, text: str) -> Dict:
        """Extract basic patient information"""
        info = {}

        # Extract age
        age_match = re.search(r'Age[:\s]+(\d+)', text, re.IGNORECASE)
        if age_match:
            info['age'] = int(age_match.group(1))

        # Extract gender
        if re.search(r'\b(male|man|mr\.?)\b', text, re.IGNORECASE):
            info['gender'] = 'male'
        elif re.search(r'\b(female|woman|mrs\.?|miss)\b', text, re.IGNORECASE):
            info['gender'] = 'female'

        # Extract date
        date_match = re.search(
            r'Date[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})',
            text, re.IGNORECASE
        )
        if date_match:
            info['report_date'] = date_match.group(1)

        return info
