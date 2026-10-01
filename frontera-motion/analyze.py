"""Measure beat grid with numpy: spectral-flux onset envelope -> autocorrelation tempo ->
comb-filter phase -> downbeat from low-mid harmonic change. Writes beats.json."""
import numpy as np, wave, json, sys
fn = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
with wave.open(fn) as w:
    sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float).reshape(-1, ch).mean(1) / 32768
hop, nf = 256, 2048
fr = np.lib.stride_tricks.sliding_window_view(np.pad(x, (nf // 2, nf)), nf)[::hop] * np.hanning(nf)
M = np.log1p(100 * np.abs(np.fft.rfft(fr, axis=1)))
freqs = np.fft.rfftfreq(nf, 1 / sr); fps = sr / hop
flux = np.maximum(0, np.diff(M, axis=0, prepend=M[:1])).sum(1); flux -= np.convolve(flux, np.ones(16) / 16, 'same'); flux = np.maximum(flux, 0)
ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
lags = np.arange(len(ac)); bpms = 60 * fps / np.maximum(lags, 1)
ok = (bpms > 70) & (bpms < 180); lag = lags[ok][np.argmax(ac[ok])]
cand = np.arange(60 * fps / (lag + 1), 60 * fps / (lag - 1), .01)
def comb(bpm, ph=None):
    per = 60 / bpm * fps; best = (-1, 0)
    for p in (np.arange(0, per, .5) if ph is None else [ph]):
        idx = np.round(np.arange(p, len(flux) - 1, per)).astype(int); s = flux[idx].mean()
        if s > best[0]: best = (s, p)
    return best
scores = [comb(b)[0] for b in cand]; bpm = float(cand[int(np.argmax(scores))])
if abs(bpm - round(bpm)) < .08: bpm = float(round(bpm))
_, ph = comb(bpm); per = 60 / bpm * fps
# downbeat: harmonic novelty. Compare the mean spectrum of the beat after each candidate
# with the beat before it; chord and section changes land on downbeats.
P = M[:, (freqs > 60) & (freqs < 2000)]
def seg(a, b): return P[max(0, int(a)):max(int(a) + 1, int(b))].mean(0)
beats = np.arange(ph, len(P) - per, per)
nov = np.array([1 - np.dot(u := seg(b - per, b), v := seg(b, b + per)) / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-9)
                for b in beats])
best = int(np.argmax([nov[k::4].mean() for k in range(4)]))
first_down = (ph + best * per) / fps
beat = 60 / bpm; first_down %= 4 * beat
if first_down > 4 * beat - .03: first_down = 0.0
res = dict(bpm=bpm, beat=beat, first_downbeat=round(first_down, 4), duration=len(x) / sr,
           bars=round((len(x) / sr - first_down) / (4 * beat), 3))
json.dump(res, open('beats.json', 'w'), indent=1); print(res)
