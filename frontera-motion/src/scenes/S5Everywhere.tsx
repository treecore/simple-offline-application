import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, C, Card, Eyebrow, FONT, Kinetic, Logo, inOut, prog, reveal, useSpring} from '../lib';

const Crop: React.FC<{src: string; sx: number; sy: number; sw: number; w: number; h: number}> = ({src, sx, sy, sw, w, h}) => {
  const k = w / sw;
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', borderRadius: 10}}>
      <img src={src} style={{position: 'absolute', width: 2000 * k, left: -sx * k, top: -sy * k}} />
    </div>
  );
};

const Label: React.FC<{t: string; color: string}> = ({t, color}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 650, color, marginBottom: 12}}>
    <span style={{width: 8, height: 8, borderRadius: 4, background: color}} />
    {t}
  </div>
);

const SURF = [
  {key: 'chat', at: 92, x: 110, y: 250, w: 580, h: 340, color: C.purple},
  {key: 'app', at: 114, x: 110, y: 650, w: 580, h: 340, color: C.green},
  {key: 'channels', at: 140, x: 1230, y: 250, w: 580, h: 340, color: C.orange},
  {key: 'api', at: 182, x: 1230, y: 650, w: 580, h: 340, color: C.ink},
  {key: 'flow', at: 162, x: 760, y: 820, w: 400, h: 150, color: C.orange},
];

export const S5Everywhere: React.FC = () => {
  const f = useCurrentFrame();
  const core = useSpring(10, {damping: 16, mass: 0.8});
  const out = prog(f, 204, 18, inOut);
  const cx = 960;
  const cy = 550;

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{transform: `scale(${1 - out * 0.4})`, opacity: 1 - out, filter: `blur(${out * 6}px)`}}>
        <div style={{position: 'absolute', top: 96, width: '100%', display: 'grid', placeItems: 'center', gap: 16}}>
          <div style={reveal(f, 2)}>
            <Eyebrow>One agent, every surface</Eyebrow>
          </div>
          <Kinetic text="Wherever work happens." start={8} size={60} stagger={4} highlight={['happens.']} />
        </div>

        <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
          {SURF.map((s) => {
            const tx = s.x + s.w / 2;
            const ty = s.y + s.h / 2;
            const ex = tx < cx - 10 ? s.x + s.w : tx > cx + 10 ? s.x : tx;
            const ey = tx < cx - 10 || tx > cx + 10 ? ty : s.y;
            const t = prog(f, s.at - 6, 18, inOut);
            const len = 700;
            const pulse = ((f - s.at) / 30) % 1;
            return (
              <g key={s.key}>
                <path
                  d={`M${cx} ${cy} L${ex} ${ey}`}
                  stroke={C.blue}
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - t)}
                />
                {t >= 1 && <circle cx={cx + (ex - cx) * pulse} cy={cy + (ey - cy) * pulse} r="5" fill={C.blue} opacity={Math.sin(pulse * Math.PI)} />}
              </g>
            );
          })}
        </svg>

        {SURF.map((s) => {
          const sp = useSpring(s.at, {damping: 15, mass: 0.7});
          const dx = (cx - (s.x + s.w / 2)) * (1 - sp);
          const dy = (cy - (s.y + s.h / 2)) * (1 - sp);
          return (
            <Card
              key={s.key}
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.w,
                height: s.h,
                padding: 20,
                overflow: 'hidden',
                opacity: Math.min(1, sp * 1.4),
                transform: `translate(${dx}px, ${dy}px) scale(${0.4 + sp * 0.6})`,
                background: s.key === 'api' ? '#121317' : '#fff',
                borderColor: s.key === 'api' ? '#25272E' : C.line,
              }}
            >
              {s.key === 'chat' && (
                <>
                  <Label t="Chat" color={C.purple} />
                  <Crop src={staticFile('shots/chat.webp')} sx={380} sy={420} sw={820} w={540} h={262} />
                </>
              )}
              {s.key === 'app' && (
                <>
                  <Label t="Custom Apps" color={C.green} />
                  <Crop src={staticFile('shots/console-metrics.webp')} sx={582} sy={272} sw={1188} w={540} h={262} />
                </>
              )}
              {s.key === 'channels' && (
                <>
                  <Label t="Business channels" color={C.orange} />
                  <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
                    {['WhatsApp', 'Slack', 'Email', 'Web widget'].map((c) => (
                      <span key={c} style={{fontSize: 15, padding: '5px 10px', borderRadius: 8, background: '#F3F3F5', color: C.sub}}>
                        {c}
                      </span>
                    ))}
                  </div>
                  {[
                    {me: true, t: 'Is order #4821 shipped yet?'},
                    {me: false, t: 'Yes, it left Surabaya this morning. ETA Friday.'},
                  ].map((m, i) => (
                    <div
                      key={i}
                      style={{
                        maxWidth: 380,
                        marginLeft: m.me ? 'auto' : 0,
                        marginBottom: 10,
                        padding: '12px 16px',
                        borderRadius: 14,
                        fontSize: 18,
                        background: m.me ? C.ink : '#F1F1F3',
                        color: m.me ? '#fff' : C.ink,
                        ...reveal(f, s.at + 10 + i * 12, 14, 10),
                      }}
                    >
                      {m.t}
                    </div>
                  ))}
                </>
              )}
              {s.key === 'api' && (
                <div style={{fontFamily: '"SFMono-Regular", Menlo, monospace', fontSize: 19, lineHeight: 1.6, color: '#C9CDD6'}}>
                  <div style={{fontFamily: FONT, fontSize: 17, fontWeight: 650, color: '#8FB8FF', marginBottom: 12}}>● API</div>
                  <div>
                    <span style={{color: '#7EE2B8'}}>POST</span> /v1/agents/operations/run
                  </div>
                  <div style={{color: '#7C8090'}}>{'{'}</div>
                  <div>&nbsp;&nbsp;<span style={{color: '#F7C177'}}>"input"</span>: "Reconcile payouts"</div>
                  <div style={{color: '#7C8090'}}>{'}'}</div>
                  <div style={{marginTop: 10, color: '#7EE2B8', ...reveal(f, s.at + 14, 12, 6)}}>→ 200 OK · 3 exceptions · cited</div>
                </div>
              )}
              {s.key === 'flow' && (
                <>
                  <Label t="Workflows" color={C.orange} />
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    {['Trigger', 'Agent', 'Approve'].map((n, i) => (
                      <React.Fragment key={n}>
                        <span style={{fontSize: 16, padding: '7px 12px', borderRadius: 8, background: i === 1 ? C.blue : '#FFF0E6', color: i === 1 ? '#fff' : C.orange, fontWeight: 600}}>
                          {n}
                        </span>
                        {i < 2 && <span style={{color: C.faint}}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </Card>
          );
        })}

        <Card
          style={{
            position: 'absolute',
            left: cx - 170,
            top: cy - 64,
            width: 340,
            height: 128,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 26px',
            transform: `scale(${core})`,
            boxShadow: `0 0 0 ${10 + Math.sin(f / 9) * 5}px ${C.blue}14, 0 30px 70px -20px ${C.blue}88`,
          }}
        >
          <Logo size={64} />
          <div>
            <div style={{fontSize: 16, color: C.sub, fontWeight: 500}}>Agent</div>
            <div style={{fontSize: 26, fontWeight: 650, letterSpacing: -0.4}}>Operations</div>
          </div>
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
