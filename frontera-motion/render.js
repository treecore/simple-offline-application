// Full render: 60 fps, 4 subframes per frame (180° shutter), blended with ffmpeg tmix.
// Usage: node render.js [workers=4]  -> out/seg*.mp4, out/sfx.json
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const FPS = 60, SUB = 4, W = +process.argv[2] || 4;
fs.mkdirSync('out', { recursive: true });
async function worker(id, f0, f1) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  if (id === 0) fs.writeFileSync('out/sfx.json', JSON.stringify(await p.evaluate(() => ({ dur: window.DUR, sfx: window.SFX }))));
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', `out/seg${id}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    for (let k = 0; k < SUB; k++) {
      const t = (f + ((k + .5) / SUB - .5) * .5) / FPS;
      await p.evaluate(t => seek(t), t);
      const buf = await p.screenshot({ type: 'jpeg', quality: 96 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (id === 0 && (f - f0) % 60 === 0) console.log(`w0 ${f - f0}/${f1 - f0} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
}
(async () => {
  const total = Math.round(45 * FPS), per = Math.ceil(total / W);
  await Promise.all([...Array(W)].map((_, i) => worker(i, i * per, Math.min(total, (i + 1) * per))));
  fs.writeFileSync('out/list.txt', [...Array(W)].map((_, i) => `file 'seg${i}.mp4'`).join('\n'));
  console.log('done');
})();
