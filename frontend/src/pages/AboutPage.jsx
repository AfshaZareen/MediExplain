import React, { useState } from 'react';

const stats=[
  {v:'15+',l:'Lab Tests',  i:'🧪',c:'#16a34a'},
  {v:'10+',l:'Medications',i:'💊',c:'#0d9488'},
  {v:'6',  l:'Languages',  i:'🌐',c:'#7c3aed'},
  {v:'90%',l:'OCR Accuracy',i:'🎯',c:'#d97706'},
];
const features=[
  {i:'📄',t:'Smart OCR',       d:'Reads typed PDFs, scanned images, and clinical documents with high accuracy.',c:'#16a34a'},
  {i:'🧠',t:'Medical NER',     d:'Detects lab values, medications, diagnoses, and abnormalities automatically.', c:'#0d9488'},
  {i:'⚠️',t:'Risk Assessment', d:'Compares values against gender-specific reference ranges and flags severity.',  c:'#d97706'},
  {i:'💬',t:'Plain Language',  d:'Converts medical jargon into simple, friendly explanations for any patient.',   c:'#7c3aed'},
  {i:'🌐',t:'Multilingual',    d:'Supports English, Hindi, Bengali, Tamil, Telugu, and Marathi.',                 c:'#2563eb'},
  {i:'🔒',t:'Private & Secure',d:'Reports are processed locally. No data is stored permanently without consent.', c:'#dc2626'},
];
const team=[
  {n:'Dr. Mehak Sharma',r:'Medical Advisor & Lead',e:'👩‍⚕️',bg:'linear-gradient(135deg,#16a34a,#0d9488)'},
  {n:'AI Research Team', r:'NLP & Machine Learning', e:'🤖',bg:'linear-gradient(135deg,#7c3aed,#2563eb)'},
  {n:'Clinical Team',    r:'Medical Validation',     e:'🏥',bg:'linear-gradient(135deg,#d97706,#dc2626)'},
  {n:'Dev Team',         r:'Engineering & Design',   e:'💻',bg:'linear-gradient(135deg,#0d9488,#16a34a)'},
];
const faqs=[
  {q:'Is MediExplain AI a replacement for a doctor?',a:'No. It is an educational tool that helps you understand your reports. It does not provide medical diagnosis or treatment. Always consult a qualified healthcare professional.'},
  {q:'What types of reports does it support?',a:'Lab test reports (CBC, LFT, KFT, lipid profile, diabetes panel, thyroid), clinical consultation letters, discharge summaries, and prescriptions in PDF, JPG, and PNG format.'},
  {q:'Is my medical data safe?',a:'Yes. Reports are processed in real-time and not stored permanently. We do not share your data with third parties. All connections are encrypted.'},
  {q:'What if OCR misreads my report?',a:'Upload high-resolution, clear images for best accuracy. The app shows the extracted text so you can verify what was read from your document.'},
  {q:'Can I use it for family members?',a:'Yes! You can analyze reports for any family member. Just enter the correct age and gender for accurate reference range comparisons.'},
];

export default function AboutPage() {
  const [openFaq,setFaq]=useState(null);
  const div=<div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(34,197,94,0.2),transparent)',margin:'48px 0'}}/>;

  return (
    <div style={s.page}>
      <div style={s.hero} className="animate-up">
        <div className="section-label">About MediExplain AI</div>
        <h1 style={s.h1}>Making healthcare<br/><span style={{background:"linear-gradient(135deg,#15803d,#0d9488)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",display:"inline-block"}}>understandable for all</span></h1>
        <p style={s.sub}>Built for patients and families who deserve to understand what their medical reports actually say — without needing a medical degree.</p>
      </div>

      <div style={s.statsGrid} className="animate-up delay-1">
        {stats.map((x,i)=>(
          <div key={i} style={{padding:'28px 20px',textAlign:'center',background:`${x.c}08`,border:`1px solid ${x.c}20`,borderRadius:20,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:28,marginBottom:10}}>{x.i}</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:36,fontWeight:700,color:x.c,letterSpacing:'-1px',marginBottom:6}}>{x.v}</div>
            <div style={{fontSize:13,color:'#6b8f77',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{x.l}</div>
          </div>
        ))}
      </div>

      {div}

      <div style={s.mission} className="animate-up">
        <div>
          <div className="section-label">Our Mission</div>
          <h2 style={s.mH}>No patient should leave a clinic confused about their own health.</h2>
          <p style={s.mP}>In India and across the world, millions of patients receive lab reports filled with abbreviations and clinical terms they don't understand. They either panic needlessly or miss important warning signs.</p>
          <p style={s.mP}>MediExplain AI bridges this gap — translating complex medical language into plain, compassionate explanations that empower patients to have informed conversations with their doctors.</p>
        </div>
        <div>
          <div className="glass-card" style={{padding:20,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:'#dc2626',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Before MediExplain</div>
            <code style={{fontSize:13,lineHeight:1.8,display:'block',color:'#374151'}}>
              SGPT (ALT): 75 U/L ↑<br/>Hemoglobin: 10.5 g/dL ↓<br/>FBS: 145 mg/dL ↑<br/>
              <span style={{color:'#9cb8a6'}}>...what does this mean? 😕</span>
            </code>
          </div>
          <div style={{textAlign:'center',fontSize:22,margin:'8px 0',color:'#16a34a'}}>↓</div>
          <div className="glass-card" style={{padding:20,border:'1px solid rgba(34,197,94,0.25)',background:'rgba(34,197,94,0.03)'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>After MediExplain</div>
            <p style={{color:'#374151',fontSize:13,lineHeight:1.8}}>
              <strong style={{color:'#d97706'}}>⚠️ Your liver enzyme is slightly elevated</strong><br/>
              This may be due to fatty liver or diet. Avoid alcohol and fried foods.<br/>
              <strong style={{color:'#dc2626'}}>📅 Book a doctor visit this week.</strong>
            </p>
          </div>
        </div>
      </div>

      {div}

      <div className="animate-up">
        <div style={{textAlign:'center',marginBottom:36}}>
          <div className="section-label">How It Works</div>
          <h2 style={s.secH}>Powered by AI, built for humans</h2>
        </div>
        <div style={s.featGrid}>
          {features.map((f,i)=>(
            <div key={i} style={{padding:24,background:`${f.c}06`,border:`1px solid ${f.c}18`,borderRadius:20,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}} className={`animate-up delay-${(i%4)+1}`}>
              <div style={{width:48,height:48,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:16,background:`${f.c}12`,border:`1px solid ${f.c}25`}}>{f.i}</div>
              <h4 style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:600,color:f.c,marginBottom:8}}>{f.t}</h4>
              <p style={{fontSize:14,color:'#3a6047',lineHeight:1.7}}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      {div}

      <div className="animate-up">
        <div style={{textAlign:'center',marginBottom:36}}>
          <div className="section-label">The Team</div>
          <h2 style={s.secH}>Built with care by experts</h2>
        </div>
        <div style={s.teamGrid}>
          {team.map((t,i)=>(
            <div key={i} style={{padding:'28px 20px'}} className="glass-card">
              <div style={{width:64,height:64,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 14px',background:t.bg}}>{t.e}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#0f2e1a',marginBottom:4,textAlign:'center'}}>{t.n}</div>
              <div style={{fontSize:13,color:'#6b8f77',textAlign:'center'}}>{t.r}</div>
            </div>
          ))}
        </div>
      </div>

      {div}

      <div className="animate-up">
        <div style={{textAlign:'center',marginBottom:36}}>
          <div className="section-label">FAQ</div>
          <h2 style={s.secH}>Frequently asked questions</h2>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {faqs.map((f,i)=>(
            <div key={i} className="glass-card" style={{padding:'20px 24px',cursor:'pointer',transition:'all 0.2s',...(openFaq===i?{borderColor:'rgba(34,197,94,0.3)',background:'rgba(34,197,94,0.02)'}:{})}} onClick={()=>setFaq(openFaq===i?null:i)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:15,fontWeight:600,color:'#0f2e1a',gap:16}}>
                <span>{f.q}</span>
                <span style={{color:'#16a34a',fontSize:16,transition:'transform 0.25s',transform:openFaq===i?'rotate(180deg)':'none',flexShrink:0}}>▾</span>
              </div>
              {openFaq===i&&<div className="animate-up" style={{marginTop:14,fontSize:14,color:'#3a6047',lineHeight:1.8,paddingTop:14,borderTop:'1px solid rgba(34,197,94,0.12)'}}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {div}

      <div className="glass-card animate-up" style={{textAlign:'center',padding:'56px 40px',background:'rgba(34,197,94,0.04)',border:'1px solid rgba(34,197,94,0.2)'}}>
        <h2 style={{fontFamily:'Fraunces,serif',fontSize:32,fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px',marginBottom:12}}>Ready to understand your health?</h2>
        <p style={{fontSize:16,color:'#3a6047',marginBottom:20}}>Upload your first medical report — it takes under 30 seconds.</p>
        <div style={{display:'inline-block',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:'100px',padding:'8px 20px',color:'#16a34a',fontSize:13,fontWeight:600}}>⚕️ Always free to try. No credit card required.</div>
      </div>
    </div>
  );
}

const s = {
  page:      {padding:'88px 24px 60px',maxWidth:'1100px',margin:'0 auto'},
  hero:      {textAlign:'center',marginBottom:56},
  h1:        {fontFamily:'Fraunces,serif',fontSize:'clamp(34px,5vw,52px)',fontWeight:600,color:'#0f2e1a',letterSpacing:'-1.5px',lineHeight:1.15,marginBottom:16,marginTop:10},
  sub:       {fontSize:17,color:'#3a6047',maxWidth:560,margin:'0 auto',lineHeight:1.7},
  statsGrid: {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:0},
  mission:   {display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'},
  mH:        {fontFamily:'Fraunces,serif',fontSize:28,fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px',lineHeight:1.25,marginBottom:20,marginTop:10},
  mP:        {fontSize:15,color:'#3a6047',lineHeight:1.8,marginBottom:16},
  secH:      {fontFamily:'Fraunces,serif',fontSize:32,fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px',marginTop:8},
  featGrid:  {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18},
  teamGrid:  {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16},
};