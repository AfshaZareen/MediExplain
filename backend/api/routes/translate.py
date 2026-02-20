"""
Translate Route - Multilingual support for medical explanations
"""

from fastapi import APIRouter
from api.models.schemas import TranslateRequest, TranslateResponse
from services.translation_service import TranslationService

router = APIRouter()
translation_service = TranslationService()


@router.post("/", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """Translate medical explanation to another language"""

    translated = translation_service.translate(
        text=request.text,
        target_language=request.target_language,
        source_language=request.source_language
    )

    return TranslateResponse(
        original_text=request.text,
        translated_text=translated,
        source_language=request.source_language,
        target_language=request.target_language
    )


@router.get("/languages")
async def supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi"},
            {"code": "bn", "name": "Bengali"},
            {"code": "ta", "name": "Tamil"},
            {"code": "te", "name": "Telugu"},
            {"code": "mr", "name": "Marathi"},
        ]
    }
