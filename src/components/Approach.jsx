import React from 'react';
import markup from '../legacy/approach.html?raw';
export default function Approach() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
