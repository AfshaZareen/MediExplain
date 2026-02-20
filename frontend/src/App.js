import React, { useState, useEffect } from 'react';
import LoginPage     from './pages/LoginPage';
import Navbar        from './components/Navbar';
import HomePage      from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import KnowledgePage from './pages/KnowledgePage';
import AboutPage     from './pages/AboutPage';

export default function App() {
  const [user, setUser]           = useState(null);
  const [page, setPage]           = useState('home');
  const [authChecked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('medi_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setChecked(true);
  }, []);

  if (!authChecked) return null;

  if (!user) {
    return <LoginPage onLogin={(u) => { setUser(u); setPage('home'); }} />;
  }

  const pages = {
    home:      <HomePage />,
    dashboard: <DashboardPage />,
    knowledge: <KnowledgePage />,
    about:     <AboutPage />,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5fdf7' }}>
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        user={user}
        onLogout={() => { localStorage.removeItem('medi_user'); setUser(null); }}
      />
      <main>{pages[page] || <HomePage />}</main>
    </div>
  );
}