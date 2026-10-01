const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const snap = async t => { await p.evaluate(t => seek(t), t); return p.screenshot({ type: 'png' }); };
  const fs = require('fs');
  for (const [n, t] of [['a', 0], ['b', 44.99999], ['c', 1 / 60], ['d', 45 - 1 / 60]]) fs.writeFileSync(`stills/seam_${n}.png`, await snap(t));
  const st = await p.evaluate(() => { const g = t => { seek(t); return [document.getElementById('cursor').style.transform, document.getElementById('hero').style.transform, document.getElementById('world').style.transform]; }; return [g(0), g(44.9999), g(1/60), g(45-1/60)]; });
  console.log(st.join('\n'));
  await b.close();
})();
