
import React from "react";

export default function SiteHeader() {
  return (
    <>
      <style>{`
        .site-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 76px;
          z-index: 1000;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          padding: 0 38px;
          background: transparent;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          pointer-events: none;
        }

        .site-nav a {
          color: #0e0d0d;
          text-decoration: none;
          mix-blend-mode: difference;
          transition: opacity 0.3s ease;
          pointer-events: auto;
        }

        .site-nav a:hover {
          opacity: 0.5;
        }

        .nav-braille {
          justify-self: start;
          font-size: 20px;
          line-height: 1;
        }

        .nav-center {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 34px;
        }

        .nav-contact {
          justify-self: end;
        }

        @media (max-width: 600px) {
          .site-nav {
            height: 64px;
            padding: 0 18px;
            font-size: 11px;
          }

          .nav-center {
            gap: 14px;
          }

          .nav-braille {
            font-size: 17px;
          }
        }
      `}</style>

      <header className="site-nav">
        <a href="#top" className="nav-braille" aria-label="Home">
          ⠑⠓
        </a>

        <nav className="nav-center" aria-label="Main navigation">
          <a href="#top">Home</a>
          <a href="#about">About</a>
          <a href="#works">Works</a>
        </nav>

        <a href="#contact" className="nav-contact">
          Contact
        </a>
      </header>
    </>
  );
}
