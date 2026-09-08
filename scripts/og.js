/* Génère les images Open Graph (1200×630) affichées lors du partage d'un lien.
   Ajouter une entrée dans `pages` par nouveau test, puis :  node scripts/og.js
   Prérequis : npm i playwright && npx playwright install chromium */
const { chromium } = require('playwright');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'img') + path.sep;

const shell = (inner) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#06070c;color:#e9edf6;
  font-family:Inter,system-ui,sans-serif;position:relative;overflow:hidden}
.aurora{position:absolute;inset:0;background:
  radial-gradient(700px 500px at 8% -10%, rgba(94,234,212,.22), transparent 60%),
  radial-gradient(700px 500px at 95% 0%, rgba(167,139,250,.26), transparent 62%),
  radial-gradient(900px 600px at 50% 115%, rgba(96,165,250,.22), transparent 65%)}
.grid{position:absolute;inset:0;opacity:.5;
  background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:60px 60px;
  -webkit-mask-image:radial-gradient(circle at 50% 0%,#000 0%,transparent 75%)}
.in{position:relative;height:100%;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:16px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;letter-spacing:-.03em}
.mark{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;color:#05070c;font-size:26px;font-weight:800;
  background:linear-gradient(120deg,#5eead4,#60a5fa 48%,#a78bfa)}
.gr{background:linear-gradient(120deg,#5eead4,#60a5fa 48%,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
h1{font-family:'Space Grotesk',sans-serif;font-size:62px;line-height:1.08;letter-spacing:-.035em;max-width:17ch}
.lead{color:#aeb6c8;font-size:25px;margin-top:22px;max-width:38ch;line-height:1.45}
.tag{display:inline-flex;align-items:center;gap:11px;padding:11px 22px;border-radius:999px;font-size:16px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:#5eead4;border:1px solid rgba(94,234,212,.32);background:rgba(94,234,212,.08)}
.dot{width:9px;height:9px;border-radius:50%;background:#5eead4;box-shadow:0 0 12px #5eead4}
.row{display:flex;align-items:flex-end;justify-content:space-between;gap:48px}
.score{flex:none;width:190px;height:190px;border-radius:50%;display:grid;place-items:center;position:relative;
  background:conic-gradient(from 180deg,#5eead4 0%,#60a5fa 41%,#a78bfa 74%,rgba(255,255,255,.08) 74%)}
.score::before{content:"";position:absolute;inset:13px;border-radius:50%;background:#0a0c14;border:1px solid rgba(255,255,255,.09)}
.sv{position:relative;font-family:'Space Grotesk',sans-serif;font-size:56px;font-weight:700;letter-spacing:-.04em}
.sv sub{font-size:21px;color:#7b8398;font-weight:500;vertical-align:baseline}
.foot{color:#7b8398;font-size:20px}
</style></head><body><div class="aurora"></div><div class="grid"></div><div class="in">${inner}</div></body></html>`;

const pages = [
  { file: 'og-testbench.png', html: shell(`
    <div class="brand"><span class="mark">T</span><span>Test<span class="gr">Bench</span></span></div>
    <div>
      <span class="tag"><span class="dot"></span> Tests longue durée</span>
      <h1 style="margin-top:26px">Le banc d'essai des produits qu'on <span class="gr">utilise vraiment</span>.</h1>
    </div>
    <div class="foot">Testé plusieurs semaines à la maison · Avis indépendants, jamais sponsorisés</div>`) },

  { file: 'og-dreame-aqua10-ultra-roller-complete.png', html: shell(`
    <div class="brand"><span class="mark">T</span><span>Test<span class="gr">Bench</span></span></div>
    <div class="row">
      <div>
        <span class="tag"><span class="dot"></span> Robot aspirateur</span>
        <h1 style="margin-top:26px;font-size:56px">Dreame Aqua10 Ultra Roller Complete</h1>
        <p class="lead">Mon avis après plusieurs semaines d'utilisation avec un chat à la maison.</p>
      </div>
      <div class="score"><span class="sv">7,4<sub>/10</sub></span></div>
    </div>
    <div class="foot">Aspiration solide, brosse démêlante excellente — entretien contraignant</div>`) },
];

(async () => {
  // CHROMIUM_PATH permet de viser un Chromium déjà installé sur la machine.
  const exe = process.env.CHROMIUM_PATH;
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const { file, html } of pages) {
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    await p.screenshot({ path: OUT + file });
    console.log('écrit', file);
  }
  await b.close();
})();
