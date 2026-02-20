import React, { useState, useCallback } from 'react';
import axios from 'axios';

// const API = 'http://localhost:8000';
const API_BASE_URL = process.env.REACT_APP_API_URL;
const LANG_LABELS = { en:'🇺🇸 English', hi:'🇮🇳 Hindi', bn:'Bengali', ta:'Tamil', te:'Telugu', mr:'Marathi' };
const RC = {
  HIGH:   { color:'#dc2626', bg:'#fef2f2',              border:'rgba(220,38,38,0.25)',  icon:'🔴', msg:'Please consult your doctor as soon as possible.' },
  MEDIUM: { color:'#d97706', bg:'#fffbeb',              border:'rgba(217,119,6,0.25)',  icon:'🟡', msg:'Schedule a doctor appointment this week.' },
  LOW:    { color:'#16a34a', bg:'rgba(34,197,94,0.07)', border:'rgba(34,197,94,0.25)',  icon:'🟢', msg:'Results look mostly normal. Keep up healthy habits!' },
  INFO:   { color:'#0d9488', bg:'rgba(13,148,136,0.06)',border:'rgba(13,148,136,0.22)', icon:'ℹ️', msg:'This is a clinical/consultation report. No lab values detected.' },
};

function saveToHistory(result, filename) {
  try {
    const existing = JSON.parse(localStorage.getItem('medi_reports') || '[]');
    existing.push({ ...result, date: new Date().toISOString(), filename: filename || 'report' });
    localStorage.setItem('medi_reports', JSON.stringify(existing));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export default function HomePage() {
  const [file, setFile]    = useState(null);
  const [drag, setDrag]    = useState(false);
  const [loading, setLoad] = useState(false);
  const [result, setResult]= useState(null);
  const [error, setError]  = useState('');
  const [info, setInfo]    = useState({ age:'', gender:'male', language:'en' });
  const [saved, setSaved]  = useState(false);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(''); setResult(null); setSaved(false); }
  }, []);

  const analyze = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setLoad(true); setError(''); setResult(null); setSaved(false);
    try {
      const fd = new FormData(); fd.append('file', file);
      const up = await axios.post(`${API}/upload/report`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      const pr = await axios.post(`${API}/process/report/${up.data.report_id}`, null, {
        params:{ file_path:up.data.file_path, patient_age:info.age||null, patient_gender:info.gender, language:info.language },
      });
      setResult(pr.data);
      saveToHistory(pr.data, file.name);
      setSaved(true);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to analyze. Make sure the backend is running on port 8000.');
    } finally { setLoad(false); }
  };

  const rc = result ? (RC[result.risk_level] || RC.INFO) : null;

  return (
    <div style={s.page}>
      <div style={s.hero} className="animate-up">
        <div className="section-label">Medical AI Analysis</div>
        <h1 style={s.h1}>Understand your report.<br/><span style={{color:"#15803d"}}>Plain and simple.</span></h1>
        <p style={s.sub}>Upload any lab report, prescription or clinical document — our AI reads it and explains what it means for you.</p>
      </div>

      <div style={s.grid}>
        <div style={s.infoCard} className="glass-card animate-up delay-1">
          <h3 style={s.cardH}>Patient Details <span style={{fontSize:12,color:'#6b8f77',fontWeight:400}}>(optional)</span></h3>
          <div style={s.fields}>
            <div>
              <label style={s.lbl}>Age</label>
              <input type="number" value={info.age} placeholder="e.g. 35" className="input-field" onChange={e=>setInfo({...info,age:e.target.value})}/>
            </div>
            <div>
              <label style={s.lbl}>Gender</label>
              <select value={info.gender} className="input-field" onChange={e=>setInfo({...info,gender:e.target.value})}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={s.lbl}>Output Language</label>
              <select value={info.language} className="input-field" onChange={e=>setInfo({...info,language:e.target.value})}>
                <option value="en">🇺🇸 English</option><option value="hi">🇮🇳 Hindi</option><option value="bn">Bengali</option>
                <option value="ta">Tamil</option><option value="te">Telugu</option><option value="mr">Marathi</option>
              </select>
            </div>
          </div>
          {info.language!=='en'&&(
            <div style={{background:'rgba(34,197,94,0.07)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#16a34a',marginBottom:14}}>
              🌐 Explanation will be in <strong>{LANG_LABELS[info.language]}</strong>
            </div>
          )}
          <div style={s.fmts}>
            <span style={s.fmtLbl}>Formats:</span>
            {['PDF','JPG','PNG','BMP'].map(f=><span key={f} style={s.fmtTag}>{f}</span>)}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{...s.drop,...(drag?s.dropA:{}),...(file?s.dropF:{})}} className="animate-up delay-2"
            onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
            onClick={()=>document.getElementById('fi').click()}>
            <input id="fi" type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp" style={{display:'none'}}
              onChange={e=>{setFile(e.target.files[0]);setError('');setResult(null);setSaved(false);}}/>
            {file?(
              <div style={{textAlign:'center',padding:32}}>
                <div style={{fontSize:48,marginBottom:12}}>{file.type.includes('pdf')?'📄':'🖼️'}</div>
                <div style={{fontSize:15,fontWeight:600,color:'#0f2e1a',marginBottom:4}}>{file.name}</div>
                <div style={{fontSize:13,color:'#6b8f77',marginBottom:8}}>{(file.size/1024).toFixed(1)} KB</div>
                <div style={{fontSize:12,color:'#9cb8a6'}}>Click to change file</div>
              </div>
            ):(
              <div style={{textAlign:'center',padding:32}}>
                <div style={{width:64,height:64,margin:'0 auto 16px',background:'rgba(34,197,94,0.08)',border:'1.5px dashed rgba(34,197,94,0.3)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',animation:'float 4s ease-in-out infinite'}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{fontSize:15,fontWeight:500,color:'#3a6047',marginBottom:8}}>Drop your medical report here</p>
                <p style={{fontSize:13,color:'#6b8f77'}}>or <span style={{color:'#16a34a',fontWeight:600}}>browse files</span> — PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
          {error&&<div style={s.errBox} className="animate-up">⚠️ {error}</div>}
          <button onClick={analyze} disabled={loading||!file} style={{...s.abtn,...((!file||loading)?{opacity:0.5,cursor:'not-allowed'}:{})}}>
            {loading?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}><span className="spinner"/>Analyzing your report...</span>:'🔍 Analyze Report'}
          </button>
          {saved&&<div style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.22)',borderRadius:10,padding:'10px 16px',fontSize:13,color:'#16a34a',textAlign:'center'}}>✅ Result saved to your Dashboard</div>}
        </div>
      </div>

      {result&&(
        <div style={s.results} className="animate-up">
          {result.language&&result.language!=='en'&&(
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'100px',padding:'6px 14px',fontSize:13,color:'#16a34a',fontWeight:600,marginBottom:16}}>
              🌐 {LANG_LABELS[result.language]||result.language}
            </div>
          )}
          <div style={{...s.rBanner,background:rc.bg,borderColor:rc.border}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <span style={{fontSize:28}}>{rc.icon}</span>
              <div>
                <div style={{fontSize:16,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',color:rc.color}}>{result.risk_level==='INFO'?'Clinical Report':`${result.risk_level} RISK`}</div>
                <div style={{fontSize:14,color:'#6b8f77',marginTop:3}}>{rc.msg}</div>
              </div>
            </div>
            <div style={{padding:'6px 16px',borderRadius:'100px',border:`1.5px solid ${rc.border}`,fontSize:13,fontWeight:700,color:rc.color,background:'#fff'}}>
              {result.abnormal_values?.length>0?`${result.abnormal_values.length} abnormal value(s)`:'No abnormal values'}
            </div>
          </div>

          {result.abnormal_values?.length>0&&(
            <div style={{marginBottom:24}}>
              <h3 style={s.sTitle}>⚠️ Values Outside Normal Range</h3>
              <div style={s.valGrid}>
                {result.abnormal_values.map((v,i)=>{
                  const col=v.status==='high'?'#dc2626':'#2563eb';
                  return (
                    <div key={i} style={{...s.valCard,border:`1.5px solid ${v.status==='high'?'rgba(220,38,38,0.15)':'rgba(37,99,235,0.15)'}`,background:v.status==='high'?'#fef2f2':'#eff6ff'}} className="glass-card">
                      <div style={{fontSize:12,fontWeight:600,color:'#6b8f77',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>{v.test}</div>
                      <div style={{fontSize:26,fontWeight:800,fontFamily:'Fraunces,serif',letterSpacing:'-1px',color:col,marginBottom:8}}>
                        {v.value}<span style={{fontSize:13,fontWeight:400,color:'#6b8f77'}}> {v.unit}</span>
                      </div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <span style={{...s.tag2,background:v.status==='high'?'rgba(220,38,38,0.12)':'rgba(37,99,235,0.12)',color:col}}>{v.status?.toUpperCase()}</span>
                        <span style={{...s.tag2,background:'#fffbeb',color:'#d97706'}}>{v.severity}</span>
                      </div>
                      <div style={{fontSize:11,color:'#9cb8a6',marginTop:8}}>Normal: {v.normal_range}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={s.twoCol}>
            <div className="glass-card" style={{padding:24}}>
              <h3 style={s.sTitle}>💡 Simplified Explanation</h3>
              <pre style={{fontFamily:'DM Sans,sans-serif',fontSize:14,lineHeight:1.9,color:'#374151',whiteSpace:'pre-wrap'}}>{result.simplified_explanation}</pre>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {result.recommendations?.length>0&&(
                <div className="glass-card" style={{padding:24}}>
                  <h3 style={s.sTitle}>✅ What To Do</h3>
                  {result.recommendations.map((r,i)=>(
                    <div key={i} style={s.recRow}><span style={{color:'#16a34a',fontWeight:700,minWidth:18}}>→</span><span style={{fontSize:14,color:'#374151',lineHeight:1.6}}>{r}</span></div>
                  ))}
                </div>
              )}
              {result.questions_to_ask_doctor?.length>0&&(
                <div className="glass-card" style={{padding:24}}>
                  <h3 style={s.sTitle}>❓ Ask Your Doctor</h3>
                  {result.questions_to_ask_doctor.map((q,i)=>(
                    <div key={i} style={s.recRow}><span style={{color:'#0d9488',fontWeight:700,minWidth:18}}>{i+1}.</span><span style={{fontSize:14,color:'#374151',lineHeight:1.6}}>{q}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={s.disc}>⚕️ <strong>Disclaimer:</strong> MediExplain AI is for educational purposes only. Always consult a qualified healthcare professional.</div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:    {padding:'88px 24px 60px',maxWidth:'1100px',margin:'0 auto'},
  hero:    {textAlign:'center',marginBottom:48},
  h1:      {fontFamily:'Fraunces,serif',fontSize:'clamp(34px,5vw,52px)',fontWeight:600,lineHeight:1.15,color:'#0f2e1a',letterSpacing:'-1.5px',marginBottom:16,marginTop:10},
  sub:     {fontSize:16,color:'#3a6047',maxWidth:520,margin:'0 auto',lineHeight:1.7},
  grid:    {display:'grid',gridTemplateColumns:'320px 1fr',gap:24,marginBottom:32},
  infoCard:{padding:28},
  cardH:   {fontFamily:'Fraunces,serif',fontSize:18,fontWeight:600,color:'#0f2e1a',marginBottom:20},
  fields:  {display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16},
  lbl:     {display:'block',fontSize:12,fontWeight:600,color:'#3a6047',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.5px'},
  fmts:    {display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'},
  fmtLbl:  {fontSize:11,color:'#6b8f77',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'},
  fmtTag:  {background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:5,padding:'3px 8px',fontSize:11,color:'#16a34a',fontWeight:600},
  drop:    {flex:1,minHeight:240,border:'2px dashed rgba(34,197,94,0.25)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.25s',background:'#fafffe'},
  dropA:   {borderColor:'#16a34a',background:'rgba(34,197,94,0.05)',transform:'scale(1.01)'},
  dropF:   {borderColor:'rgba(13,148,136,0.4)',background:'rgba(13,148,136,0.03)'},
  errBox:  {background:'#fef2f2',border:'1px solid rgba(220,38,38,0.25)',borderRadius:10,padding:'12px 16px',color:'#dc2626',fontSize:14},
  abtn:    {width:'100%',padding:'15px',background:'linear-gradient(135deg,#16a34a,#0d9488)',color:'#fff',border:'none',borderRadius:14,fontFamily:'DM Sans,sans-serif',fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.2s',boxShadow:'0 4px 14px rgba(22,163,74,0.25)'},
  results: {marginTop:40},
  rBanner: {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 28px',border:'1.5px solid',borderRadius:16,marginBottom:28},
  sTitle:  {fontFamily:'Fraunces,serif',fontSize:18,fontWeight:600,color:'#0f2e1a',marginBottom:16},
  valGrid: {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14,marginBottom:0},
  valCard: {padding:18},
  tag2:    {padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:700},
  twoCol:  {display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24},
  recRow:  {display:'flex',gap:10,alignItems:'flex-start',paddingBottom:10,borderBottom:'1px solid rgba(34,197,94,0.1)',marginBottom:4},
  disc:    {background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.12)',borderRadius:12,padding:'14px 18px',fontSize:13,color:'#6b8f77',lineHeight:1.6},
};