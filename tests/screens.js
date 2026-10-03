// Képernyő-sweep: menü, kártya-rámutatás, diadal-kép, bossok közelről, telefon-méretek.
// Használat: node tests/screens.js <url> <kimeneti mappa>
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const url = process.argv[2] || 'http://localhost:8901/index.html';
const out = process.argv[3] || 'shots/screens';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(out, { recursive: true });
const PROFILE = { xp: 260*40, seenGuide: true, coins: 9000, shards: 900, totalRuns: 3,
  ownedHeroes: ['tank','sniper','berserker','mage','assassin','necromancer','hunter','engineer'], companion: 'sniper',
  settings: { sfxVol: 0, musVol: 0 } };
(async()=>{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
  const errs = [];
  const open = async (w, h) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    page.on('console', m => { if(m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
    await page.addInitScript((p) => { localStorage.setItem('kilencpecset_profile_v4', JSON.stringify(p)); }, PROFILE);
    await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(400);
    return page;
  };
  const shot = (page, n) => page.screenshot({ path: path.join(out, n + '.png') });

  // --- asztali ---
  let page = await open(1280, 720);
  await page.waitForTimeout(2200);
  await shot(page, 'd01-menu-2s');
  await page.click('#heroSelectOpenBtn'); await page.waitForTimeout(500);
  await page.locator('.classCard:not(.locked)').nth(2).hover(); await page.waitForTimeout(700);
  await shot(page, 'd02-heroselect-hover');
  await page.locator('.classCard:not(.locked)').nth(2).click(); await page.waitForTimeout(260);
  await shot(page, 'd03-heroselect-flourish');
  await page.locator('#heroLookRow .skinOpt').nth(2).click().catch(()=>{}); await page.waitForTimeout(300);
  await page.locator('#headRow .headOpt').nth(4).click(); await page.waitForTimeout(300);
  await shot(page, 'd04-heroselect-skin-head');
  // diadal-kép
  await page.evaluate(() => { showScreen('tableauScreen'); renderVictoryTableau(); }); await page.waitForTimeout(400);
  await shot(page, 'd05-tableau');
  // bossok közelről
  await page.evaluate(() => { showScreen('startScreen'); });
  await page.click('#startBtn'); await page.waitForTimeout(500);
  const bossShot = async (name, type, col) => {
    await page.evaluate(({type, col}) => {
      game.enemies = []; game.pendingSpawns = []; game.wave = 12; game.endless = false;
      spawnBoss(false); game.boss.type = type; game.boss.col = col; game.boss._introT = 0;
      game.boss.x = game.player.x + 150; game.boss.y = game.player.y - 150;
      // ne induljon közben boss-intro: a hullámszámot visszavesszük, az overlay-t elrejtjük
      game.wave = 5; game.waveTimer = 9999; game.state = 'playing';
      document.getElementById('bossIntro').classList.add('hidden');
    }, { type, col });
    await page.waitForTimeout(500);
    const c = await page.evaluate(() => { const b = game.boss; const s = arenaToScreen(b.x, b.y); return { x: s.x, y: s.y, atk: b._atk }; });
    await page.screenshot({ path: path.join(out, name + '.png'), clip: { x: Math.max(0, c.x-220), y: Math.max(0, c.y-300), width: 440, height: 400 } });
    await page.evaluate(() => { game.boss = null; });
  };
  await bossShot('d06-boss-shadow', 'shadow', '#ff5c7c');
  await bossShot('d07-boss-frost', 'frost', '#8fd0ff');
  await bossShot('d08-boss-flame', 'flame', '#ff9d4d');
  await bossShot('d09-boss-king', 'king', '#f4dc8a');
  // sprint utókép + halál-animáció
  await page.evaluate(() => { game.player.dashing = 14; });
  await page.keyboard.down('d'); await page.waitForTimeout(140);
  await shot(page, 'd10-dash');
  await page.keyboard.up('d');
  await page.evaluate(() => { game.wave = 5; game.waveTimer = 9999; document.getElementById('bossIntro').classList.add('hidden'); game.state = 'playing';
    let i = 0; for(const t of ['grunt','scout','tank','medic']) { spawnEnemyType(t, game.player.x + 60 + i*40, game.player.y + 60 - i*20); i++; } });
  await page.waitForTimeout(200);
  await page.evaluate(() => { for(const e of game.enemies) e.hp = 0; });
  await page.waitForTimeout(220);
  const pc = await page.evaluate(() => { const s = arenaToScreen(game.player.x + 120, game.player.y + 60); return { x: s.x, y: s.y }; });
  await page.screenshot({ path: path.join(out, 'd11-deaths.png'), clip: { x: Math.max(0, pc.x-220), y: Math.max(0, pc.y-200), width: 440, height: 320 } });
  await page.close();

  // --- telefon, álló ---
  page = await open(390, 844);
  await page.waitForTimeout(900);
  await shot(page, 'p01-menu');
  await page.click('#heroSelectOpenBtn'); await page.waitForTimeout(500);
  await shot(page, 'p02-heroselect');
  await page.click('#heroSelectBackBtn'); await page.waitForTimeout(200);
  await page.click('#startBtn'); await page.waitForTimeout(1200);
  await shot(page, 'p03-game');
  await page.close();
  // --- telefon, fekvő ---
  page = await open(844, 390);
  await page.waitForTimeout(900);
  await shot(page, 'l01-menu');
  await page.click('#heroSelectOpenBtn'); await page.waitForTimeout(500);
  await shot(page, 'l02-heroselect');
  await page.click('#heroSelectBackBtn'); await page.waitForTimeout(200);
  await page.click('#startBtn'); await page.waitForTimeout(1200);
  await shot(page, 'l03-game');
  await page.close();

  await browser.close();
  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
