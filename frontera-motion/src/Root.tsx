import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {S1Converge} from './scenes/S1Converge';
import {S2Modules} from './scenes/S2Modules';
import {S3Agent} from './scenes/S3Agent';
import {S4Workflow} from './scenes/S4Workflow';
import {S5Everywhere} from './scenes/S5Everywhere';
import {S6EndCard} from './scenes/S6EndCard';

export const FPS = 30;

// Scene cuts (seconds) — locked to the voice-over timeline in audio/build_audio.py
export const CUTS = [0, 5.0, 13.2, 22.2, 30.4, 37.8, 45];
const SCENES = [S1Converge, S2Modules, S3Agent, S4Workflow, S5Everywhere, S6EndCard];

const Film: React.FC = () => (
  <AbsoluteFill style={{background: '#F6F6F7'}}>
    {SCENES.map((Scene, i) => {
      const from = Math.round(CUTS[i] * FPS);
      const to = Math.round(CUTS[i + 1] * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <Scene />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition id="Frontera" component={Film} durationInFrames={45 * FPS} fps={FPS} width={1920} height={1080} />
);
