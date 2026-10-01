import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, C, FONT, Logo, inOut, lerp, prog, useSpring} from '../lib';

const N = 16;
const PTS = Array.from({length: N}, (_, i) => {
  const a = (i / N) * Math.PI * 2 + (i % 3) * 0.3;
  const r = 300 + ((i * 97) % 5) * 55;
  return {x: 960 + Math.cos(a) * r * 1.5, y: 540 + Math.sin(a) * r * 0.85};
});
const LINKS = PTS.map((_, i) => [i, (i + 1) % N] as const).concat(PTS.map((_, i) => [i, (i + 5) % N] as const).filter((_, i) => i % 2 === 0));
const TASKS = ['Invoice', 'Ticket', 'Lead', 'Payout', 'Report', 'Contract', 'Shipment', 'Review'];

export const S6EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const link = prog(f, 26, 36, inOut);
  const pull = prog(f, 66, 26, inOut);
  const build = prog(f, 80, 36);
  const mark = useSpring(80, {damping: 14, mass: 0.7});
  const word = prog(f, 96, 26);
  const tag = prog(f, 124, 26);
  const flash = interpolate(f, [86, 92, 120], [0, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Backdrop />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 1 - prog(f, 78, 14)}}>
        {LINKS.map(([a, b], i) => {
          const A = PTS[a];
          const B = PTS[b];
          const ax = lerp(A.x, 960, pull);
          const ay = lerp(A.y, 540, pull);
          const bx = lerp(B.x, 960, pull);
          const by = lerp(B.y, 540, pull);
          const t = Math.min(1, Math.max(0, link * 1.6 - (i / LINKS.length) * 0.6));
          return <line key={i} x1={ax} y1={ay} x2={lerp(ax, bx, t)} y2={lerp(ay, by, t)} stroke={C.blue} strokeOpacity="0.4" strokeWidth="2" />;
        })}
      </svg>
      {PTS.map((p, i) => {
        const s = prog(f, i * 1.5, 18);
        const x = lerp(p.x, 960, pull);
        const y = lerp(p.y, 540, pull);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${s * (1 - pull * 0.7)})`,
              opacity: s * (1 - prog(f, 78, 12)),
              padding: '8px 14px',
              borderRadius: 10,
              background: '#fff',
              border: `1px solid ${link > 0.5 ? '#BCD6FB' : C.line}`,
              fontFamily: FONT,
              fontSize: 17,
              fontWeight: 600,
              color: link > 0.5 ? C.blue : C.sub,
              boxShadow: '0 8px 20px -10px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {TASKS[i % TASKS.length]}
          </div>
        );
      })}

      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${C.blue}55, transparent 45%)`, opacity: flash}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 34 * word, transform: `translateY(${-40 * tag}px)`}}>
          <div style={{transform: `scale(${mark})`}}>
            <Logo size={150} build={build} />
          </div>
          <div style={{overflow: 'hidden', width: 520 * word, display: 'flex'}}>
            <div
              style={{
                fontSize: 132,
                fontWeight: 650,
                letterSpacing: -5,
                color: C.ink,
                transform: `translateX(${(1 - word) * -60}px)`,
                opacity: word,
                whiteSpace: 'nowrap',
              }}
            >
              Frontera
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 640,
            fontSize: 38,
            fontWeight: 500,
            color: C.sub,
            letterSpacing: -0.6,
            opacity: tag,
            filter: `blur(${(1 - tag) * 8}px)`,
            transform: `translateY(${(1 - tag) * 16}px)`,
          }}
        >
          Build intelligence into the way work gets done.
        </div>
        <div style={{position: 'absolute', bottom: 80, fontSize: 22, color: C.faint, fontWeight: 500, opacity: prog(f, 150, 20)}}>frontera.kata.ai</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
