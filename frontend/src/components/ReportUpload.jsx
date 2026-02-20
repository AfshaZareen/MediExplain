import React, { useState, useCallback } from 'react';
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const COLORS = {
  HIGH:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', badge: '#DC2626' },
  MEDIUM: { bg: '#FFFBEB', border: '#FCD34D', text: '#D97706', badge: '#D97706' },
  LOW:    { bg: '#F0FDF4', border: '#86EFAC', text: '#16A34A', badge: '#16A34A' },
  INFO:   { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', badge: '#2563EB' },
};

export default function ReportUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: 'male',
    language: 'en',
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setError(null); }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first'); return; }
    setLoading(true); setError(null); setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post(`${API_BASE_URL}/upload/report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { report_id, file_path } = uploadRes.data;
      const processRes = await axios.post(`${API_BASE_URL}/process/report/${report_id}`, null, {
        params: {
          file_path,
          patient_age: patientInfo.age || null,
          patient_gender: patientInfo.gender,
          language: patientInfo.language,
        },
      });
      setResult(processRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors = result ? COLORS[result.risk_level] || COLORS.LOW : null;

  return (
    <div>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Understand Your Medical Report</h1>
        <p style={s.heroSub}>Upload any lab report or prescription and get a simple, clear explanation in seconds.</p>
      </div>

      {/* Upload Card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>📤 Upload Your Report</h2>

        {/* Patient Info */}
        <div style={s.row3}>
          <div style={s.field}>
            <label style={s.label}>Age (optional)</label>
            <input type="number" style={s.input} placeholder="e.g. 45"
              value={patientInfo.age}
              onChange={e => setPatientInfo({ ...patientInfo, age: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Gender</label>
            <select style={s.input} value={patientInfo.gender}
              onChange={e => setPatientInfo({ ...patientInfo, gender: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Language</label>
            <select style={s.input} value={patientInfo.language}
              onChange={e => setPatientInfo({ ...patientInfo, language: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}) }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }} onChange={handleFileChange} />
          {file ? (
            <div>
              <div style={s.fileIcon}>📄</div>
              <p style={s.fileName}>{file.name}</p>
              <p style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <div style={s.uploadIcon}>⬆️</div>
              <p style={s.dropText}>Drop your file here or <span style={s.browse}>browse</span></p>
              <p style={s.dropHint}>Supports PDF, JPG, PNG (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          onClick={handleUpload} disabled={loading}>
          {loading ? (
            <span>⏳ Analyzing your report...</span>
          ) : (
            <span>🔍 Analyze Report</span>
          )}
        </button>

        {error && <div style={s.errorBox}><strong>Error:</strong> {error}</div>}
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Risk Badge */}
          <div style={{ ...s.riskCard, background: riskColors.bg, borderColor: riskColors.border }}>
            <div style={{ ...s.riskBadge, background: riskColors.badge }}>
              {result.risk_level} RISK
            </div>
            <p style={{ ...s.riskText, color: riskColors.text }}>
              {result.risk_level === 'HIGH'   && '⚠️ Please consult your doctor as soon as possible.'}
              {result.risk_level === 'MEDIUM' && '🟡 Schedule a doctor appointment within this week.'}
              {result.risk_level === 'LOW'    && '✅ Your results look mostly normal. Keep up the healthy habits!'}
              {result.risk_level === 'INFO'   && 'ℹ️ This is a clinical/consultation report. No lab values were detected.'}
            </p>
          </div>

          {/* Abnormal Values */}
          {result.abnormal_values?.length > 0 && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>⚠️ Values Outside Normal Range</h3>
              <div style={s.testGrid}>
                {result.abnormal_values.map((item, i) => (
                  <div key={i} style={s.testCard}>
                    <div style={s.testName}>{item.test}</div>
                    <div style={{ ...s.testValue, color: item.status === 'high' ? '#DC2626' : '#2563EB' }}>
                      {item.value} {item.unit}
                    </div>
                    <div style={{ ...s.testStatus, background: item.status === 'high' ? '#FEE2E2' : '#DBEAFE' }}>
                      {item.status.toUpperCase()} • {item.severity}
                    </div>
                    <div style={s.testRange}>Normal: {item.normal_range}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div style={s.card}>
            <h3 style={s.sectionTitle}>💡 Your Report Explained</h3>
            <div style={s.explanationBox}>
              <pre style={s.explanationText}>{result.simplified_explanation}</pre>
            </div>
          </div>

          {/* Two column: Recommendations + Questions */}
          <div style={s.row2}>
            {result.recommendations?.length > 0 && (
              <div style={s.card}>
                <h3 style={s.sectionTitle}>✅ Recommendations</h3>
                <ul style={s.list}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i} style={s.listItem}>
                      <span style={s.bullet}>→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.questions_to_ask_doctor?.length > 0 && (
              <div style={s.card}>
                <h3 style={s.sectionTitle}>❓ Questions to Ask Your Doctor</h3>
                <ol style={s.list}>
                  {result.questions_to_ask_doctor.map((q, i) => (
                    <li key={i} style={s.listItem}>
                      <span style={s.bulletNum}>{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={s.disclaimer}>
            <strong>⚠️ Disclaimer:</strong> This is an AI-generated explanation for educational purposes only.
            Always consult a qualified healthcare professional for medical diagnosis and treatment.
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  hero: {
    textAlign: 'center',
    padding: '2rem 0 1.5rem',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: '8px',
  },
  heroSub: {
    fontSize: '16px',
    color: '#6B7280',
    maxWidth: '500px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '20px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1F2937',
    outline: 'none',
    background: '#F9FAFB',
  },
  dropzone: {
    border: '2.5px dashed #C7D2FE',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '20px',
    background: '#F5F7FF',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    borderColor: '#4F46E5',
    background: '#EEF2FF',
  },
  uploadIcon: { fontSize: '36px', marginBottom: '12px' },
  fileIcon: { fontSize: '36px', marginBottom: '8px' },
  dropText: { fontSize: '16px', color: '#374151', marginBottom: '6px' },
  dropHint: { fontSize: '13px', color: '#9CA3AF' },
  browse: { color: '#4F46E5', fontWeight: '600', textDecoration: 'underline' },
  fileName: { fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' },
  fileSize: { fontSize: '13px', color: '#6B7280' },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDisabled: {
    background: '#9CA3AF',
    cursor: 'not-allowed',
  },
  errorBox: {
    marginTop: '16px',
    padding: '14px',
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: '10px',
    color: '#DC2626',
    fontSize: '14px',
  },
  riskCard: {
    padding: '24px',
    borderRadius: '16px',
    border: '2px solid',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  riskBadge: {
    padding: '8px 20px',
    borderRadius: '100px',
    color: 'white',
    fontWeight: '800',
    fontSize: '16px',
    whiteSpace: 'nowrap',
  },
  riskText: {
    fontSize: '16px',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '16px',
  },
  testGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  testCard: {
    border: '1.5px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    background: '#FAFAFA',
  },
  testName: { fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '6px' },
  testValue: { fontSize: '22px', fontWeight: '800', marginBottom: '8px' },
  testStatus: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  testRange: { fontSize: '11px', color: '#9CA3AF' },
  explanationBox: {
    background: '#F8FAFC',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
  },
  explanationText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#374151',
    whiteSpace: 'pre-wrap',
  },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #F3F4F6',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.5',
  },
  bullet: { color: '#4F46E5', fontWeight: '700', minWidth: '16px' },
  bulletNum: { color: '#4F46E5', fontWeight: '700', minWidth: '20px' },
  disclaimer: {
    background: '#F1F5F9',
    borderRadius: '12px',
    padding: '16px 20px',
    fontSize: '13px',
    color: '#64748B',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
};
