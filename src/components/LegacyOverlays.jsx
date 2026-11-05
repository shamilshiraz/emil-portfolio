import React from 'react';
import loader from '../legacy/loader.html?raw';
import project from '../legacy/project-overlay.html?raw';
import cursor from '../legacy/cursor.html?raw';
import notes from '../legacy/notes-overlay.html?raw';
import about from '../legacy/about-overlay.html?raw';
import contact from '../legacy/contact-overlay.html?raw';

function Fragment({ markup }) {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
export default function LegacyOverlays() {
  return <>
    <Fragment markup={loader} />
    <Fragment markup={project} />
    <Fragment markup={cursor} />
    <Fragment markup={notes} />
    <Fragment markup={about} />
    <Fragment markup={contact} />
  </>;
}
