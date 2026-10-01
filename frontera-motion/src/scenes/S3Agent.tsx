import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, C, Card, Check, Eyebrow, Kinetic, inOut, lerp, prog, reveal, useSpring} from '../lib';

const DOCS = [
  {name: 'Payout_Policy.pdf', tag: 'Policy', color: C.red},
  {name: 'Vendor_Contract.pdf', tag: 'Contract', color: C.orange},
  {name: 'Finance_SOP.docx', tag: 'SOP', color: C.blue},
];

const ANSWER =
  '3 payouts exceed the approved limit and need finance sign-off. Vendor terms allow processing within 30 days.';

const Cite: React.FC<{n: number; on: number}> = ({n, on}) => (
  <span
    style={{
      display: 'inline-grid',
      placeItems: 'center',
      width: 26,
      height: 22,
      marginLeft: 6,
      borderRadius: 6,
      fontSize: 14,
      fontWeight: 700,
      color: C.blue,
      background: C.blueSoft,
      transform: `scale(${on})`,
      verticalAlign: 'middle',
    }}
  >
    {n}
  </span>
);

export const S3Agent: React.FC = () => {
  const f = useCurrentFrame();
  const panel = useSpring(8, {damping: 18, mass: 0.8});
  const scan = interpolate(f, [30, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chars = Math.floor(interpolate(f, [128, 196], [0, ANSWER.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const split = ANSWER.indexOf('.') + 1;
  const approve = useSpring(206);
  const click = prog(f, 236, 10);
  const approved = f >= 242;
  const out = prog(f, 252, 18, inOut);

  const steps = [
    {t: 'Read records', at: 44},
    {t: 'Reviewed 3 policy documents', at: 84},
    {t: 'Flagged 3 exceptions', at: 116},
  ];

  return (
    <AbsoluteFill style={{opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
      <Backdrop glow={C.purple} />
      <div style={{position: 'absolute', top: 90, width: '100%', display: 'grid', placeItems: 'center', gap: 16}}>
        <div style={reveal(f, 2)}>
          <Eyebrow color={C.purple}>Agents</Eyebrow>
        </div>
        <Kinetic text="Grounded in your knowledge." start={6} size={60} stagger={3} highlight={['knowledge.']} />
      </div>

      {/* Knowledge documents */}
      {DOCS.map((d, i) => {
        const s = useSpring(4 + i * 6);
        const active = scan * 3 - i;
        const lit = active > 0 && active < 1.15;
        return (
          <Card
            key={d.name}
            style={{
              position: 'absolute',
              left: 170 + i * 26,
              top: 300 + i * 70,
              width: 520,
              padding: 22,
              transform: `translateX(${(1 - s) * -300}px) rotate(${(i - 1) * -2}deg)`,
              opacity: s,
              zIndex: lit ? 5 : i,
              boxShadow: lit ? `0 24px 60px -20px ${C.blue}66` : undefined,
              borderColor: lit ? '#BCD6FB' : C.line,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
              <div style={{width: 36, height: 36, borderRadius: 9, background: d.color + '1A', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: d.color}}>
                {d.tag.slice(0, 3).toUpperCase()}
              </div>
              <div style={{fontSize: 20, fontWeight: 600}}>{d.name}</div>
              <div style={{marginLeft: 'auto', fontSize: 14, color: C.sub, background: '#F3F3F5', padding: '4px 10px', borderRadius: 8}}>{d.tag}</div>
            </div>
            <div style={{position: 'relative'}}>
              {[0.95, 0.8, 0.9, 0.6].map((w, j) => {
                const hl = lit && j === 1 + (i % 2);
                return (
                  <div
                    key={j}
                    style={{
                      height: 12,
                      width: `${w * 100}%`,
                      borderRadius: 6,
                      marginBottom: 10,
                      background: hl ? '#9CC3FA' : '#EDEEF1',
                      transition: 'none',
                    }}
                  />
                );
              })}
              {lit && (
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    right: -6,
                    top: `${Math.min(1, Math.max(0, active)) * 100}%`,
                    height: 3,
                    borderRadius: 2,
                    background: C.blue,
                    boxShadow: `0 0 18px 4px ${C.blue}55`,
                  }}
                />
              )}
            </div>
          </Card>
        );
      })}

      {/* Snippets flying into the agent */}
      {[0, 1].map((k) => {
        const t = prog(f, 62 + k * 34, 34, inOut);
        const x = lerp(520, 1080 + k * 250, t);
        const y = lerp(370 + k * 140, 600, t) - Math.sin(t * Math.PI) * 90;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              padding: '8px 14px',
              borderRadius: 10,
              background: C.blue,
              color: '#fff',
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: 600,
              opacity: t > 0 && t < 1 ? 1 : 0,
              transform: `scale(${1 - t * 0.3})`,
              boxShadow: `0 10px 24px -8px ${C.blue}`,
            }}
          >
            {k === 0 ? 'Approval limit · §4.2' : 'Net-30 terms · p.3'}
          </div>
        );
      })}

      {/* Agent panel */}
      <Card
        style={{
          position: 'absolute',
          left: 1000,
          top: 270,
          width: 760,
          padding: 30,
          transform: `translateX(${(1 - panel) * 300}px)`,
          opacity: panel,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, #C9B8FF, ${C.purple})`}} />
          <div style={{fontSize: 19, color: C.sub, fontWeight: 500}}>Operations agent</div>
          <div style={{marginLeft: 'auto', fontSize: 14, color: C.green, background: '#E6F6F1', padding: '5px 10px', borderRadius: 8, fontWeight: 600}}>
            Grounded
          </div>
        </div>
        <div style={{fontSize: 30, fontWeight: 650, margin: '18px 0 16px', letterSpacing: -0.6}}>Reconcile yesterday’s payouts</div>
        {steps.map((s) => (
          <div key={s.t} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, color: C.sub, marginBottom: 10, ...reveal(f, s.at - 10, 16, 10)}}>
            <Check on={prog(f, s.at, 14)} />
            {s.t}
          </div>
        ))}
        <div style={{marginTop: 18, padding: 20, borderRadius: 12, background: '#F6F6F7', fontSize: 21, lineHeight: 1.5, minHeight: 112, ...reveal(f, 124, 12, 8)}}>
          {ANSWER.slice(0, Math.min(chars, split))}
          {chars >= split && <Cite n={1} on={prog(f, 150, 10)} />}
          {chars > split && ANSWER.slice(split, chars)}
          {chars >= ANSWER.length && <Cite n={2} on={prog(f, 198, 10)} />}
          {chars < ANSWER.length && f > 124 && <span style={{display: 'inline-block', width: 2, height: 22, background: C.ink, marginLeft: 2, verticalAlign: 'middle', opacity: Math.floor(f / 8) % 2}} />}
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 14}}>
          {['1 · Payout_Policy.pdf §4.2', '2 · Vendor_Contract.pdf p.3'].map((s, i) => (
            <div key={s} style={{fontSize: 15, color: C.blue, border: `1px solid #CFE0FB`, background: '#F5F9FF', padding: '6px 10px', borderRadius: 8, ...reveal(f, 96 + i * 34, 14, 8)}}>
              {s}
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', marginTop: 22, gap: 12, opacity: approve, transform: `translateY(${(1 - approve) * 12}px)`}}>
          <div style={{fontSize: 19, color: approved ? C.green : C.amber, fontWeight: 600}}>{approved ? '✓ Approved by Finance' : '⧗ Waiting for approval'}</div>
          <div
            style={{
              marginLeft: 'auto',
              padding: '12px 26px',
              borderRadius: 10,
              background: approved ? C.green : C.blue,
              color: '#fff',
              fontSize: 19,
              fontWeight: 600,
              transform: `scale(${1 - Math.sin(click * Math.PI) * 0.08})`,
              boxShadow: `0 0 0 ${approved ? 0 : 6 + Math.sin(f / 5) * 4}px ${C.blue}22`,
            }}
          >
            {approved ? 'Approved' : 'Approve'}
          </div>
        </div>
      </Card>

      {/* cursor */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: lerp(1900, 1640, prog(f, 212, 24, inOut)),
          top: lerp(1080, 850, prog(f, 212, 24, inOut)),
          opacity: prog(f, 210, 6) * (1 - prog(f, 250, 8)),
          transform: `scale(${1 - Math.sin(click * Math.PI) * 0.15})`,
        }}
      >
        <path d="M4 2 L20 12 L12.5 13.5 L9 21 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" />
      </svg>
    </AbsoluteFill>
  );
};
