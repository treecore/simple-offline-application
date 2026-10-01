# Frontera — 45s motion video

Remotion (React) project: 1920×1080, 30fps, 45s, with a voice-over, score and SFX generated in code.

```
npm install
pip install piper-tts numpy scipy
npm run build          # renders out/video.mp4, then builds audio → out/frontera-45s.mp4
npm run studio         # live preview / scrub
```

- Scenes: `src/scenes/S1–S6`, cut points in `src/Root.tsx` (`CUTS`), locked to the VO starts in `audio/build_audio.py`.
- Brand tokens, easing, the logo mark: `src/lib.tsx`. The `<Logo>` is a vector rebuild of the app-bar mark; swap in the official SVG there.
- Product screenshots: `public/shots/`.
- VO: Piper TTS "ryan-high" (offline). To use a pro or ElevenLabs read, drop the WAVs into `audio/build/vo1..6.wav` and skip `synth_vo`.
