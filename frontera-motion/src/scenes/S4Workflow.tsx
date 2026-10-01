import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, C, Card, Eyebrow, Kinetic, Shot, inOut, prog, reveal, useSpring} from '../lib';

const W = 280;
const H = 100;

const NODES = [
  {x: 110, y: 520, title: 'New payout file arrives', tag: 'Trigger', color: C.sub, at: 14, hl: 999},
  {x: 460, y: 520, title: 'Extract & normalize', tag: 'Model', color: C.purple, at: 28, hl: 96},
  {x: 810, y: 520, title: 'Match against Records', tag: 'Tool', color: C.blue, at: 42, hl: 108},
  {x: 1160, y: 520, title: 'Exceptions found?', tag: 'Decision', color: C.amber, at: 56, hl: 123},
  {x: 1520, y: 690, title: 'Post to ERP', tag: 'Integration', color: C.green, at: 76, hl: 144},
  {x: 1520, y: 350, title: 'Finance approval', tag: 'Human', color: C.orange, at: 70, hl: 168},
];

const EDGES: [number, number, string?][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 5, 'Yes'],
  [3, 4, 'No'],
];

const path = (a: (typeof NODES)[number], b: (typeof NODES)[number]) => {
  const x1 = a.x + W;
  const y1 = a.y + H / 2;
  const x2 = b.x;
  const y2 = b.y + H / 2;
  const mx = (x1 + x2) / 2;
  return {d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, x1, y1, x2, y2, mx};
};

const bez = (t: number, p0: number, p1: number, p2: number, p3: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

export const S4Workflow: React.FC = () => {
  const f = useCurrentFrame();
  const toShot = prog(f, 186, 34, inOut);
  const pan = interpolate(f, [0, 190], [30, -30]);

  return (
    <AbsoluteFill>
      <Backdrop glow={C.orange} />
      <AbsoluteFill style={{opacity: 1 - toShot, filter: `blur(${toShot * 8}px)`, transform: `scale(${1 + toShot * 0.1})`}}>
        <div style={{position: 'absolute', top: 120, width: '100%', display: 'grid', placeItems: 'center', gap: 16}}>
          <div style={reveal(f, 2)}>
            <Eyebrow color={C.orange}>Workflows</Eyebrow>
          </div>
          <Kinetic text="Processes, coordinated." start={6} size={60} stagger={4} highlight={['coordinated.']} />
        </div>

        <div style={{position: 'absolute', inset: 0, transform: `translateX(${pan}px)`}}>
          <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
            {EDGES.map(([a, b, label], i) => {
              const p = path(NODES[a], NODES[b]);
              const draw = prog(f, NODES[b].at - 4, 22, inOut);
              const len = 520;
              return (
                <g key={i}>
                  <path d={p.d} stroke="#C9CBD1" strokeWidth="2.5" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
                  {draw >= 1 &&
                    [0, 0.5].map((o) => {
                      const t = ((f / 40 + o + i * 0.17) % 1);
                      const x = bez(t, p.x1, p.mx, p.mx, p.x2);
                      const y = bez(t, p.y1, p.y1, p.y2, p.y2);
                      return <circle key={o} cx={x} cy={y} r="5" fill={C.blue} opacity={Math.sin(t * Math.PI)} />;
                    })}
                  {label && (
                    <text x={p.mx + 10} y={(p.y1 + p.y2) / 2} fontFamily="Inter" fontSize="16" fill={C.sub} opacity={draw}>
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {NODES.map((n, i) => {
            const s = useSpring(n.at);
            const hl = prog(f, n.hl, 14);
            const bump = Math.sin(prog(f, n.hl, 12) * Math.PI) * 0.06;
            return (
              <Card
                key={i}
                style={{
                  position: 'absolute',
                  left: n.x,
                  top: n.y,
                  width: W,
                  height: H,
                  padding: '16px 18px',
                  opacity: s,
                  transform: `scale(${(0.8 + s * 0.2) * (1 + bump)})`,
                  borderColor: hl > 0.5 ? n.color + '88' : C.line,
                  boxShadow: hl > 0 ? `0 20px 44px -16px ${n.color}88` : undefined,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: 14,
                    fontWeight: 650,
                    padding: '3px 9px',
                    borderRadius: 7,
                    color: hl > 0.5 || i === 0 ? '#fff' : n.color,
                    background: hl > 0.5 || i === 0 ? n.color : n.color + '18',
                  }}
                >
                  {n.tag}
                </div>
                <div style={{fontSize: 20, fontWeight: 600, marginTop: 10, whiteSpace: 'nowrap'}}>{n.title}</div>
              </Card>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{opacity: prog(f, 192, 30), transform: `scale(${interpolate(f, [192, 246], [1.12, 1.0], {extrapolateLeft: 'clamp'})})`}}>
          <Shot src={staticFile('shots/workflow.webp')} width={1580} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
