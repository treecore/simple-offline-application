// Render one still per beat (96) into stills/, plus contact sheets. Usage: node beats.js
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('stills', { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const beats = JSON.parse(fs.readFileSync('beats.json'));
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  for (let i = 0; i < 96; i++) {
    if (only && !only.includes(i)) continue;
    const t = beats.first_downbeat + i * beats.beat + (+process.argv[3] || 0.4) ;
    await p.evaluate(t => seek(t), t);
    await p.screenshot({ path: `stills/b${String(i).padStart(2, '0')}.png` });
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 5));
  await b.close();
})();
