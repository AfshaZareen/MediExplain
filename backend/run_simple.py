#!/usr/bin/env python3
"""
MediExplain AI - Simple Backend Runner
Run this file to start the backend server
"""

import subprocess
import sys
import os

def check_dependencies():
    missing = []
    required = ['fastapi', 'uvicorn', 'pytesseract', 'Pillow', 'PyPDF2']
    for pkg in required:
        try:
            __import__(pkg.lower().replace('-', '_'))
        except ImportError:
            missing.append(pkg)
    return missing

def main():
    print("=" * 60)
    print("MediExplain AI - Backend Server")
    print("=" * 60)

    # Check critical dependencies
    missing = check_dependencies()
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("Install them with: pip install -r requirements.txt\n")

    print("\nStarting server at http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop\n")

    # Set knowledge_base path
    os.environ.setdefault("KNOWLEDGE_BASE_DIR", "knowledge_base")

    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "api.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
    ])

if __name__ == "__main__":
    main()
