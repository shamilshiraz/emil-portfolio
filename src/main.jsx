import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import siteConfig from './config/site';

// Legacy interactions read this shared, editable configuration.
window.EMIL_SITE = siteConfig;
import './styles/legacy.css';
import './styles/redesign.css';

createRoot(document.getElementById('root')).render(<App />);
