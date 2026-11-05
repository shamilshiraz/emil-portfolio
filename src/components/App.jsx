import React, { useEffect, useState } from 'react';
import IntroStage from './IntroStage.jsx';
import SiteHeader from './SiteHeader.jsx';
import Manifesto from './Manifesto.jsx';
import Approach from './Approach.jsx';
import WorksDrawer from './WorksDrawer.jsx';
import Experiments from './Experiments.jsx';
import Footer from './Footer.jsx';
import LegacyOverlays from './LegacyOverlays.jsx';
import LegacyScripts from './LegacyScripts.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('emil-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('emil-theme', theme); } catch {}
    const button = document.getElementById('themeToggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }, [theme]);

  useEffect(() => {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    const toggle = () => setTheme(current => current === 'light' ? 'dark' : 'light');
    button.addEventListener('click', toggle);
    return () => button.removeEventListener('click', toggle);
  }, []);

  return <>
    <main id="top">
      <IntroStage />
      <div className="page">
        <SiteHeader />
        <Manifesto />
        <Approach />
        <WorksDrawer />
        <Experiments />
      </div>
      <Footer />
    </main>
    <LegacyOverlays />
    <LegacyScripts />
  </>;
}
