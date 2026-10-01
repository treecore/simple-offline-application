# Frontera — 45s motion loop (1440×1080, 60 fps)

`Frontera_45s_4x3.mp4` is the deliverable. Everything is a pure function of time in `index.html` (`seek(t)`).

Pipeline
1. `python3 music.py` — placeholder 128 BPM track (swap `music.wav` for a licensed track).
2. `python3 analyze.py [music.wav]` — numpy beat grid → `beats.json` (BPM + first downbeat).
3. `python3 build.py` — inlines fonts, logo and grid into `index.html` from `template.html`.
4. `node beats.js` — one still per beat in `stills/` for review.
5. `node render.js 4` — 4 subframes/frame, tmix motion blur, 4 parallel workers → `out/seg*.mp4`, `out/sfx.json`.
6. `python3 mix.py` — UI sounds placed by measured peak over the music → `mix.wav`.
7. `ffmpeg -f concat -safe 0 -i out/list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest Frontera_45s_4x3.mp4`
