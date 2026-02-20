🏥 MediExplain AI
AI-powered medical report analysis — in plain language, for everyone.

🌟 The Problem We're Solving
Every year, millions of patients receive lab reports and medical documents they cannot understand. Medical jargon, confusing abbreviations, and lack of context create anxiety, misinformation, and delayed action — especially among low-literacy and non-English-speaking populations.

"Understanding your own health shouldn't require a medical degree."

MediExplain AI bridges this gap. Upload any medical report — get a clear, friendly, actionable explanation in seconds, in your own language.

💥 Impact
MetricSignificance🌍 6 Languages SupportedReaches Hindi, Bengali, Tamil, Telugu, Marathi & English speakers — covering 1.4B+ people⚠️ Automated Risk FlaggingInstantly highlights LOW / MEDIUM / HIGH risk values with gender-specific reference ranges📊 Trend TrackingHealth dashboard lets patients monitor changes over time and prepare for doctor visits🔒 Privacy FirstReports processed locally with no permanent storage without explicit consent🆓 Freely DeployableMIT licensed and built on open-source tools — deployable by clinics, NGOs, and health startups📱 Accessible UXDesigned for patients, not doctors — plain language, friendly tone, zero medical background needed
Who benefits most:

👴 Elderly patients overwhelmed by complex lab printouts
🌐 Non-English speakers in multilingual regions like India
👨‍👩‍👧 Families trying to understand a loved one's diagnosis
🏥 Clinics and NGOs in resource-limited settings


✨ Features
FeatureDescription📄 Smart OCRReads typed PDFs, scanned images, and clinical documents🧠 Medical NERDetects lab values, medications, diagnoses, and abnormalities automatically⚠️ Risk AssessmentCompares values against gender-specific reference ranges; flags severity as LOW / MEDIUM / HIGH💬 Plain Language ExplanationsConverts medical jargon into friendly, simple summaries with actionable advice🌐 Multilingual SupportEnglish, Hindi, Bengali, Tamil, Telugu, Marathi📊 Health DashboardTracks risk trends and value changes across multiple reports over time📚 Knowledge BaseDetailed explanations for 15+ lab tests and 10+ common medications🔒 Private & SecureNo permanent storage without consent; reports processed locally

🖥️ Tech Stack
LayerTechnologyFrontendReact 18, DM Sans + Fraunces fontsBackendFastAPI (Python)OCRTesseract / PyMuPDFAI / NLPCustom Medical NER pipelineContainerizationDockerReverse ProxyNginx

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
├── docker-compose.yml
└── README.md

🚀 Getting Started
Prerequisites

Node.js 18+
Python 3.9+
pip
(Optional) Docker & Docker Compose

1. Clone the Repository
bashgit clone https://github.com/your-username/mediexplain-ai.git
cd mediexplain-ai
2. Backend Setup
bashcd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn run_simple:app --reload --port 8000

Backend runs at: http://localhost:8000
Swagger UI available at: http://localhost:8000/docs

3. Frontend Setup
bashcd frontend

# Install dependencies
npm install

# Start the development server
npm start

Frontend runs at: http://localhost:3000
API requests are automatically proxied to http://localhost:8000 via package.json.

4. Docker Setup (Full Stack)
bashdocker-compose up --build
This starts:

✅ Backend on port 8000
✅ Frontend on port 3000
✅ Nginx reverse proxy on port 80


🔌 API Endpoints
MethodEndpointDescriptionPOST/upload/reportUpload a medical report filePOST/process/report/{report_id}Analyze the uploaded reportGET/knowledge/testsList all lab testsGET/knowledge/test/{name}Get details for a specific testGET/knowledge/medicationsList all medicationsGET/knowledge/medication/{name}Get details for a specific medication
Example: Analyze a Report
Step 1 — Upload the file:
bashcurl -X POST http://localhost:8000/upload/report \
  -F "file=@my_report.pdf"
Step 2 — Process the report:
bashcurl -X POST "http://localhost:8000/process/report/123?patient_age=35&patient_gender=male&language=en" \
  -d "file_path=/path/to/uploaded/file"
Example Response:
json{
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
  "recommendations": [
    "Eat iron-rich foods like spinach and lentils",
    "Follow up with your doctor"
  ],
  "questions_to_ask_doctor": [
    "Should I take iron supplements?",
    "Do I need further tests?"
  ]
}

🌐 Supported Languages
CodeLanguageenEnglishhiHindibnBengalitaTamilteTelugumrMarathi
Pass the language parameter when processing a report to receive explanations in that language.

🚢 Deployment
Recommended: Railway + Vercel (Free Tier)
Backend → Railway

Push code to GitHub
Go to railway.app → New Project → Deploy from GitHub
Select your repo, set root to backend/
Set start command: uvicorn run_simple:app --host 0.0.0.0 --port $PORT
Copy your Railway URL (e.g. https://mediexplain.railway.app)

Frontend → Vercel

Go to vercel.com → New Project → Import repo
Set root directory to frontend/
Add environment variable: REACT_APP_API_URL = https://mediexplain.railway.app
Build command: npm run build | Output: build

Alternative: Docker + VPS
bash# Backend
git clone your-repo && cd backend
docker build -t mediexplain-backend .
docker run -d -p 8000:8000 mediexplain-backend

# Frontend
cd frontend && npm run build
# Serve build/ with nginx

⚙️ Environment Variables
VariableDescriptionDefaultREACT_APP_API_URLBackend API base URLhttp://localhost:8000PORTBackend server port8000

🤝 Contributing
Contributions are what make open-source great! Here's how to get started:
bash# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'Add some amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
Ideas for contributions:

🌐 Add support for more languages
🧪 Expand the lab test knowledge base
🤖 Improve NER accuracy for more report types
📱 Build a React Native mobile app
🔐 Add authentication and user accounts


⚕️ Disclaimer

MediExplain AI is an educational tool only. It does not provide medical diagnosis or treatment advice. Always consult a qualified healthcare professional for medical decisions.


📄 License
Distributed under the MIT License. See LICENSE for more information. Feel free to use, modify, and distribute.


Built with ❤️ for patients everywhere
