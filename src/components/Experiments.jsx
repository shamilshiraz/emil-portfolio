import React from 'react';
import markup from '../legacy/experiments.html?raw';
export default function Experiments() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
