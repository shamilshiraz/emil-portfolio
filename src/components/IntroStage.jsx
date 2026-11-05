import React from 'react';
import markup from '../legacy/intro-stage.html?raw';
export default function IntroStage() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
