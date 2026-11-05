import React from 'react';
import markup from '../legacy/works.html?raw';
export default function WorksDrawer() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
