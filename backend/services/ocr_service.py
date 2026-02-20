"""
OCR Service - Extract text from medical reports (images and PDFs)
FIXED: No longer falls back to fake sample data.
If OCR fails, raises a clear error so the user knows what went wrong.
"""

import os
from pathlib import Path


class OCRService:
    def __init__(self):
        self._tesseract_available = self._check_tesseract()
        self._pdf2image_available = self._check_pdf2image()
        self._pillow_available = self._check_pillow()

        print(f"[OCR] Tesseract available: {self._tesseract_available}")
        print(f"[OCR] pdf2image available: {self._pdf2image_available}")
        print(f"[OCR] Pillow available:    {self._pillow_available}")

    def _check_tesseract(self) -> bool:
        try:
            import pytesseract
            if os.name == 'nt':
                pytesseract.pytesseract.tesseract_cmd = (
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                )
            pytesseract.get_tesseract_version()
            return True
        except Exception as e:
            print(f"[OCR] Tesseract not found: {e}")
            return False

    def _check_pdf2image(self) -> bool:
        try:
            import pdf2image
            return True
        except ImportError:
            return False

    def _check_pillow(self) -> bool:
        try:
            from PIL import Image
            return True
        except ImportError:
            return False

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from a medical report file.
        NEVER returns fake sample data - always reads the actual file.
        """
        path = Path(file_path)
        ext = path.suffix.lower()

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        print(f"[OCR] Processing: {file_path} (type: {ext})")

        if ext == ".pdf":
            text = self._extract_from_pdf(file_path)
        elif ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
            text = self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        if not text or len(text.strip()) < 10:
            raise RuntimeError(
                "Could not extract text from this file. "
                "Please ensure Tesseract OCR is installed: "
                "https://github.com/UB-Mannheim/tesseract/wiki"
            )

        print(f"[OCR] Successfully extracted {len(text)} characters")
        return text

    def _extract_from_pdf(self, file_path: str) -> str:
        text = self._try_pypdf2(file_path)
        if text and len(text.strip()) > 50:
            print("[OCR] PDF text extracted via PyPDF2")
            return text
        if self._pdf2image_available and self._tesseract_available:
            return self._pdf_ocr(file_path)
        if not self._tesseract_available:
            raise RuntimeError(
                "Tesseract OCR not installed. "
                "Download from: https://github.com/UB-Mannheim/tesseract/wiki"
            )
        return ""

    def _try_pypdf2(self, file_path: str) -> str:
        try:
            import PyPDF2
            text_parts = []
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except Exception as e:
            print(f"[OCR] PyPDF2 failed: {e}")
            return ""

    def _pdf_ocr(self, file_path: str) -> str:
        try:
            from pdf2image import convert_from_path
            import pytesseract
            pages = convert_from_path(file_path, dpi=300)
            text_parts = []
            for i, page in enumerate(pages):
                print(f"[OCR] Page {i+1}/{len(pages)}...")
                text_parts.append(pytesseract.image_to_string(page, lang='eng'))
            return "\n".join(text_parts)
        except Exception as e:
            print(f"[OCR] PDF OCR failed: {e}")
            return ""

    def _extract_from_image(self, file_path: str) -> str:
        if not self._pillow_available:
            raise RuntimeError("Pillow not installed. Run: pip install Pillow")
        if not self._tesseract_available:
            raise RuntimeError(
                "Tesseract OCR not installed.\n"
                "Windows: https://github.com/UB-Mannheim/tesseract/wiki\n"
                "Mac: brew install tesseract\n"
                "Linux: sudo apt install tesseract-ocr"
            )
        try:
            import pytesseract
            from PIL import Image, ImageEnhance, ImageFilter

            if os.name == 'nt':
                pytesseract.pytesseract.tesseract_cmd = (
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                )

            img = Image.open(file_path)
            img = self._preprocess_image(img)
            text = pytesseract.image_to_string(img, lang='eng')
            return text
        except Exception as e:
            raise RuntimeError(f"OCR failed on image: {str(e)}")

    def _preprocess_image(self, img):
        """Enhance image for better OCR accuracy"""
        from PIL import ImageEnhance, ImageFilter
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        img = img.convert('L')                          # Grayscale
        img = ImageEnhance.Contrast(img).enhance(2.0)  # Boost contrast
        img = img.filter(ImageFilter.SHARPEN)           # Sharpen edges
        return img
