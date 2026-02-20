import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const set = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async e => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    const user = { name: form.name || form.email.split('@')[0], email: form.email };
    localStorage.setItem('medi_user', JSON.stringify(user));
    onLogin(user);
  };

  const demoLogin = () => {
    const user = { name: 'Demo User', email: 'demo@mediexplain.ai' };
    localStorage.setItem('medi_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={s.root}>
      {/* Subtle dot grid background */}
      <div style={s.dotGrid}/>
      {/* Green glow blobs */}
      <div style={{...s.blob, top:'5%',  left:'5%',  width:480, height:480, background:'radial-gradient(circle,rgba(34,197,94,0.10) 0%,transparent 70%)'}}/>
      <div style={{...s.blob, bottom:'5%',right:'5%', width:560, height:560, background:'radial-gradient(circle,rgba(13,148,136,0.08) 0%,transparent 70%)'}}/>

      <div style={s.wrap}>
        {/* ── Left branding ── */}
        <div style={s.left} className="animate-up">
          {/* Logo */}
          <div style={s.logo}>
            <div style={s.logoBox}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" stroke="#16a34a" strokeWidth="1.5" fill="rgba(34,197,94,0.15)"/>
                <path d="M14 10V18M10 14H18" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={s.logoTxt}>Medi<span style={{color:'#16a34a'}}>Explain</span><span style={s.aiBadge}>AI</span></span>
          </div>

          <div style={{marginTop:48}}>
            <p style={s.tag}>Your health,</p>
            <p style={{...s.tag, fontStyle:'italic', color:'#16a34a'}}>finally explained.</p>
          </div>
          <p style={s.tagSub}>Upload any medical report and get a clear, human explanation — no medical degree required.</p>

          <div style={s.feats}>
            {[
              {i:'📄', t:'Reads lab reports, prescriptions & clinical notes'},
              {i:'🧠', t:'AI-powered plain language explanations'},
              {i:'⚠️', t:'Flags abnormal values with severity ratings'},
              {i:'🌐', t:'Supports English, Hindi, Bengali & more'},
            ].map((f,i)=>(
              <div key={i} style={s.feat} className={`animate-up delay-${i+1}`}>
                <span style={s.featI}>{f.i}</span>
                <span style={s.featT}>{f.t}</span>
              </div>
            ))}
          </div>

          {/* Before/After teaser */}
          <div style={s.teaser}>
            <div style={s.teaserBefore}>
              <div style={s.teaserLabel}>Before</div>
              <code style={{fontSize:12,color:'#dc2626',lineHeight:1.8,display:'block'}}>SGPT: 75 U/L ↑<br/>HGB: 10.5 g/dL ↓<br/><span style={{color:'#9ca3af'}}>...what does this mean? 😕</span></code>
            </div>
            <div style={{textAlign:'center',fontSize:20,color:'#16a34a',margin:'0 8px'}}>→</div>
            <div style={s.teaserAfter}>
              <div style={{...s.teaserLabel,color:'#16a34a'}}>After</div>
              <span style={{fontSize:12,color:'#374151',lineHeight:1.8,display:'block'}}>⚠️ Liver enzyme slightly high.<br/>✅ Avoid fried food & alcohol.<br/><strong style={{color:'#16a34a'}}>📅 See a doctor this week.</strong></span>
            </div>
          </div>

          <div style={s.disc}>⚕️ Educational tool — not a substitute for medical advice</div>
        </div>

        {/* ── Right form ── */}
        <div style={s.right}>
          <div style={s.card} className="animate-up delay-1">
            {/* Tabs */}
            <div style={s.tabs}>
              <button style={{...s.tab,...(mode==='login'?s.tabOn:{})}} onClick={()=>{setMode('login');setError('');}}>Sign In</button>
              <button style={{...s.tab,...(mode==='signup'?s.tabOn:{})}} onClick={()=>{setMode('signup');setError('');}}>Create Account</button>
            </div>

            <h2 style={s.ftitle}>{mode==='login'?'Welcome back 👋':'Get started free'}</h2>
            <p style={s.fsub}>{mode==='login'?'Sign in to access your reports':'Create your free account in seconds'}</p>

            <form onSubmit={submit} style={{marginTop:24}}>
              {mode==='signup' && (
                <div style={s.fg} className="animate-up">
                  <label style={s.lbl}>Full Name</label>
                  <input name="name" type="text" value={form.name} onChange={set} placeholder="Your Name" className="input-field"/>
                </div>
              )}
              <div style={s.fg}>
                <label style={s.lbl}>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={set} placeholder="you@example.com" className="input-field"/>
              </div>
              <div style={s.fg}>
                <label style={s.lbl}>Password</label>
                <div style={{position:'relative'}}>
                  <input name="password" type={showPw?'text':'password'} value={form.password} onChange={set} placeholder="••••••••" style={{paddingRight:48}} className="input-field"/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={s.eye}>{showPw?'🙈':'👁️'}</button>
                </div>
              </div>

              {error && <div style={s.err}><span>⚠️</span>{error}</div>}

              <button type="submit" disabled={loading} style={s.sbtn}>
                {loading
                  ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}><span className="spinner"/>{mode==='login'?'Signing in...':'Creating account...'}</span>
                  : (mode==='login'?'Sign In →':'Create Account →')}
              </button>
            </form>

            {mode==='login' && <p style={s.forgot}><span style={{color:'#16a34a',cursor:'pointer'}}>Forgot password?</span></p>}

            <div style={s.divRow}><div style={s.divLine}/><span style={s.divTxt}>or</span><div style={s.divLine}/></div>

            <button style={s.gbtn} onClick={demoLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google (Demo)
            </button>

            <p style={s.sw}>
              {mode==='login'?"Don't have an account? ":"Already have an account? "}
              <span style={{color:'#16a34a',cursor:'pointer',fontWeight:600}} onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');}}>
                {mode==='login'?'Sign up free':'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root:{ minHeight:'100vh',background:'#f5fdf7',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',position:'relative',overflow:'hidden' },
  dotGrid:{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(34,197,94,0.15) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none',opacity:0.7 },
  blob:{ position:'absolute',borderRadius:'50%',pointerEvents:'none' },
  wrap:{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'64px',maxWidth:'1020px',width:'100%',position:'relative',zIndex:1 },
  left:{ display:'flex',flexDirection:'column',justifyContent:'center' },
  logo:{ display:'flex',alignItems:'center',gap:'12px' },
  logoBox:{ width:48,height:48,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center' },
  logoTxt:{ fontFamily:'Fraunces,serif',fontSize:'22px',fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px' },
  aiBadge:{ background:'linear-gradient(135deg,#16a34a,#0d9488)',color:'#fff',fontSize:'10px',fontWeight:700,padding:'2px 6px',borderRadius:'5px',marginLeft:'6px',verticalAlign:'middle',fontFamily:'DM Sans,sans-serif',letterSpacing:'1px' },
  tag:{ fontFamily:'Fraunces,serif',fontSize:'48px',fontWeight:600,lineHeight:1.1,color:'#0f2e1a',letterSpacing:'-1.5px' },
  tagSub:{ marginTop:18,fontSize:'15px',color:'#3a6047',lineHeight:1.7,maxWidth:380 },
  feats:{ marginTop:32,display:'flex',flexDirection:'column',gap:12 },
  feat:{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.12)',borderRadius:10 },
  featI:{ fontSize:17,width:24,textAlign:'center' },
  featT:{ fontSize:'13px',color:'#3a6047',fontWeight:500 },
  teaser:{ marginTop:28,display:'flex',alignItems:'center',gap:0 },
  teaserBefore:{ flex:1,background:'#fff8f8',border:'1px solid rgba(220,38,38,0.15)',borderRadius:10,padding:'12px 14px' },
  teaserAfter:{ flex:1,background:'#f0fdf4',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:'12px 14px' },
  teaserLabel:{ fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#dc2626',marginBottom:6 },
  disc:{ marginTop:28,fontSize:'12px',color:'#6b8f77',padding:'10px 14px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.12)',borderRadius:'8px',maxWidth:380 },
  right:{ display:'flex',alignItems:'center',justifyContent:'center' },
  card:{ width:'100%',maxWidth:'420px',padding:'36px',background:'#fff',border:'1px solid rgba(34,197,94,0.15)',borderRadius:'24px',boxShadow:'0 8px 40px rgba(34,197,94,0.1)' },
  tabs:{ display:'flex',background:'#f0fdf4',borderRadius:'10px',padding:'4px',marginBottom:24 },
  tab:{ flex:1,padding:'9px',background:'transparent',border:'none',borderRadius:'8px',color:'#6b8f77',fontFamily:'DM Sans,sans-serif',fontSize:'14px',fontWeight:500,cursor:'pointer',transition:'all 0.2s' },
  tabOn:{ background:'#fff',color:'#16a34a',fontWeight:700,boxShadow:'0 1px 4px rgba(34,197,94,0.15)' },
  ftitle:{ fontFamily:'Fraunces,serif',fontSize:'26px',fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.5px' },
  fsub:{ marginTop:6,fontSize:'14px',color:'#6b8f77' },
  fg:{ marginBottom:16 },
  lbl:{ display:'block',fontSize:'13px',fontWeight:500,color:'#3a6047',marginBottom:7,letterSpacing:'0.2px' },
  eye:{ position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px',padding:'4px' },
  err:{ background:'#fef2f2',border:'1px solid rgba(220,38,38,0.25)',borderRadius:'8px',padding:'10px 14px',color:'#dc2626',fontSize:'13px',marginBottom:14,display:'flex',gap:8,alignItems:'center' },
  sbtn:{ width:'100%',padding:'14px',background:'linear-gradient(135deg,#16a34a,#0d9488)',color:'#fff',border:'none',borderRadius:'12px',fontFamily:'DM Sans,sans-serif',fontSize:'15px',fontWeight:700,cursor:'pointer',transition:'all 0.2s',marginTop:4 },
  forgot:{ textAlign:'right',marginTop:10,fontSize:'13px' },
  divRow:{ display:'flex',alignItems:'center',gap:12,margin:'20px 0' },
  divLine:{ flex:1,height:'1px',background:'rgba(34,197,94,0.15)' },
  divTxt:{ fontSize:'12px',color:'#6b8f77' },
  gbtn:{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#f8fafb',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px',color:'#374151',fontFamily:'DM Sans,sans-serif',fontSize:'14px',fontWeight:500,cursor:'pointer',transition:'all 0.2s' },
  sw:{ textAlign:'center',marginTop:18,fontSize:'14px',color:'#6b8f77' },
};