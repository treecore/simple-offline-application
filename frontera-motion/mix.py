"""Synthesize UI sounds and place each one by its measured peak (argmax |x|) on the event time.
Mixes over music.wav circularly so the loop seam stays clean. Writes mix.wav."""
import numpy as np, wave, json
SR = 44100; rng = np.random.default_rng(3)
def t_(d): return np.arange(int(d * SR)) / SR
def env(t, a, tau): return np.minimum(1, t / a) * np.exp(-t / tau)
def hp(x): return np.diff(x, prepend=0)
def lp(x, k=6): return np.convolve(x, np.ones(k) / k, 'same')
def snd(kind):
    if kind == 'click':
        t = t_(.08); return .55 * (np.sin(2 * np.pi * 2350 * t) * env(t, .0008, .011) + .6 * hp(rng.normal(0, 1, len(t))) * env(t, .0003, .003))
    if kind == 'release':
        t = t_(.06); return .3 * np.sin(2 * np.pi * 1650 * t) * env(t, .0008, .009)
    if kind == 'tick':
        t = t_(.12); return .3 * (np.sin(2 * np.pi * 1760 * t) + .4 * np.sin(2 * np.pi * 2640 * t)) * env(t, .001, .028)
    if kind == 'pop':
        t = t_(.14); f = 520 + 420 * np.exp(-t / .02); return .4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, .002, .04)
    if kind == 'snap':
        t = t_(.1); return .5 * (np.sin(2 * np.pi * 1180 * t) * env(t, .0006, .018) + .5 * hp(rng.normal(0, 1, len(t))) * env(t, .0003, .004))
    if kind == 'type':
        t = t_(.03); return .18 * (lp(rng.normal(0, 1, len(t)), 3) * env(t, .0003, .003) + .5 * np.sin(2 * np.pi * 3100 * t) * env(t, .0004, .004))
    if kind == 'morph':
        t = t_(.32); n = lp(rng.normal(0, 1, len(t)), 18)
        return .5 * n * np.sin(np.pi * np.clip(t / .3, 0, 1)) ** 2 * .6
    if kind == 'success':
        t = t_(.5); a = np.sin(2 * np.pi * 1318.5 * t) * env(t, .002, .12)
        b = np.zeros_like(t); o = int(.085 * SR); b[o:] = np.sin(2 * np.pi * 1760 * t[:-o]) * env(t[:-o], .002, .16)
        return .22 * (a + b)
with wave.open('music.wav') as w:
    m = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float).reshape(-1, 2) / 32768
N = len(m); fx = np.zeros(N)
spec = json.load(open('out/sfx.json'))
lib = {}
for e in spec['sfx']:
    s = lib.setdefault(e['type'], snd(e['type']))
    peak = int(np.argmax(np.abs(s)))
    start = int(round(e['t'] * SR)) - peak
    idx = (start + np.arange(len(s))) % N
    np.add.at(fx, idx, s * e['gain'])
out = m * .78 + fx[:, None] * .5
out = np.tanh(out * 1.1) / 1.1; out *= .89 / np.abs(out).max()
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print(len(spec['sfx']), 'sfx placed;', {k: int(np.argmax(np.abs(v))) for k, v in lib.items()}, 'peak offsets (samples)')
