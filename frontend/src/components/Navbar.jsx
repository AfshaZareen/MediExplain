import React, { useState, useEffect } from 'react';

export default function Navbar({ currentPage, onNavigate, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { id:'home',      label:'Analyze',   icon:'🔬' },
    { id:'dashboard', label:'Dashboard', icon:'📊' },
    { id:'knowledge', label:'Knowledge', icon:'📚' },
    { id:'about',     label:'About',     icon:'💡' },
  ];

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.scrolled : {}) }}>
      {/* Logo */}
      <div style={s.logo} onClick={() => onNavigate('home')}>
        <div style={s.logoBox}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" stroke="#16a34a" strokeWidth="1.5" fill="rgba(34,197,94,0.12)"/>
            <path d="M14 10V18M10 14H18" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={s.logoText}>Medi<span style={{color:'#16a34a'}}>Explain</span><span style={s.aiBadge}>AI</span></span>
      </div>

      {/* Links */}
      <div style={s.links}>
        {links.map(l => (
          <button key={l.id} onClick={() => onNavigate(l.id)}
            style={{ ...s.link, ...(currentPage === l.id ? s.linkOn : {}) }}>
            <span>{l.icon}</span> {l.label}
            {currentPage === l.id && <div style={s.dot}/>}
          </button>
        ))}
      </div>

      {/* User chip */}
      <div style={{position:'relative'}}>
        <div style={s.chip} onClick={() => setMenu(!menu)}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <span style={s.uname}>{user?.name || 'User'}</span>
          <span style={{color:'#6b8f77',fontSize:'10px'}}>▾</span>
        </div>
        {menu && (
          <div style={s.drop}>
            <div style={s.dropHead}>
              <div style={{fontWeight:700,color:'#0f2e1a',fontSize:'14px'}}>{user?.name}</div>
              <div style={{fontSize:'12px',color:'#6b8f77',marginTop:'2px'}}>{user?.email}</div>
            </div>
            <div style={s.dropLine}/>
            {[{i:'👤',l:'Profile'},{i:'⚙️',l:'Settings'}].map((x,i)=>(
              <button key={i} style={s.dropBtn} onClick={()=>setMenu(false)}><span>{x.i}</span>{x.l}</button>
            ))}
            <div style={s.dropLine}/>
            <button style={{...s.dropBtn,color:'#dc2626'}} onClick={onLogout}><span>🚪</span>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav:{
    position:'fixed',top:0,left:0,right:0,zIndex:1000,
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'0 32px',height:'64px',
    background:'rgba(245,253,247,0.85)',
    backdropFilter:'blur(20px)',
    borderBottom:'1px solid rgba(34,197,94,0.12)',
    transition:'all 0.3s',
  },
  scrolled:{
    background:'rgba(255,255,255,0.95)',
    borderBottomColor:'rgba(34,197,94,0.2)',
    boxShadow:'0 4px 20px rgba(34,197,94,0.08)',
  },
  logo:{ display:'flex',alignItems:'center',gap:'10px',cursor:'pointer' },
  logoBox:{
    width:36,height:36,
    background:'rgba(34,197,94,0.1)',
    border:'1px solid rgba(34,197,94,0.25)',
    borderRadius:'10px',
    display:'flex',alignItems:'center',justifyContent:'center',
  },
  logoText:{ fontFamily:'Fraunces,serif',fontSize:'18px',fontWeight:600,color:'#0f2e1a',letterSpacing:'-0.3px' },
  aiBadge:{
    background:'linear-gradient(135deg,#16a34a,#0d9488)',
    color:'#fff',fontSize:'10px',fontWeight:700,
    padding:'2px 6px',borderRadius:'5px',marginLeft:'6px',
    verticalAlign:'middle',fontFamily:'DM Sans,sans-serif',letterSpacing:'1px',
  },
  links:{ display:'flex',gap:'4px' },
  link:{
    display:'flex',alignItems:'center',gap:'6px',
    padding:'8px 14px',borderRadius:'10px',
    background:'transparent',border:'none',
    color:'#6b8f77',fontFamily:'DM Sans,sans-serif',
    fontSize:'14px',fontWeight:500,cursor:'pointer',
    transition:'all 0.2s',position:'relative',
  },
  linkOn:{ color:'#16a34a',background:'rgba(34,197,94,0.1)',fontWeight:600 },
  dot:{
    position:'absolute',bottom:'5px',left:'50%',
    transform:'translateX(-50%)',
    width:'4px',height:'4px',
    background:'#16a34a',borderRadius:'50%',
  },
  chip:{
    display:'flex',alignItems:'center',gap:'8px',
    padding:'6px 12px 6px 6px',
    background:'rgba(34,197,94,0.08)',
    border:'1px solid rgba(34,197,94,0.2)',
    borderRadius:'100px',cursor:'pointer',
  },
  avatar:{
    width:28,height:28,
    background:'linear-gradient(135deg,#16a34a,#0d9488)',
    borderRadius:'50%',display:'flex',alignItems:'center',
    justifyContent:'center',fontSize:'13px',fontWeight:700,color:'#fff',
  },
  uname:{ fontSize:'13px',fontWeight:500,color:'#0f2e1a' },
  drop:{
    position:'absolute',top:'calc(100% + 10px)',right:0,width:'220px',
    background:'#fff',border:'1px solid rgba(34,197,94,0.15)',
    borderRadius:'14px',overflow:'hidden',
    boxShadow:'0 16px 48px rgba(34,197,94,0.12)',
  },
  dropHead:{ padding:'16px 16px 12px' },
  dropLine:{ height:'1px',background:'rgba(34,197,94,0.1)' },
  dropBtn:{
    display:'flex',alignItems:'center',gap:'10px',width:'100%',
    padding:'11px 16px',background:'transparent',border:'none',
    color:'#3a6047',fontFamily:'DM Sans,sans-serif',
    fontSize:'14px',cursor:'pointer',transition:'background 0.15s',textAlign:'left',
  },
};