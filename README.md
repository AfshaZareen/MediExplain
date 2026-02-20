🏥 MediExplain AI
AI-powered medical report analysis — in plain language, for everyone.

MediExplain AI helps patients and families understand their lab reports, prescriptions, and clinical documents without needing a medical degree. Upload a report, get a clear explanation in seconds.

✨ Features
📄 Smart OCR — Reads typed PDFs, scanned images, and clinical documents
🧠 Medical NER — Detects lab values, medications, diagnoses, and abnormalities automatically
⚠️ Risk Assessment — Compares values against gender-specific reference ranges and flags severity (LOW / MEDIUM / HIGH)
💬 Plain Language Explanations — Converts medical jargon into friendly, simple summaries
🌐 Multilingual — English, Hindi, Bengali, Tamil, Telugu, Marathi
📊 Health Dashboard — Tracks risk trends and value changes across multiple reports over time
📚 Knowledge Base — Look up 15+ lab tests and 10+ medications with detailed explanations
🔒 Private & Secure — Reports processed locally; no permanent storage without consent
🖥️ Tech Stack
Layer	Technology
Frontend	React 18, DM Sans + Fraunces fonts
Backend	FastAPI (Python)
OCR	Tesseract / PyMuPDF
AI / NLP	Custom Medical NER pipeline
Containerization	Docker
Reverse Proxy	Nginx
📁 Project Structure
MEDI/
├── backend/
│   ├── api/                  # FastAPI route handlers
│   ├── knowledge_base/       # Lab test & medication reference data
│   ├── services/             # OCR, NER, explanation services
│   ├── uploads/              # Uploaded report storage (temp)
│   ├── __init__.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run_simple.py         # App entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ReportUpload.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── KnowledgePage.jsx
│       │   ├── AboutPage.jsx
│       │   └── LoginPage.jsx
│       ├── App.js
│       └── index.js
├── nginx/                    # Nginx reverse proxy config
└── README.md
🚀 Getting Started
Prerequisites
Node.js 18+
Python 3.9+
pip
(Optional) Docker & Docker Compose
1. Clone the Repository
git clone https://github.com/your-username/mediexplain-ai.git
cd mediexplain-ai
2. Backend Setup
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn run_simple:app --reload --port 8000
Backend will be running at: http://localhost:8000

You can test it at: http://localhost:8000/docs (Swagger UI)

3. Frontend Setup
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
Frontend will be running at: http://localhost:3000

The frontend proxies API requests to http://localhost:8000 automatically (configured in package.json).

4. Docker Setup (Optional)
Run the full stack with Docker Compose:

docker-compose up --build
This starts:

Backend on port 8000
Frontend on port 3000
Nginx reverse proxy on port 80
🔌 API Endpoints
Method	Endpoint	Description
POST	/upload/report	Upload a medical report file
POST	/process/report/{report_id}	Analyze the uploaded report
GET	/knowledge/tests	List all lab tests
GET	/knowledge/test/{name}	Get details for a specific test
GET	/knowledge/medications	List all medications
GET	/knowledge/medication/{name}	Get details for a specific medication
Example: Analyze a Report
# Step 1: Upload
curl -X POST http://localhost:8000/upload/report \
  -F "file=@my_report.pdf"

# Step 2: Process
curl -X POST "http://localhost:8000/process/report/123?patient_age=35&patient_gender=male&language=en" \
  -d "file_path=/path/to/uploaded/file"
Example Response
{
  "risk_level": "MEDIUM",
  "abnormal_values": [
    {
      "test": "Hemoglobin",
      "value": "10.5",
      "unit": "g/dL",
      "status": "low",
      "severity": "Mild",
      "normal_range": "13.5–17.5 g/dL"
    }
  ],
  "simplified_explanation": "Your hemoglobin is slightly low, which means your blood may not be carrying enough oxygen...",
  "recommendations": ["Eat iron-rich foods like spinach and lentils", "Follow up with your doctor"],
  "questions_to_ask_doctor": ["Should I take iron supplements?", "Do I need further tests?"]
}
🌐 Supported Languages
Code	Language
en	English
hi	Hindi
bn	Bengali
ta	Tamil
te	Telugu
mr	Marathi
Pass the language parameter when processing a report to get explanations in that language.

🚢 Deployment
Recommended: Railway + Vercel (Free Tier)
Backend → Railway

Push code to GitHub
Go to railway.app → New Project → Deploy from GitHub
Select your repo, set root to backend/
Set start command:
uvicorn run_simple:app --host 0.0.0.0 --port $PORT
Copy your Railway URL (e.g. https://mediexplain.railway.app)
Frontend → Vercel

Go to vercel.com → New Project → Import repo
Set root directory to frontend/
Add environment variable:
REACT_APP_API_URL = https://mediexplain.railway.app
Build command: npm run build | Output: build
Deploy
Alternative: Docker + VPS
# On your VPS
git clone your-repo && cd backend
docker build -t mediexplain-backend .
docker run -d -p 8000:8000 mediexplain-backend

# Frontend
cd frontend && npm run build
# Serve build/ with nginx
⚙️ Environment Variables
Variable	Description	Default
REACT_APP_API_URL	Backend API base URL	http://localhost:8000
PORT	Backend server port	8000
⚕️ Disclaimer
MediExplain AI is an educational tool only. It does not provide medical diagnosis or treatment advice. Always consult a qualified healthcare professional for medical decisions.

📄 License
MIT License — feel free to use, modify, and distribute.

🤝 Contributing
Fork the repository
Create your feature branch: git checkout -b feature/my-feature
Commit your changes: git commit -m 'Add my feature'
Push to the branch: git push origin feature/my-feature
Open a Pull Request
Built with ❤️ for patients everywhere
