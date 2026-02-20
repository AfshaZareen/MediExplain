"""
Translation Service - Multilingual support for medical explanations
Uses deep-translator (reliable) with graceful fallback.

Install: pip install deep-translator
"""

from typing import Dict, List


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
}


class TranslationService:
    def __init__(self):
        self._available = self._check_deep_translator()

    def _check_deep_translator(self) -> bool:
        try:
            from deep_translator import GoogleTranslator
            # Verify it actually works with a test call
            GoogleTranslator(source="en", target="hi").translate("hello")
            return True
        except Exception:
            return False

    def translate(self, text: str, target_language: str, source_language: str = "en") -> str:
        """Translate a single string. Returns original text if translation fails."""

        # Skip translation if same language or English target
        if not text or target_language == source_language or target_language == "en":
            return text

        # Skip unsupported languages
        if target_language not in LANGUAGE_NAMES:
            return text

        if self._available:
            try:
                from deep_translator import GoogleTranslator
                return GoogleTranslator(
                    source=source_language,
                    target=target_language
                ).translate(text)
            except Exception as e:
                print(f"[TranslationService] Error translating to '{target_language}': {e}")
                # Graceful fallback — never crash the app over a translation failure
                return text

        # deep-translator not installed
        lang_name = LANGUAGE_NAMES.get(target_language, target_language)
        return f"[Translation to {lang_name} unavailable — run: pip install deep-translator]\n\n{text}"

    def translate_list(self, items: List[str], target_language: str, source_language: str = "en") -> List[str]:
        """Translate a list of strings (e.g. recommendations, questions)."""
        return [self.translate(item, target_language, source_language) for item in items]

    def translate_report_output(self, result: dict, target_language: str) -> dict:
        """
        Translate all human-facing fields in a report analysis result.
        Medical values (numbers, units, reference ranges) are intentionally left untouched.
        """
        if target_language == "en" or target_language not in LANGUAGE_NAMES:
            return result

        # Translate the main explanation
        if result.get("simplified_explanation"):
            result["simplified_explanation"] = self.translate(
                result["simplified_explanation"], target_language
            )

        # Translate recommendation list
        if result.get("recommendations"):
            result["recommendations"] = self.translate_list(
                result["recommendations"], target_language
            )

        # Translate questions to ask the doctor
        if result.get("questions_to_ask_doctor"):
            result["questions_to_ask_doctor"] = self.translate_list(
                result["questions_to_ask_doctor"], target_language
            )

        # Translate human-readable labels inside abnormal values
        # (NOT the test name, value, unit, or range — those stay in English)
        for item in result.get("abnormal_values", []):
            if item.get("status"):
                item["status"] = self.translate(item["status"], target_language)
            if item.get("severity"):
                item["severity"] = self.translate(item["severity"], target_language)

        return result

    def get_supported_languages(self) -> Dict[str, str]:
        return LANGUAGE_NAMES
