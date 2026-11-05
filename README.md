# Emil Hassan — React portfolio handoff

A React + Vite conversion of the supplied Emil Hassan portfolio HTML, with the requested visual redesign layered over the existing interactions.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build:

```bash
npm run build
npm run preview
```

## What's included

- **React/Vite app shell** with small, named components under `src/components/`.
- **New manifesto block** between the boxed navigation and the Approach section.
- **Boxed navigation** with the braille `⠑⠓` mark and a working light/dark theme toggle.
- **Dark theme** uses `#181818` for the page background.
- **Redesigned footer**: marquee removed, original footer copy/pages/social links retained, and a large `Emil Hassan` wordmark scrambles on hover/focus.
- **Original site interactions preserved**: scroll-reveal intro, particle portrait canvas, typing effects, loader, scroll hint, interactive work drawer, project overlay, custom cursor, Notes overlay, About overlay, experience node map, and contact popup.
- Existing project imagery remains embedded in the supplied HTML fragments, so no separate image download is required.

## Component map

```text
src/
  App.jsx
  main.jsx
  config/
    site.js
  components/
    IntroStage.jsx
    SiteHeader.jsx
    Manifesto.jsx
    Approach.jsx
    WorksDrawer.jsx
    Experiments.jsx
    Footer.jsx
    LegacyOverlays.jsx
    LegacyScripts.jsx
  legacy/
    intro-stage.html
    approach.html
    works.html
    experiments.html
    loader.html
    project-overlay.html
    cursor.html
    notes-overlay.html
    about-overlay.html
    contact-overlay.html
  styles/
    legacy.css
    redesign.css
public/
  legacy/
    00-intro-reveal.js
    ...
    11-footer-contact.js
```

### Why some markup and interactions are kept as legacy fragments

The supplied page contains a large amount of custom SVG, canvas, and animation code, plus embedded image data. Those parts are retained as isolated HTML fragments and ordered legacy scripts so the conversion does not silently discard or rewrite intricate behavior. The React component boundaries make the site easier to navigate while keeping the original implementation available for a developer to progressively refactor into idiomatic JSX/hooks.

The `05-works-drawer.js` initialization was adjusted to run after React mounts (rather than waiting for `DOMContentLoaded`, which has already fired by then). The scripts are loaded in their original dependency order.

## Where to customize

- **Email, socials, contact endpoint:** `src/config/site.js`
  - Replace `hello@example.com` and the placeholder social profile URLs.
  - Set `endpoint` to a real form endpoint if direct form submission is desired. When blank, the contact form opens the visitor's email app.
- **Manifesto wording:** `src/components/Manifesto.jsx`
- **Navigation and braille mark:** `src/components/SiteHeader.jsx`
- **Footer layout and scramble behavior:** footer builder in `public/legacy/11-footer-contact.js`; footer styling in `src/styles/redesign.css`.
- **Theme colors and layout refinements:** `src/styles/redesign.css`
- **Original site styling:** `src/styles/legacy.css`
- **Original page copy, work entries, and overlay content:** corresponding `.html` fragment in `src/legacy/`.

## Developer notes

- No backend is connected for the contact form by default.
- The external Google Fonts stylesheet is retained from the supplied page.
- The legacy particle portrait script is large because the original implementation includes its visual data inline. It has been preserved intact.
- Please test responsive behavior, reduced-motion preferences, keyboard focus, and the contact flow before deployment.
