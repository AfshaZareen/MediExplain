import React, { useState, useEffect } from 'react';
import axios from 'axios';

// const API = 'http://localhost:8000';
// const API_BASE_URL = process.env.REACT_APP_API_URL;
const FB_TESTS = ['Hemoglobin','WBC','RBC','FBS','HbA1c','SGPT','SGOT','Cholesterol','LDL','HDL','Triglycerides','Creatinine','TSH','Sodium','Potassium'];
const FB_MEDS  = ['Metformin','Aspirin','Atorvastatin','Lisinopril','Amlodipine','Omeprazole','Paracetamol','Insulin','Amoxicillin','Azithromycin'];

export default function KnowledgePage() {
  const [tab,setTab]=useState('tests');
  const [tests,setTests]=useState([]);
  const [meds,setMeds]=useState([]);
  const [sel,setSel]=useState(null);
  const [det,setDet]=useState(null);
  const [load,setLoad]=useState(false);
  const [search,setSearch]=useState('');

  useEffect(()=>{
    axios.get(`${process.env.REACT_APP_API_URL}/knowledge/tests`).then(r=>setTests(r.data.tests)).catch(()=>setTests(FB_TESTS));
    axios.get(`${process.env.REACT_APP_API_URL}/knowledge/medications`).then(r=>setMeds(r.data.medications)).catch(()=>setMeds(FB_MEDS));
  },[]);

  const loadDet=async name=>{
    setSel(name);setDet(null);setLoad(true);
    try {
      const ep=tab==='tests'?'test':'medication';
      const r=await axios.get(`${process.env.REACT_APP_API_URL}/knowledge/${ep}/${name}`);
      setDet(r.data);
    } catch{} finally{setLoad(false);}
  };

  const items=tab==='tests'?tests:meds;
  const filtered=items.filter(i=>i.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div className="section-label">Knowledge Base</div>
        <h1 style={s.h1}>Medical Reference Library</h1>
        <p style={s.sub}>Look up lab tests and medications in plain, understandable language</p>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:24}} className="">
        {[{id:'tests',l:'🧪 Lab Tests',n:tests.length},{id:'meds',l:'💊 Medications',n:meds.length}].map(t=>(
          <button key={t.id} style={{...s.tab,...(tab===t.id?s.tabOn:{})}} onClick={()=>{setTab(t.id);setSel(null);setDet(null);setSearch('');}}>
            {t.l} <span style={{...s.cnt,...(tab===t.id?{background:'rgba(22,163,74,0.15)',color:'#16a34a'}:{})}}>{t.n}</span>
          </button>
        ))}
      </div>

      <div style={s.layout} className="">
        <div className="glass-card" style={{padding:16,maxHeight:680,display:'flex',flexDirection:'column',gap:12}}>
          <input className="input-field" style={{fontSize:14}} placeholder={`Search ${tab==='tests'?'lab tests':'medications'}...`} value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{overflowY:'auto',flex:1}}>
            {filtered.length===0&&<div style={{textAlign:'center',color:'#6b8f77',fontSize:14,padding:'20px 0'}}>No results</div>}
            {filtered.map(name=>(
              <button key={name} onClick={()=>loadDet(name)} style={{...s.listItem,...(sel===name?s.listOn:{})}}>
                <span style={{fontSize:14,minWidth:20}}>{tab==='tests'?'🧬':'💊'}</span>
                <span>{name}</span>
                {sel===name&&<span style={{marginLeft:'auto',color:'#16a34a',fontWeight:700}}>→</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{padding:32,minHeight:500}}>
          {load&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300}}><div className="spinner"/><p style={{color:'#6b8f77',marginTop:12}}>Loading...</p></div>}

          {!load&&!sel&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,textAlign:'center'}}>
              <div style={{fontSize:56,marginBottom:20,opacity:0.25}}>{tab==='tests'?'🧪':'💊'}</div>
              <h3 style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:600,color:'#3a6047',marginBottom:10}}>Select a {tab==='tests'?'lab test':'medication'}</h3>
              <p style={{fontSize:14,color:'#6b8f77',maxWidth:300,lineHeight:1.6}}>Choose from the list to learn what it means in plain language</p>
            </div>
          )}

          {!load&&det&&tab==='tests'&&(
            <div className="">
              <div style={{display:'flex',gap:20,alignItems:'flex-start',marginBottom:20}}>
                <div style={{width:60,height:60,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>🧬</div>
                <div>
                  <h2 style={{fontFamily:'Fraunces,serif',fontSize:26,fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px',marginBottom:6}}>{det.name}</h2>
                  <p style={{fontSize:14,color:'#3a6047',lineHeight:1.7}}>{det.description}</p>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{g:'♂ Male',v:det.normal_range_male},{g:'♀ Female',v:det.normal_range_female}].map((r,i)=>(
                  <div key={i} style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:12,padding:16}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#6b8f77',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>{r.g} Normal Range</div>
                    <div style={{fontSize:18,fontWeight:700,color:'#16a34a',fontFamily:'Fraunces,serif'}}>{r.v}</div>
                  </div>
                ))}
              </div>
              {[
                {c:'rgba(220,38,38,0.2)',bg:'#fef2f2',col:'#dc2626',lbl:'📈 If Result is HIGH',txt:det.high_meaning},
                {c:'rgba(37,99,235,0.2)',bg:'#eff6ff',col:'#2563eb',lbl:'📉 If Result is LOW',txt:det.low_meaning},
              ].map((x,i)=>(
                <div key={i} style={{border:`1px solid ${x.c}`,background:x.bg,borderRadius:12,padding:16,marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:x.col,marginBottom:8}}>{x.lbl}</div>
                  <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{x.txt}</p>
                </div>
              ))}
            </div>
          )}

          {!load&&det&&tab==='meds'&&(
            <div className="">
              <div style={{display:'flex',gap:20,alignItems:'flex-start',marginBottom:20}}>
                <div style={{width:60,height:60,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>💊</div>
                <div>
                  <h2 style={{fontFamily:'Fraunces,serif',fontSize:26,fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px',marginBottom:8}}>{det.name}</h2>
                  <span style={{display:'inline-block',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:'100px',padding:'4px 12px',fontSize:12,color:'#16a34a',fontWeight:600}}>{det.category}</span>
                </div>
              </div>
              {[
                {c:'rgba(34,197,94,0.2)',bg:'rgba(34,197,94,0.06)',col:'#16a34a',lbl:'🎯 Purpose',txt:det.purpose},
                {c:'rgba(217,119,6,0.2)',bg:'#fffbeb',col:'#d97706',lbl:'⚠️ Side Effects',sideEffects:det.side_effects},
                {c:'rgba(124,58,237,0.2)',bg:'rgba(124,58,237,0.05)',col:'#7c3aed',lbl:'📋 Precautions',txt:det.precautions},
              ].map((x,i)=>(
                <div key={i} style={{border:`1px solid ${x.c}`,background:x.bg,borderRadius:12,padding:16,marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:x.col,marginBottom:8}}>{x.lbl}</div>
                  {x.sideEffects
                    ?<div style={{display:'flex',flexWrap:'wrap',gap:8}}>{x.sideEffects.map((se,j)=><span key={j} style={{background:'#fffbeb',border:'1px solid rgba(217,119,6,0.25)',borderRadius:6,padding:'4px 10px',fontSize:12,color:'#d97706'}}>{se}</span>)}</div>
                    :<p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{x.txt}</p>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:     {padding:'88px 24px 60px',maxWidth:'1100px',margin:'0 auto'},
  hero:     {textAlign:'center',marginBottom:40},
  h1:       {fontFamily:'Fraunces,serif',fontSize:'clamp(30px,4vw,44px)',fontWeight:600,color:'#0f2e1a',letterSpacing:'-1px',marginBottom:12,marginTop:8},
  sub:      {fontSize:16,color:'#3a6047',lineHeight:1.7},
  tab:      {display:'flex',alignItems:'center',gap:8,padding:'12px 24px',background:'#fff',border:'1px solid rgba(34,197,94,0.2)',borderRadius:12,color:'#6b8f77',fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer',transition:'all 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'},
  tabOn:    {background:'rgba(34,197,94,0.08)',borderColor:'rgba(34,197,94,0.35)',color:'#16a34a',fontWeight:600},
  cnt:      {background:'rgba(34,197,94,0.1)',color:'#16a34a',padding:'2px 8px',borderRadius:20,fontSize:12,fontWeight:700},
  layout:   {display:'grid',gridTemplateColumns:'280px 1fr',gap:20},
  listItem: {display:'flex',alignItems:'center',gap:10,width:'100%',padding:'11px 12px',background:'transparent',border:'none',borderRadius:10,color:'#3a6047',fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:500,cursor:'pointer',transition:'all 0.15s',textAlign:'left',marginBottom:2},
  listOn:   {background:'rgba(34,197,94,0.08)',color:'#16a34a',fontWeight:700},
};