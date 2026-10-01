import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const C = {
  bg: '#F6F6F7',
  card: '#FFFFFF',
  line: '#E7E7EA',
  ink: '#16171A',
  sub: '#6B6E76',
  faint: '#A3A6AD',
  blue: '#0470E8',
  blueDeep: '#0751C4',
  blueSoft: '#E8F1FE',
  purple: '#7B5CF5',
  green: '#11A37F',
  orange: '#F0702A',
  red: '#E5484D',
  amber: '#E9A23B',
};

export const FONT = '"Inter", system-ui, sans-serif';

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 progress between start and start+dur with expo-out easing. */
export const prog = (f: number, start: number, dur: number, easing = expo) =>
  interpolate(f, [start, start + dur], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const useSpring = (delay: number, config = {damping: 16, mass: 0.7}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config});
};

/** Blur + fade + rise reveal. */
export const reveal = (f: number, start: number, dur = 22, dist = 24) => {
  const t = prog(f, start, dur);
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * dist}px)`,
    filter: `blur(${(1 - t) * 8}px)`,
  } as React.CSSProperties;
};

/** Fade + blur out. */
export const exit = (f: number, start: number, dur = 16) => {
  const t = prog(f, start, dur, inOut);
  return {opacity: 1 - t, filter: `blur(${t * 10}px)`} as React.CSSProperties;
};

export const Backdrop: React.FC<{glow?: string}> = ({glow = C.blue}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(#D9DADF 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundPosition: `${(f * 0.15) % 28}px ${(f * 0.1) % 28}px`,
          opacity: 0.55,
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          left: 410 + Math.sin(f / 70) * 80,
          top: -20 + Math.cos(f / 90) * 60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow}22 0%, transparent 65%)`,
          filter: 'blur(40px)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(16,17,20,0.04), 0 12px 32px -12px rgba(16,17,20,0.14)',
      fontFamily: FONT,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Eyebrow: React.FC<{children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({
  children,
  style,
  color = C.blue,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: 0.4,
      color,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      ...style,
    }}
  >
    <span style={{width: 8, height: 8, borderRadius: 4, background: color}} />
    {children}
  </div>
);

/** Word-by-word kinetic headline. */
export const Kinetic: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  highlight?: string[];
}> = ({text, start, stagger = 3, size = 72, weight = 600, color = C.ink, style, highlight = []}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: -size * 0.035,
        lineHeight: 1.08,
        color,
        display: 'flex',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        justifyContent: 'center',
        gap: `0 ${size * 0.26}px`,
        ...style,
      }}
    >
      {text.split(' ').map((w, i) => {
        const t = prog(f, start + i * stagger, 20);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - t) * 105}%)`,
                opacity: t,
                color: highlight.includes(w) ? C.blue : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Logo: React.FC<{size: number; build?: number}> = ({size, build = 1}) => {
  // build: 0→1 drives facet assembly
  const a = Math.min(1, build * 1.6);
  const b = Math.max(0, Math.min(1, (build - 0.25) * 1.6));
  const c = Math.max(0, Math.min(1, (build - 0.5) * 2));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="fl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A5BD8" />
          <stop offset="1" stopColor="#063F9E" />
        </linearGradient>
        <linearGradient id="fr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C86FF" />
          <stop offset="1" stopColor="#0866E0" />
        </linearGradient>
      </defs>
      <g style={{transformOrigin: '50px 50px', transform: `rotate(${(1 - a) * -60}deg) scale(${0.6 + a * 0.4})`, opacity: a}}>
        <path d="M50 4 L90 27 L90 50 L62 50 L50 30 L10 27 Z" fill="url(#fr)" />
        <path d="M10 27 L50 30 L38 50 L10 50 Z" fill="url(#fl)" />
      </g>
      <g style={{transformOrigin: '50px 50px', transform: `rotate(${(1 - b) * 60}deg) scale(${0.6 + b * 0.4})`, opacity: b}}>
        <path d="M50 96 L10 73 L10 50 L38 50 L50 70 L90 73 Z" fill="url(#fl)" />
        <path d="M90 73 L50 70 L62 50 L90 50 Z" fill="url(#fr)" />
      </g>
      <path
        d="M50 33 Q53 47 67 50 Q53 53 50 67 Q47 53 33 50 Q47 47 50 33 Z"
        fill="#FFFFFF"
        style={{transformOrigin: '50px 50px', transform: `scale(${c})`}}
      />
    </svg>
  );
};

export const Shot: React.FC<{src: string; style?: React.CSSProperties; width: number}> = ({src, style, width}) => (
  <div
    style={{
      width,
      borderRadius: 18,
      overflow: 'hidden',
      border: `1px solid ${C.line}`,
      boxShadow: '0 2px 4px rgba(16,17,20,0.05), 0 40px 80px -30px rgba(16,17,20,0.35)',
      background: '#fff',
      ...style,
    }}
  >
    <img src={src} style={{width: '100%', display: 'block'}} />
  </div>
);

export const Check: React.FC<{on: number; color?: string; size?: number}> = ({on, color = C.green, size = 22}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.8" />
    <path
      d="M7.5 12.5 L10.8 15.5 L16.5 9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="14"
      strokeDashoffset={14 * (1 - on)}
    />
  </svg>
);
