"""
Simplify Route - Convert medical jargon to plain language
"""

from fastapi import APIRouter
from api.models.schemas import SimplifyTextRequest, SimplifyTextResponse
from services.simplification_service import SimplificationService

router = APIRouter()
simplification_service = SimplificationService()


@router.post("/text", response_model=SimplifyTextResponse)
async def simplify_text(request: SimplifyTextRequest):
    """Simplify medical text into plain language"""

    result = simplification_service.simplify_text(
        text=request.text,
        language=request.language
    )

    return SimplifyTextResponse(
        original_text=request.text,
        simplified_text=result["simplified"],
        medical_terms_found=result["terms_found"],
        language=request.language
    )
