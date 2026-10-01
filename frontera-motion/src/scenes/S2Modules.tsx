import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, C, Card, Eyebrow, FONT, Kinetic, Shot, inOut, prog, reveal, useSpring} from '../lib';

const AgentArt = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
    <div style={{alignSelf: 'flex-start', background: '#F1F1F3', borderRadius: 10, height: 18, width: 150}} />
    <div style={{alignSelf: 'flex-end', background: C.ink, borderRadius: 10, height: 18, width: 96}} />
    <div style={{alignSelf: 'flex-start', background: '#F1F1F3', borderRadius: 10, height: 18, width: 180}} />
  </div>
);
const AppArt = () => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 70}}>
    {[34, 58, 44, 70, 52].map((h, i) => (
      <div key={i} style={{width: 26, height: h, borderRadius: 6, background: i === 3 ? C.green : '#DDEFE9'}} />
    ))}
  </div>
);
const FlowArt = () => (
  <svg width="210" height="70" viewBox="0 0 210 70">
    <path d="M30 35 H95 M115 35 C140 35 140 14 170 14 M115 35 C140 35 140 56 170 56" stroke="#F6B892" strokeWidth="2" fill="none" />
    {[[20, 35], [105, 35], [182, 14], [182, 56]].map(([x, y], i) => (
      <rect key={i} x={x - 14} y={y - 10} width="28" height="20" rx="6" fill={i === 1 ? C.orange : '#FFE9DC'} />
    ))}
  </svg>
);
const BlueprintArt = () => (
  <svg width="210" height="70" viewBox="0 0 210 70">
    <path d="M28 35 L90 16 M28 35 L90 54 M90 16 L170 16 M90 54 L170 54 M90 16 L170 54" stroke="#BCD3FB" strokeWidth="2" fill="none" />
    {[[28, 35], [90, 16], [90, 54], [170, 16], [170, 54]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="9" fill={i === 0 ? C.blue : '#DCE8FD'} />
    ))}
  </svg>
);

const MODULES = [
  {name: 'Agents', desc: 'Reason, act, and answer', color: C.purple, at: 36, from: [-700, -120], Art: AgentArt},
  {name: 'Apps', desc: 'Custom tools for teams', color: C.green, at: 54, from: [-300, 500], Art: AppArt},
  {name: 'Workflows', desc: 'Repeatable processes', color: C.orange, at: 72, from: [300, -500], Art: FlowArt},
  {name: 'Blueprints', desc: 'Reusable shared models', color: C.blue, at: 98, from: [700, 140], Art: BlueprintArt},
];

export const S2Modules: React.FC = () => {
  const f = useCurrentFrame();
  const foundation = useSpring(150, {damping: 18, mass: 0.8});
  const toShot = prog(f, 186, 40, inOut);
  const shotIn = prog(f, 196, 44);

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{opacity: 1 - toShot, transform: `scale(${1 - toShot * 0.25}) translateY(${-toShot * 160}px)`, filter: `blur(${toShot * 8}px)`}}>
        <div style={{position: 'absolute', top: 150, width: '100%', display: 'grid', placeItems: 'center', gap: 18}}>
          <div style={reveal(f, 4)}>
            <Eyebrow>Frontera platform</Eyebrow>
          </div>
          <Kinetic text="Everything AI, on one foundation." start={10} size={64} stagger={3} highlight={['one', 'foundation.']} />
        </div>

        <div style={{position: 'absolute', top: 430, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 28}}>
          {MODULES.map((m, i) => {
            const s = useSpring(m.at, {damping: 15, mass: 0.7});
            const drop = foundation;
            return (
              <Card
                key={m.name}
                style={{
                  width: 330,
                  height: 300,
                  padding: 26,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: `translate(${m.from[0] * (1 - s)}px, ${m.from[1] * (1 - s) + drop * 10 - 10 * prog(f, 160, 12)}px) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`,
                  opacity: Math.min(1, s * 1.5),
                  filter: `blur(${(1 - Math.min(1, s)) * 10}px)`,
                  boxShadow: `0 1px 2px rgba(16,17,20,0.04), 0 24px 48px -20px ${m.color}55`,
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{width: 48, height: 48, borderRadius: 12, background: m.color + '1F', display: 'grid', placeItems: 'center'}}>
                    <div style={{width: 20, height: 20, borderRadius: 6, border: `2.5px solid ${m.color}`}} />
                  </div>
                  <div>
                    <div style={{fontSize: 28, fontWeight: 650}}>{m.name}</div>
                    <div style={{fontSize: 17, color: C.sub}}>{m.desc}</div>
                  </div>
                </div>
                <m.Art />
              </Card>
            );
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 770,
            left: 960 - 700,
            width: 1400,
            height: 86,
            borderRadius: 20,
            background: `linear-gradient(90deg, ${C.blueDeep}, ${C.blue})`,
            boxShadow: `0 30px 60px -24px ${C.blue}AA`,
            transform: `translateY(${(1 - foundation) * 140}px) scaleX(${0.6 + foundation * 0.4})`,
            opacity: foundation,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            fontFamily: FONT,
            color: '#fff',
          }}
        >
          <div style={{fontSize: 26, fontWeight: 600}}>One shared foundation</div>
          <div style={{display: 'flex', gap: 28, fontSize: 18, opacity: 0.85}}>
            {['Knowledge', 'Models', 'Integrations', 'Access control', 'Observability'].map((t, i) => (
              <span key={t} style={{opacity: prog(f, 160 + i * 4, 14)}}>{t}</span>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: 1800}}>
        <div
          style={{
            opacity: shotIn,
            transform: `translateY(${(1 - shotIn) * 260}px) rotateX(${(1 - shotIn) * 22}deg) scale(${interpolate(f, [196, 246], [0.9, 0.96])})`,
          }}
        >
          <Shot src={staticFile('shots/home.webp')} width={1560} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
