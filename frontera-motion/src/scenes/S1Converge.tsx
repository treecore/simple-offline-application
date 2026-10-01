import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, C, Card, FONT, Kinetic, Logo, inOut, lerp, prog, useSpring} from '../lib';

type Frag = {x: number; y: number; r: number; kind: 'doc' | 'chat' | 'task' | 'sheet' | 'mail'; label: string; d: number};

const FRAGS: Frag[] = [
  {x: 230, y: 170, r: -8, kind: 'doc', label: 'Vendor_Contract.pdf', d: 0},
  {x: 1500, y: 140, r: 6, kind: 'chat', label: 'Can someone check yesterday’s payouts?', d: 4},
  {x: 90, y: 700, r: 5, kind: 'task', label: 'Reconcile invoices', d: 8},
  {x: 1580, y: 690, r: -6, kind: 'sheet', label: 'Q3_revenue.xlsx', d: 2},
  {x: 330, y: 860, r: -4, kind: 'mail', label: 'RE: Approval needed', d: 10},
  {x: 1400, y: 860, r: 7, kind: 'doc', label: 'Payout_Policy.pdf', d: 6},
  {x: 760, y: 80, r: 3, kind: 'task', label: 'Update CRM records', d: 12},
  {x: 860, y: 950, r: -5, kind: 'chat', label: 'Where is the latest SOP?', d: 14},
  {x: 1180, y: 300, r: -10, kind: 'sheet', label: 'shipments_export.csv', d: 9},
  {x: 520, y: 330, r: 9, kind: 'mail', label: 'Ticket #4821 escalated', d: 5},
];

const Glyph: React.FC<{kind: Frag['kind']}> = ({kind}) => {
  const col = {doc: C.red, chat: C.purple, task: C.green, sheet: C.green, mail: C.orange}[kind];
  return (
    <div style={{width: 34, height: 34, borderRadius: 9, background: col + '1A', display: 'grid', placeItems: 'center'}}>
      <div style={{width: 14, height: kind === 'chat' ? 11 : 16, borderRadius: kind === 'chat' ? 6 : 3, border: `2px solid ${col}`}} />
    </div>
  );
};

export const S1Converge: React.FC = () => {
  const f = useCurrentFrame();
  const conv = prog(f, 92, 30, inOut);
  const hub = useSpring(112, {damping: 13, mass: 0.6});
  const out = prog(f, 132, 18, inOut);

  return (
    <AbsoluteFill>
      <Backdrop />
      {FRAGS.map((p, i) => {
        const appear = prog(f, p.d, 24);
        const dx = Math.sin((f + i * 30) / 28) * 14;
        const dy = Math.cos((f + i * 20) / 32) * 12;
        const x = lerp(p.x + dx, 960 - 150, conv);
        const y = lerp(p.y + dy, 540 - 34, conv);
        const s = lerp(1, 0.2, conv) * (0.85 + appear * 0.15);
        return (
          <Card
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 300,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transform: `rotate(${p.r * (1 - conv)}deg) scale(${s})`,
              opacity: appear * (1 - prog(f, 108, 12)),
              filter: `blur(${(1 - appear) * 6 + conv * 3}px)`,
            }}
          >
            <Glyph kind={p.kind} />
            <div style={{fontSize: 17, fontWeight: 500, color: C.ink, lineHeight: 1.25}}>{p.label}</div>
          </Card>
        );
      })}

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - prog(f, 84, 14)}}>
        <div style={{position: 'relative', height: 200, width: 1400}}>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 1 - prog(f, 44, 10)}}>
            <Kinetic text="Work is complex." start={8} size={104} stagger={4} />
          </div>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
            <Kinetic text="Your AI platform shouldn’t be." start={50} size={104} stagger={4} highlight={['shouldn’t', 'be.']} />
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 48,
            background: '#fff',
            border: `1px solid ${C.line}`,
            boxShadow: `0 30px 80px -20px ${C.blue}55`,
            display: 'grid',
            placeItems: 'center',
            transform: `scale(${hub * (1 + out * 7)})`,
            opacity: interpolate(out, [0, 0.6, 1], [1, 1, 0]),
            borderWidth: 1,
          }}
        >
          <Logo size={120} build={hub} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{fontFamily: FONT}} />
    </AbsoluteFill>
  );
};
