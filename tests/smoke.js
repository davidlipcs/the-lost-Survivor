// Füst-teszt a VALÓDI játékhurokkal (Playwright + a gépi Chrome).
// Használat: node tests/smoke.js <url> <kimeneti mappa> [szélesség] [magasság]
// Kilépési kód 1, ha bármelyik ellenőrzés elbukik.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://localhost:8901/index.html';
const out = process.argv[3] || 'shots/smoke';
const W = +process.argv[4] || 1280, H = +process.argv[5] || 720;
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(out, { recursive: true });

const results = [];
function check(name, ok, info){ results.push({ name, ok: !!ok, info }); console.log((ok ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? '  -> ' + JSON.stringify(info) : '')); }

(async()=>{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  page.on('console', m => { if(m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  // gazdag profil: minden hős megvan, a súgó már látott -> a teljes készlet tesztelhető
  await page.addInitScript(() => {
    const prof = { xp: 260*40, seenGuide: true, coins: 9000, shards: 900, totalRuns: 3,
      ownedHeroes: ['tank','sniper','berserker','mage','assassin','necromancer','hunter','engineer'],
      settings: { sfxVol: 0, musVol: 0 } };
    localStorage.setItem('kilencpecset_profile_v4', JSON.stringify(prof));
  });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const shot = (n) => page.screenshot({ path: path.join(out, n + '.png') });
  const heroClip = async (name, size = 300) => {
    const c = await page.evaluate(() => { const s = arenaToScreen(game.player.x, game.player.y); return { x: s.x, y: s.y }; });
    await page.screenshot({ path: path.join(out, name + '.png'), clip: { x: Math.max(0, c.x - size/2), y: Math.max(0, c.y - size*0.65), width: size, height: size } });
  };

  // --- főmenü ---
  check('startScreen látszik', await page.evaluate(() => !document.getElementById('startScreen').classList.contains('hidden')));
  await shot('01-menu');

  // --- hősválasztó: minden kártya végigkattintva ---
  await page.click('#heroSelectOpenBtn'); await page.waitForTimeout(400);
  await shot('02-heroselect');
  const cardCount = await page.locator('.classCard:not(.locked)').count();
  check('hőskártyák száma', cardCount >= 8, cardCount);
  for(let i = 0; i < cardCount; i++){
    // a kattintás újraépíti a sort, ezért minden körben frissen kérjük le az elemet
    await page.locator('.classCard:not(.locked)').nth(i).click(); await page.waitForTimeout(160);
  }
  const selCls = await page.evaluate(() => chosenClass);
  check('utolsó kártya kiválasztva', !!selCls, selCls);
  // kinézetek
  const skins = await page.$$('#heroLookRow .skinOpt');
  check('kinézet-opciók', skins.length >= 4, skins.length);
  await page.waitForTimeout(700);
  await shot('03-heroselect-last');
  await page.screenshot({ path: path.join(out, '03b-heroselect-full.png'), fullPage: true });
  // vissza a tankra, hogy a játék-teszt kiszámítható legyen
  await page.evaluate(() => setClass('tank'));
  await page.click('#heroSelectBackBtn'); await page.waitForTimeout(200);

  // --- játék ---
  await page.click('#startBtn'); await page.waitForTimeout(600);
  check('játék fut', await page.evaluate(() => !!game && game.state === 'playing'));
  await heroClip('04-hero-idle');
  // mozgás 4 irányba + lövés + képességek
  const keysSeq = ['d','s','a','w'];
  for(const k of keysSeq){ await page.keyboard.down(k); await page.waitForTimeout(500); await heroClip('05-walk-' + k); await page.keyboard.up(k); }
  await page.mouse.move(W*0.72, H*0.5); await page.mouse.down();
  await page.waitForTimeout(150); await heroClip('06-attack');
  for(const k of ['q','e','r','f','c','h']){ await page.keyboard.press(k); await page.waitForTimeout(90); }
  await page.waitForTimeout(2500);
  await page.mouse.up();
  await shot('07-ingame');
  // várunk, hogy legyen ellenfél és öljünk is
  let st = await page.evaluate(() => ({ en: game.enemies.length, kills: game.killsThisRun, wave: game.wave, err: window.__loopErrors||0 }));
  for(let i = 0; i < 12 && st.kills < 1; i++){
    await page.mouse.down();
    // a legközelebbi ellenfél felé célzunk
    const aim = await page.evaluate(() => { const p = game.player; let b = null, bd = 1e9; for(const e of game.enemies){ const d = Math.hypot(e.x-p.x, e.y-p.y); if(d < bd){ bd = d; b = e; } } if(!b) return null; const s = arenaToScreen(b.x, b.y); return { x: s.x, y: s.y }; });
    if(aim) await page.mouse.move(Math.max(2, Math.min(W-2, aim.x)), Math.max(2, Math.min(H-2, aim.y)));
    await page.waitForTimeout(700);
    st = await page.evaluate(() => ({ en: game.enemies.length, kills: game.killsThisRun, wave: game.wave, err: window.__loopErrors||0 }));
  }
  await page.mouse.up();
  check('ellenfelek és ölés', st.kills >= 1, st);
  const near = await page.evaluate(() => { const p = game.player; let b = null, bd = 1e9; for(const e of game.enemies){ const d = Math.hypot(e.x-p.x, e.y-p.y); if(d < bd){ bd = d; b = e; } } if(!b) return null; const s = arenaToScreen(b.x, b.y); return { x: s.x, y: s.y, type: b.type }; });
  if(near) await page.screenshot({ path: path.join(out, '08-enemy.png'), clip: { x: Math.max(0, near.x-150), y: Math.max(0, near.y-190), width: 300, height: 300 } });
  // FPS mérés 60 ellenféllel
  await page.evaluate(() => { for(let i = 0; i < 60; i++) spawnEnemyType(['grunt','scout','tank','sniper','charger','bomber'][i%6]); });
  await page.waitForTimeout(400);
  const fps = await page.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); (function f(){ n++; if(performance.now() - t0 > 2000) r(Math.round(n/2)); else requestAnimationFrame(f); })(); }));
  check('fps 60+ ellenféllel', fps >= 30, fps);
  await shot('09-crowd');
  const errNow = await page.evaluate(() => window.__loopErrors || 0);
  check('nincs hurok-hiba', errNow === 0, errNow);

  // --- boss: kényszerített átmenet ---
  await page.evaluate(() => { game.enemies = []; game.pendingSpawns = []; game.wave = MAX_WAVES; game.endless = false; });
  await page.waitForTimeout(400);
  const bossIntro = await page.evaluate(() => !document.getElementById('bossIntro').classList.contains('hidden'));
  check('boss-intro megjelent', bossIntro);
  await shot('10-bossintro');
  if(bossIntro){ await page.click('#bossStartBtn'); await page.waitForTimeout(1600); }
  check('boss a pályán', await page.evaluate(() => !!game.boss));
  await shot('11-boss');
  const bc = await page.evaluate(() => { const b = game.boss; if(!b) return null; const s = arenaToScreen(b.x, b.y); return { x: s.x, y: s.y }; });
  if(bc) await page.screenshot({ path: path.join(out, '11b-boss-close.png'), clip: { x: Math.max(0, bc.x-200), y: Math.max(0, bc.y-240), width: 400, height: 400 } });
  await page.evaluate(() => { if(game.boss) game.boss.hp = 0; });
  await page.waitForTimeout(500);
  check('győzelem-képernyő', await page.evaluate(() => !document.getElementById('winScreen').classList.contains('hidden')));
  await shot('12-win');
  // végtelen mód + halál
  await page.click('#endlessBtn'); await page.waitForTimeout(500);
  check('végtelen mód fut', await page.evaluate(() => game && game.endless && game.state === 'playing'));
  await page.evaluate(() => { game.player.hp = 0; });
  await page.waitForTimeout(400);
  check('halál-képernyő', await page.evaluate(() => !document.getElementById('deathScreen').classList.contains('hidden')));
  await shot('13-death');
  await page.click('#deathMenuBtn'); await page.waitForTimeout(300);
  check('vissza a főmenübe', await page.evaluate(() => !document.getElementById('startScreen').classList.contains('hidden')));

  // --- szünet / beállítások / trófeák / létra ---
  await page.click('#startBtn'); await page.waitForTimeout(400);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check('szünet', await page.evaluate(() => game.state === 'paused'));
  await shot('14-pause');
  await page.click('#pauseSettingsBtn'); await page.waitForTimeout(200);
  await shot('15-settings');
  await page.click('#settingsBackBtn'); await page.waitForTimeout(200);
  await page.click('#resumeBtn'); await page.waitForTimeout(200);
  check('folytatás', await page.evaluate(() => game.state === 'playing'));
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.click('#pauseMenuBtn').catch(()=>{});
  await page.waitForTimeout(300);
  await page.evaluate(() => { if(game) goMenu(); });
  await page.waitForTimeout(200);
  await page.click('#trophyOpenBtn'); await page.waitForTimeout(200); await shot('16-trophies');
  await page.click('#trophyBackBtn'); await page.waitForTimeout(150);
  await page.click('#ladderToggleBtnTL'); await page.waitForTimeout(200); await shot('17-ladder');
  await page.click('#ladderBackBtn'); await page.waitForTimeout(150);
  // sztori mód térkép
  await page.click('#storyModeBtn'); await page.waitForTimeout(400); await shot('18-story');
  const storyScreen = await page.evaluate(() => ['heroSelectScreen','mapScreen','conquestScreen'].find(id => !document.getElementById(id).classList.contains('hidden')));
  check('sztori-képernyő', !!storyScreen, storyScreen);
  if(storyScreen === 'heroSelectScreen'){ await page.click('#storyProceedBtn'); await page.waitForTimeout(400); await shot('18b-map'); }
  // nyelvváltás
  await page.evaluate(() => showScreen('startScreen'));
  await page.click('#langToggleBtn'); await page.waitForTimeout(300);
  check('angol felirat', (await page.innerText('#startBtn')).toUpperCase().includes('PLAY'));
  await shot('19-menu-en');
  await page.click('#langToggleBtn'); await page.waitForTimeout(200);

  const errFinal = await page.evaluate(() => window.__loopErrors || 0);
  check('nincs hurok-hiba (vége)', errFinal === 0, errFinal);
  check('nincs oldal-hiba', errs.length === 0, errs.slice(0, 5));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} zöld`);
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ results, errs }, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('TESZT-HIBA', e); process.exit(1); });
