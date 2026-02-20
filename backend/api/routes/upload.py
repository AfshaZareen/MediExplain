"""
Upload Route - Handles medical report file uploads
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil
from datetime import datetime

from api.models.schemas import ReportUploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/report", response_model=ReportUploadResponse)
async def upload_report(file: UploadFile = File(...)):
    """Upload a medical report (PDF, JPG, PNG)"""

    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file
    file_content = await file.read()

    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size: 10MB")

    # Generate unique ID and save file
    report_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_filename = f"{timestamp}_{report_id}{file_ext}"

    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    file_path = uploads_dir / saved_filename

    with open(file_path, "wb") as f:
        f.write(file_content)

    return ReportUploadResponse(
        report_id=report_id,
        file_path=str(file_path),
        file_name=file.filename,
        file_size=len(file_content),
        message="File uploaded successfully. Use /process/report/{report_id} to analyze."
    )
