"""Synthesize a placeholder 128 BPM, 24-bar (45.0 s) loopable track.
Rendered into a circular buffer so release tails wrap into bar 1 (seamless loop).
Swap music.wav for a licensed track and re-run analyze.py; the timeline follows the measured grid."""
import numpy as np, wave
SR = 44100; BPM = 128; BEAT = 60 / BPM; BARS = 24
N = int(round(BARS * 4 * BEAT * SR)); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, t0, sig):
    s = int(round(t0 * SR)) % N; n = len(sig)
    a = min(n, N - s); buf[s:s + a] += sig[:a]
    if n > a: buf[:n - a] += sig[a:]
def bt(bar, beat=1.0): return ((bar - 1) * 4 + (beat - 1)) * BEAT
CH = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 55, 59, 62]]  # Dmaj9 Bm9 Gmaj9 A9sus
def chord(bar): return CH[((bar - 1) // 2) % 4]
# sidechain envelope from kicks
kicks = [bt(b, k) for b in range(4, 22) for k in (1, 2, 3, 4)]
duck = np.ones(N); tt = np.arange(N) / SR
for k in kicks:
    s = int(k * SR); n = int(0.3 * SR); e = 1 - 0.32 * np.exp(-np.arange(n) / SR / 0.11)
    idx = (s + np.arange(n)) % N; duck[idx] = np.minimum(duck[idx], e)
# pad
padL = np.zeros(N); padR = np.zeros(N)
for bar in range(1, BARS + 1, 2):
    dur = 2 * 4 * BEAT; rel = 1.4; n = int((dur + rel) * SR); t = np.arange(n) / SR
    env = np.minimum(1, t / 0.5) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.45))
    for m in chord(bar):
        for det, buf in ((-0.06, padL), (0.06, padR)):
            f = mf(m) * 2 ** (det / 12); s = np.zeros(n)
            for h in range(1, 9): s += np.sin(2 * np.pi * f * h * t + h) * np.exp(-h * 0.55) / h
            add(buf, bt(bar), 0.045 * env * s)
L += padL * duck; R += padR * duck
# bass
for bar in range(4, 22):
    root = chord(bar)[0] - 12
    for beat, d in ((1, .42), (3, .3), (4.5, .16)):
        n = int(d * SR + .2 * SR); t = np.arange(n) / SR; f = mf(root)
        env = np.minimum(1, t / .006) * np.exp(-t / (d * .7))
        s = (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)) * env * .2
        add(L, bt(bar, beat), s); add(R, bt(bar, beat), s)
# kick
n = int(.42 * SR); t = np.arange(n) / SR
ph = 2 * np.pi * np.cumsum(46 + 80 * np.exp(-t / .035)) / SR
kick = np.sin(ph) * np.exp(-t / .16) * .5
kick[:90] += rng.normal(0, .08, 90) * np.linspace(1, 0, 90)
for k in kicks: add(L, k, kick); add(R, k, kick)
# hats
def hat(lvl, tau):
    n = int(.06 * SR); w = rng.normal(0, 1, n); w = np.diff(np.diff(w, prepend=0), prepend=0)
    return w / 4 * np.exp(-np.arange(n) / SR / tau) * lvl
for bar in range(4, 22):
    for b in (1.5, 2.5, 3.5, 4.5):
        h = hat(.07, .014); add(L, bt(bar, b), h * .8); add(R, bt(bar, b), h)
    if bar >= 13:
        for b in (1.25, 1.75, 2.25, 2.75, 3.25, 3.75, 4.25, 4.75):
            h = hat(.025, .008); add(L, bt(bar, b), h); add(R, bt(bar, b), h * .7)
# clap
for bar in range(13, 22):
    for b in (2, 4):
        n = int(.18 * SR); t = np.arange(n) / SR; w = rng.normal(0, 1, n)
        w = np.convolve(w, np.sin(2 * np.pi * 1400 * np.arange(40) / SR), 'same') / 12
        env = sum(np.exp(-np.clip(t - o, 0, None) / .05) * (t >= o) for o in (0, .011, .022))
        add(L, bt(bar, b), w * env * .05); add(R, bt(bar, b), w * env * .05)
# pluck arp
pat = [0, 2, 1, 3, 2, 4, 3, 1]
for bar in range(8, 22):
    ch = chord(bar)
    for i in range(8):
        m = ch[pat[i] % 5] + 12; n = int(.4 * SR); t = np.arange(n) / SR; f = mf(m)
        s = (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t)) * np.exp(-t / .16) * np.minimum(1, t / .003) * .045
        pan = .3 if i % 2 else -.3
        add(L, bt(bar, 1 + i / 2), s * (1 - pan)); add(R, bt(bar, 1 + i / 2), s * (1 + pan))
mix = np.stack([L, R], 1); mix = np.tanh(mix * 1.4) / 1.4; mix *= .85 / np.abs(mix).max()
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav', N / SR, 's')
