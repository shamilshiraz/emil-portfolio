import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createWorks } from '../engine/createWorks.js';
import { pad, inkFor } from '../engine/utils.js';
import './SelectedWorks.css';

/*
 * The wavy-cloth carousel (← → arrows, drag, keyboard) + the project detail view.
 *
 * Split of responsibilities (see engine/createWorks.js for the details):
 *   - React renders all markup and the detail-panel TEXT (title, summary, year/role/scope, link).
 *   - The engine drives the three.js canvas, carousel movement, pointer input and the photo gallery,
 *     and toggles the `on` / `nav` classes on #panel (those classes drive the CSS fades).
 *
 * `projects` — see src/data/projects.js
 */
export default function SelectedWorks({ projects }) {
  const el = useRef({});          // DOM nodes handed to the engine
  const engine = useRef(null);
  const [shown, setShown] = useState(0); // which project's text is in the detail panel
  const d = projects[shown] ?? projects[0];

  useEffect(() => {
    const r = el.current;
    engine.current = createWorks({
      els: {
        stage: r.stage, works: r.works,
        contact: document.getElementById('contact') || document.querySelector('footer'),
        canvas: r.canvas, nowebgl: r.nowebgl, dot: r.dot, tip: r.tip,
        count: r.count, hint: r.hint, prog: r.prog, panel: r.panel,
        gallery: r.gallery, grid: r.grid,
      },
      projects,
      hooks: {
        // flushSync so the new text is in the DOM before the engine starts fading it in
        onContent: (i) => flushSync(() => setShown(i)),
      },
    });
    return () => { engine.current?.destroy(); engine.current = null; };
  }, [projects]);

  const ref = (name) => (node) => { el.current[name] = node; };

  return (
    <>
      <h2 className="statement sw-title">Selected works</h2>

      <section id="works" ref={ref('works')}>
        <div id="stage" ref={ref('stage')}>
          <canvas id="gl" ref={ref('canvas')} />
          <div className="ui mono" id="nav">Drag &middot; click &middot; arrows</div>
          <div className="ui mono" id="count" ref={ref('count')}>{projects[0]?.name}</div>
          <div className="ui mono" id="hint" ref={ref('hint')}>Click on it to view fully</div>
          <div id="prog" ref={ref('prog')} />
          <button className="ui sw-arrow sw-prev" aria-label="Previous project" onClick={() => engine.current?.step(-1)}>&larr;</button>
          <button className="ui sw-arrow sw-next" aria-label="Next project" onClick={() => engine.current?.step(1)}>&rarr;</button>

          {/* className is owned by the engine (adds/removes "on" and "nav"); keep it static here */}
          <aside id="panel" aria-live="polite" ref={ref('panel')}>
            <section id="pd" style={{ '--bg': d.accent, '--ink': inkFor(d.accent) }}>
              <div className="top">
                <div className="num">{pad(shown + 1)} / {pad(projects.length)}  —  Selected works</div>
              </div>
              <div className="main">
                <div className="head">
                  <h2>{d.name}</h2>
                  <span className="yr">( {d.year} )</span>
                </div>
                <p className="desc">{d.a}</p>
                <div className="blk">
                  <h3 className="lbl">Scope</h3>
                  <p>{d.scope}</p>
                </div>
                <div className="pair">
                  <div className="c1">
                    {d.collaborators?.length > 0 && (
                      <div className="blk">
                        <h3 className="lbl">Collaborators</h3>
                        {d.collaborators.map((c) => <p key={c}>{c}</p>)}
                      </div>
                    )}
                  </div>
                  <div className="c2">
                    <div className="blk">
                      <h3 className="lbl">Service</h3>
                      <p>{d.service}</p>
                    </div>
                    <div className="blk">
                      <h3 className="lbl">Client</h3>
                      <p>{d.client}</p>
                    </div>
                    {d.link && (
                      <div className="blk">
                        <h3 className="lbl">Link</h3>
                        <p><a href={d.link} target="_blank" rel="noopener noreferrer">Visit project ↗</a></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bot">
                <button className="btn" id="close" onClick={() => engine.current?.close()}>Back</button>
                <div className="pn">
                  <button className="btn" id="prev" onClick={() => engine.current?.go(-1)}>&larr; Prev</button>
                  <button className="btn" id="next" onClick={() => engine.current?.go(1)}>Next &rarr;</button>
                </div>
              </div>
            </section>
            <section id="gal" aria-label="Project photos" ref={ref('gallery')}>
              {/* tiles are built by the engine (endless looping columns) */}
              <div id="grid" ref={ref('grid')} />
            </section>
          </aside>

          <div id="nowebgl" ref={ref('nowebgl')}>WebGL is not available in this browser.</div>
        </div> 
      </section>

      <div id="dot" ref={ref('dot')} />
      <div id="tip" ref={ref('tip')} />
    </>
  );
}