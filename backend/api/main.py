"""
MediExplain AI - FastAPI Main Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from api.routes import upload, process, knowledge, simplify, translate

app = FastAPI(
    title="MediExplain AI",
    description="Medical Report & Prescription Translator API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(process.router, prefix="/process", tags=["Process"])
app.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
app.include_router(simplify.router, prefix="/simplify", tags=["Simplify"])
app.include_router(translate.router, prefix="/translate", tags=["Translate"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to MediExplain AI API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MediExplain AI"}
