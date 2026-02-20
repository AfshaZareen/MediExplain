import React, { useState, useEffect } from 'react';

const rC  = { HIGH:'#dc2626', MEDIUM:'#d97706', LOW:'#16a34a', INFO:'#0d9488' };
const rBg = { HIGH:'#fef2f2', MEDIUM:'#fffbeb', LOW:'rgba(34,197,94,0.07)', INFO:'rgba(13,148,136,0.06)' };
const rBd = { HIGH:'rgba(220,38,38,0.2)', MEDIUM:'rgba(217,119,6,0.2)', LOW:'rgba(34,197,94,0.2)', INFO:'rgba(13,148,136,0.2)' };

const TIPS = [
  { i:'🥗', c:'Diet',      t:'Increase leafy vegetables — spinach, kale, and fenugreek help with low hemoglobin.', col:'#16a34a' },
  { i:'🏃', c:'Exercise',  t:'Walk 30 minutes daily — improves blood sugar and cholesterol simultaneously.',       col:'#0d9488' },
  { i:'💧', c:'Hydration', t:'Drink 8–10 glasses of water daily to support kidney function and circulation.',      col:'#2563eb' },
  { i:'😴', c:'Sleep',     t:'Poor sleep raises blood sugar. Aim for 7–8 hours of quality sleep every night.',     col:'#7c3aed' },
];

function loadReports() { try { return JSON.parse(localStorage.getItem('medi_reports')||'[]'); } catch { return []; } }
function getRiskOrder(r) { return {HIGH:3,MEDIUM:2,LOW:1,INFO:0}[r]??0; }
function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'}); } catch { return iso; } }
function buildStats(reports) {
  if(!reports.length) return null;
  const latest=reports[reports.length-1];
  const improved=reports.filter((r,i)=>i>0&&getRiskOrder(r.risk_level)<getRiskOrder(reports[i-1].risk_level)).length;
  const days=Math.max(1,Math.round((Date.now()-new Date(reports[0].date))/86400000));
  return {count:reports.length,currentRisk:latest.risk_level||'LOW',improved,days};
}
function buildTrends(reports) {
  const map={};
  reports.forEach(rep=>(rep.all_values||rep.abnormal_values||[]).forEach(v=>{
    if(!map[v.test]) map[v.test]={name:v.test,unit:v.unit||'',entries:[]};
    map[v.test].entries.push({date:rep.date,value:parseFloat(v.value)});
  }));
  return Object.values(map).filter(t=>t.entries.length>=2&&t.entries.every(e=>!isNaN(e.value))).slice(0,4)
    .map((t,i)=>({...t,vals:t.entries.map(e=>e.value),dates:t.entries.map(e=>fmtDate(e.date)),color:['#16a34a','#dc2626','#2563eb','#7c3aed'][i%4]}));
}
function progressMsg(reports) {
  if(reports.length<2) return null;
  const first=reports[0].risk_level, last=reports[reports.length-1].risk_level;
  if(getRiskOrder(last)<getRiskOrder(first)) return {txt:`Great progress! You've gone from ${first} to ${last} risk.`,type:'good'};
  if(getRiskOrder(last)>getRiskOrder(first)) return {txt:`Risk increased from ${first} to ${last}. Please consult a doctor.`,type:'warn'};
  return {txt:`Risk level has stayed at ${last} across ${reports.length} reports.`,type:'info'};
}

export default function DashboardPage() {
  const [reports,setReports]=useState([]);
  useEffect(()=>{
    setReports(loadReports());
    const fn=()=>setReports(loadReports());
    window.addEventListener('storage',fn);
    return ()=>window.removeEventListener('storage',fn);
  },[]);

  const stats=buildStats(reports), trends=buildTrends(reports), prog=progressMsg(reports);

  if(!reports.length) return (
    <div style={s.page}>
      <div style={s.hero}>
        <div className="section-label">Health Dashboard</div>
        <h1 style={s.h1}>Your health over time</h1>
        <p style={s.sub}>Track your progress as you upload reports</p>
      </div>
      <div className="glass-card animate-up delay-1" style={{padding:60,textAlign:'center',marginBottom:20}}>
        <div style={{fontSize:64,marginBottom:20,opacity:0.3}}>📊</div>
        <h3 style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:600,color:'#0f2e1a',marginBottom:12}}>No reports yet</h3>
        <p style={{color:'#6b8f77',fontSize:15,lineHeight:1.7,maxWidth:400,margin:'0 auto'}}>
          Upload your first medical report on the <strong style={{color:'#16a34a'}}>Analyze</strong> page.
          Your history, risk trends, and insights will appear here automatically.
        </p>
      </div>
      <TipsSection/>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div className="section-label">Health Dashboard</div>
        <h1 style={s.h1}>Your health over time</h1>
        <p style={s.sub}>Track your progress and see how your values have changed</p>
      </div>

      <div style={s.statsRow} className="">
        {[
          {l:'Reports Analyzed',v:String(stats.count),   i:'📄',c:'#16a34a',bg:'rgba(34,197,94,0.07)',bd:'rgba(34,197,94,0.18)'},
          {l:'Current Risk',    v:stats.currentRisk,     i:stats.currentRisk==='LOW'?'🟢':stats.currentRisk==='MEDIUM'?'🟡':'🔴',c:rC[stats.currentRisk],bg:rBg[stats.currentRisk],bd:rBd[stats.currentRisk]},
          {l:'Risk Improvements',v:String(stats.improved),i:'📈',c:'#0d9488',bg:'rgba(13,148,136,0.07)',bd:'rgba(13,148,136,0.18)'},
          {l:'Days Tracked',   v:String(stats.days),    i:'📅',c:'#7c3aed',bg:'rgba(124,58,237,0.07)',bd:'rgba(124,58,237,0.18)'},
        ].map((x,i)=>(
          <div key={i} style={{padding:'24px 20px',textAlign:'center',background:x.bg,border:`1px solid ${x.bd}`,borderRadius:20,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:26,marginBottom:10}}>{x.i}</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:700,color:x.c,letterSpacing:'-0.5px',marginBottom:6}}>{x.v}</div>
            <div style={{fontSize:12,color:'#6b8f77',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{x.l}</div>
          </div>
        ))}
      </div>

      <div className="glass-card animate-up delay-2" style={{padding:28,marginBottom:20}}>
        <h3 style={s.sT}>📋 Report History</h3>
        <div style={{display:'flex',gap:0,alignItems:'flex-start',overflowX:'auto',paddingBottom:8}}>
          {reports.map((r,i)=>{
            const risk=r.risk_level||'INFO';
            return (
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,minWidth:130,position:'relative'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:rC[risk]||'#0d9488',zIndex:1,marginBottom:10,flexShrink:0}}/>
                {i<reports.length-1&&<div style={{position:'absolute',top:6,left:'50%',width:'100%',height:2,background:'rgba(34,197,94,0.15)',zIndex:0}}/>}
                <div style={{borderRadius:12,padding:'12px 14px',textAlign:'center',width:'90%',background:rBg[risk]||rBg.INFO,border:`1px solid ${rBd[risk]||rBd.INFO}`}}>
                  <div style={{fontSize:11,color:'#6b8f77',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>{fmtDate(r.date)}</div>
                  <div style={{fontSize:13,fontWeight:800,letterSpacing:'0.5px',color:rC[risk]||'#0d9488',marginBottom:4}}>{risk}</div>
                  <div style={{fontSize:11,color:'#6b8f77'}}>{r.abnormal_values?.length||0} abnormal</div>
                </div>
              </div>
            );
          })}
        </div>
        {prog&&(
          <div style={{marginTop:16,padding:'12px 16px',background:prog.type==='good'?'rgba(34,197,94,0.07)':prog.type==='warn'?'#fffbeb':'rgba(13,148,136,0.06)',border:`1px solid ${prog.type==='good'?'rgba(34,197,94,0.2)':prog.type==='warn'?'rgba(217,119,6,0.2)':'rgba(13,148,136,0.2)'}`,borderRadius:10,fontSize:14,color:prog.type==='good'?'#16a34a':prog.type==='warn'?'#d97706':'#0d9488'}}>
            {prog.type==='good'?'✅ ':prog.type==='warn'?'⚠️ ':'ℹ️ '}{prog.txt}
          </div>
        )}
      </div>

      {trends.length>0?(
        <div className="glass-card animate-up delay-3" style={{padding:28,marginBottom:20}}>
          <h3 style={s.sT}>📉 Value Trends</h3>
          <div style={{display:'flex',flexDirection:'column',gap:32}}>
            {trends.map((t,ti)=>{
              const max=Math.max(...t.vals)*1.15||1;
              return (
                <div key={ti}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <span style={{fontSize:14,fontWeight:700,color:t.color}}>{t.name}</span>
                    <span style={{fontSize:12,color:'#6b8f77'}}>{t.unit}</span>
                  </div>
                  <div style={{display:'flex',gap:12,alignItems:'flex-end',height:100}}>
                    {t.vals.map((v,i)=>(
                      <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#6b8f77'}}>{v}</div>
                        <div style={{height:`${Math.max(8,(v/max)*80)}px`,background:`linear-gradient(to top,${t.color},${t.color}55)`,borderRadius:'6px 6px 0 0',minWidth:36,transition:'height 0.8s ease'}}/>
                        <div style={{fontSize:10,color:'#9cb8a6',fontWeight:600,textAlign:'center'}}>{t.dates[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):reports.length>=2&&(
        <div className="glass-card animate-up delay-3" style={{padding:28,marginBottom:20,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12,opacity:0.3}}>📉</div>
          <p style={{color:'#6b8f77',fontSize:14}}>Value trends will appear when the same tests appear in multiple reports.</p>
        </div>
      )}

      {reports[reports.length-1]?.abnormal_values?.length>0&&(
        <div className="glass-card animate-up delay-3" style={{padding:28,marginBottom:20}}>
          <h3 style={s.sT}>⚠️ Latest Abnormal Values</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:14}}>
            {reports[reports.length-1].abnormal_values.map((v,i)=>{
              const col=v.status==='high'?'#dc2626':'#2563eb';
              return (
                <div key={i} style={{background:v.status==='high'?'#fef2f2':'#eff6ff',border:`1.5px solid ${v.status==='high'?'rgba(220,38,38,0.2)':'rgba(37,99,235,0.2)'}`,borderRadius:12,padding:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#6b8f77',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>{v.test}</div>
                  <div style={{fontSize:24,fontWeight:800,fontFamily:'Fraunces,serif',color:col,marginBottom:6}}>
                    {v.value}<span style={{fontSize:12,fontWeight:400,color:'#6b8f77'}}> {v.unit}</span>
                  </div>
                  <div style={{fontSize:11,background:'#fff',color:col,padding:'3px 8px',borderRadius:6,display:'inline-block',fontWeight:700,marginBottom:4,border:`1px solid ${col}30`}}>{v.status?.toUpperCase()} · {v.severity}</div>
                  <div style={{fontSize:11,color:'#9cb8a6',marginTop:4}}>Normal: {v.normal_range}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TipsSection/>
      <div style={{textAlign:'center',color:'#9cb8a6',fontSize:13,padding:8}}>
        {reports.length} report{reports.length!==1?'s':''} analyzed · Data stored locally in your browser
      </div>
    </div>
  );
}

function TipsSection() {
  return (
    <div className="glass-card animate-up delay-4" style={{padding:28,marginBottom:20}}>
      <h3 style={s.sT}>💡 General Health Tips</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {TIPS.map((t,i)=>(
          <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',background:`${t.col}07`,border:`1px solid ${t.col}20`,borderRadius:12,padding:16}}>
            <div style={{width:40,height:40,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,background:`${t.col}12`,border:`1px solid ${t.col}22`,flexShrink:0}}>{t.i}</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:t.col,marginBottom:4}}>{t.c}</div>
              <div style={{fontSize:13,color:'#3a6047',lineHeight:1.6}}>{t.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page:     {padding:'88px 24px 60px',maxWidth:'1100px',margin:'0 auto'},
  hero:     {textAlign:'center',marginBottom:40},
  h1:       {fontFamily:'Fraunces,serif',fontSize:'clamp(30px,4vw,44px)',fontWeight:600,color:'#0f2e1a',letterSpacing:'-1px',marginBottom:12,marginTop:8},
  sub:      {fontSize:16,color:'#3a6047'},
  statsRow: {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24},
  sT:       {fontFamily:'Fraunces,serif',fontSize:20,fontWeight:600,color:'#0f2e1a',marginBottom:24},
};