"""
Translation Service - Multilingual support for medical explanations
Uses Google Translate API (googletrans) as primary, with fallback dictionary
"""

from typing import Dict

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
        self._googletrans_available = self._check_googletrans()

    def _check_googletrans(self) -> bool:
        try:
            from googletrans import Translator
            return True
        except ImportError:
            return False

    def translate(self, text: str, target_language: str, source_language: str = "en") -> str:
        """Translate text to target language"""

        if target_language == source_language or target_language == "en":
            return text

        if self._googletrans_available:
            try:
                from googletrans import Translator
                translator = Translator()
                result = translator.translate(text, dest=target_language, src=source_language)
                return result.text
            except Exception as e:
                print(f"Translation error: {e}")

        # Fallback: return original with language note
        lang_name = LANGUAGE_NAMES.get(target_language, target_language)
        return f"[Translation to {lang_name} requires internet connection]\n\n{text}"

    def get_supported_languages(self) -> Dict[str, str]:
        return LANGUAGE_NAMES
