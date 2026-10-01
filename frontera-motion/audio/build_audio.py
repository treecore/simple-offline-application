"""Builds the voice-over, score and SFX, then muxes them onto out/video.mp4.

Requires: piper-tts, numpy, scipy, ffmpeg.
Voice: Piper "ryan-high" (downloaded from the rhasspy/piper GitHub release if missing).
"""
import os
import subprocess
import urllib.request
import tarfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VOICES = os.path.join(HERE, "voices")
BUILD = os.path.join(HERE, "build")
SR = 48000
DUR = 45.0

VOICE = os.path.join(VOICES, "en-us-ryan-high.onnx")
VOICE_URL = "https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-ryan-high.tar.gz"

# (start seconds, length scale, text) — scene cuts in src/Root.tsx follow these starts
VO = [
    (0.4, 1.00, "Work is complex. Your AI platform shouldn't be."),
    (5.0, 0.95, "Frontera brings AI Agents, Apps, workflows, and reusable Blueprints together, on one shared foundation."),
    (13.2, 0.95, "Build Agents grounded in your organization's knowledge. Ready to review information, answer questions, and deliver results with citations."),
    (22.2, 0.95, "Coordinate repeatable processes with workflows that connect models, tools, decisions, integrations, and human action."),
    (30.4, 0.95, "Then bring intelligence wherever work happens. From Chat and custom Apps, to business channels, workflows, and APIs."),
    (37.8, 0.88, "From individual tasks to connected operations, Frontera helps your organization turn AI into real, governed work."),
]
CUTS = [5.0, 13.2, 22.2, 30.4, 37.8]
LOGO_HIT = 40.4


def ensure_voice():
    if os.path.exists(VOICE):
        return
    os.makedirs(VOICES, exist_ok=True)
    tgz = os.path.join(VOICES, "ryan.tgz")
    urllib.request.urlretrieve(VOICE_URL, tgz)
    with tarfile.open(tgz) as t:
        t.extractall(VOICES)
    os.remove(tgz)


def load(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float32) / 32768.0
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(sr, SR)
        x = resample_poly(x, SR // g, sr // g).astype(np.float32)
    return x


def synth_vo():
    track = np.zeros(int(SR * DUR), np.float32)
    spans = []
    for i, (start, ls, text) in enumerate(VO):
        out = os.path.join(BUILD, f"vo{i + 1}.wav")
        subprocess.run(
            ["python3", "-m", "piper", "-m", VOICE, "--length-scale", str(ls), "-f", out],
            input=text.encode(), check=True, capture_output=True,
        )
        x = load(out)
        a = int(start * SR)
        track[a:a + len(x)] += x[: len(track) - a]
        spans.append((start, start + len(x) / SR))
        print(f"VO {i + 1}: {start:.1f}s → {start + len(x) / SR:.2f}s")
    return track, spans


def lp(x, hz, order=2):
    b, a = butter(order, hz / (SR / 2), "low")
    return lfilter(b, a, x).astype(np.float32)


def hp(x, hz, order=2):
    b, a = butter(order, hz / (SR / 2), "high")
    return lfilter(b, a, x).astype(np.float32)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def adsr(n, a, r):
    e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def score():
    t = np.arange(int(SR * DUR)) / SR
    L = np.zeros_like(t, dtype=np.float32)
    R = np.zeros_like(t, dtype=np.float32)
    rng = np.random.default_rng(7)

    bpm = 96
    beat = 60 / bpm
    bar = beat * 4
    # D major-ish progression: Dmaj9, Bm9, Gmaj9, A6sus — two bars each
    chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 62], [45, 52, 54, 59, 64]]

    # Pad
    seg = bar * 2
    k = 0
    s = 0.0
    while s < DUR:
        ch = chords[k % 4]
        n = int(min(seg + 1.2, DUR - s) * SR)
        tt = np.arange(n) / SR
        env = adsr(n, 1.2, 1.4)
        for j, m in enumerate(ch):
            for det, pan in ((-0.07, 0.3), (0.07, 0.7)):
                f = midi(m) * 2 ** (det / 12)
                w = np.zeros(n, np.float32)
                for h in range(1, 6):
                    w += np.sin(2 * np.pi * f * h * tt + rng.random() * 6) / h ** 1.6
                w *= env * 0.022
                a = int(s * SR)
                L[a:a + n] += w * (1 - pan)
                R[a:a + n] += w * pan
        s += seg
        k += 1

    # Soft pluck arpeggio from 5s, gently brighter over time
    step = beat / 2
    i = 0
    tt = np.arange(int(0.6 * SR)) / SR
    while True:
        st = 5.0 + i * step
        if st > 44.0:
            break
        ch = chords[int((st) // seg) % 4]
        m = ch[[0, 2, 4, 3, 1, 3, 4, 2][i % 8]] + 12
        f = midi(m)
        w = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7)
        g = 0.035 + 0.02 * min(1, (st - 5) / 30)
        if 37.8 <= st < LOGO_HIT:
            g *= 0.4
        a = int(st * SR)
        n = min(len(w), len(t) - a)
        pan = 0.35 if i % 2 else 0.65
        L[a:a + n] += (w[:n] * g * (1 - pan)).astype(np.float32)
        R[a:a + n] += (w[:n] * g * pan).astype(np.float32)
        i += 1

    # Sub pulse on beats from 13.2s to the logo hit
    kick_t = np.arange(int(0.35 * SR)) / SR
    kick = np.sin(2 * np.pi * (48 + 60 * np.exp(-kick_t * 30)) * kick_t) * np.exp(-kick_t * 9)
    b0 = 13.2
    while b0 < LOGO_HIT - 0.3:
        a = int(b0 * SR)
        L[a:a + len(kick)] += kick * 0.12
        R[a:a + len(kick)] += kick * 0.12
        b0 += beat

    # Whooshes into each cut
    for c in CUTS:
        n = int(0.9 * SR)
        noise = rng.standard_normal(n).astype(np.float32)
        env = np.sin(np.linspace(0, np.pi, n)) ** 2
        w = hp(lp(noise, 3500), 300) * env * 0.09
        a = int((c - 0.55) * SR)
        L[a:a + n] += w
        R[a:a + n] += w[::-1] * 0.8 + w * 0.2

    # Riser into the logo + impact + shimmer
    n = int(2.2 * SR)
    a = int((LOGO_HIT - 2.2) * SR)
    rt = np.arange(n) / SR
    riser = hp(rng.standard_normal(n).astype(np.float32), 800) * (rt / rt[-1]) ** 3 * 0.07
    riser += np.sin(2 * np.pi * (200 + 600 * (rt / rt[-1]) ** 2) * rt) * (rt / rt[-1]) ** 3 * 0.02
    L[a:a + n] += riser
    R[a:a + n] += riser
    n = int(4.0 * SR)
    a = int(LOGO_HIT * SR)
    it = np.arange(n) / SR
    imp = np.sin(2 * np.pi * 45 * it) * np.exp(-it * 3) * 0.35
    shimmer = sum(np.sin(2 * np.pi * midi(m) * it) for m in (74, 78, 81, 86)) * np.exp(-it * 0.9) * 0.025
    n = min(n, len(t) - a)
    L[a:a + n] += (imp + shimmer)[:n]
    R[a:a + n] += (imp + shimmer * 1.1)[:n]

    # Master fades
    fade_in = np.clip(t / 0.6, 0, 1)
    fade_out = np.clip((DUR - t) / 1.5, 0, 1)
    L *= fade_in * fade_out
    R *= fade_in * fade_out
    return lp(L, 9000), lp(R, 9000)


def duck_env(spans):
    t = np.arange(int(SR * DUR)) / SR
    g = np.ones_like(t, dtype=np.float32)
    for a, b in spans:
        g = np.minimum(g, np.interp(t, [a - 0.25, a, b, b + 0.4], [1, 0.42, 0.42, 1], left=1, right=1))
    return g


def main():
    os.makedirs(BUILD, exist_ok=True)
    ensure_voice()
    vo, spans = synth_vo()
    L, R = score()
    g = duck_env(spans)
    vo = hp(vo, 90)
    mix = np.stack([L * g + vo * 0.9, R * g + vo * 0.9], axis=1)
    mix /= max(1e-6, np.abs(mix).max()) / 0.9
    raw = os.path.join(BUILD, "mix_raw.wav")
    wavfile.write(raw, SR, (mix * 32767).astype(np.int16))
    wavfile.write(os.path.join(BUILD, "vo.wav"), SR, (vo / np.abs(vo).max() * 0.9 * 32767).astype(np.int16))

    mix_out = os.path.join(ROOT, "out", "audio.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
         "acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=9",
         "-ar", str(SR), mix_out],
        check=True,
    )
    video = os.path.join(ROOT, "out", "video.mp4")
    final = os.path.join(ROOT, "out", "frontera-45s.mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", mix_out, "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", final],
        check=True,
    )
    print("Wrote", final)


if __name__ == "__main__":
    main()
