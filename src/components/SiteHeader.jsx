import React from 'react';
export default function SiteHeader() {
  return (
    <header className="nav">
      <div className="nav-shell">
        <div className="nav-main">
          <a className="brand-mark" href="#top" aria-label="Emil Hassan home">⠑⠓</a>
          <nav aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#works">Works</a>
            <a href="#notes">Notes</a>
            <a href="#contact" data-contact>Say hello</a>
          </nav>
        </div>
        <button className="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">
          <span className="theme-light" aria-hidden="true">☼</span>
          <span className="theme-dark" aria-hidden="true">☾</span>
        </button>
      </div>
    </header>
  );
}
