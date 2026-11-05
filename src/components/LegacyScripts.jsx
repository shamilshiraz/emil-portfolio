import { useEffect } from 'react';

const scripts = [
  '00-intro-reveal.js',
  '01-particle-portrait.js',
  '02-approach-type.js',
  '03-loader.js',
  '04-scroll-hint.js',
  '05-works-drawer.js',
  '06-project-view.js',
  '07-custom-cursor.js',
  '08-notes.js',
  '09-about.js',
  '10-experience-map.js',
  '11-footer-contact.js',
];

export default function LegacyScripts() {
  useEffect(() => {
    let cancelled = false;
    const loaded = [];
    async function boot() {
      for (const file of scripts) {
        if (cancelled) return;
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `/legacy/${file}`;
          script.async = false;
          script.onload = () => { loaded.push(script); resolve(); };
          script.onerror = () => reject(new Error(`Could not load ${file}`));
          document.body.appendChild(script);
        });
      }
    }
    boot().catch(error => console.error('Legacy interaction initialization failed:', error));
    return () => { cancelled = true; };
  }, []);
  return null;
}
