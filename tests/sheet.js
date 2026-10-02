// Sprite-lap: a kisütött figura-fázisok egymás mellé rakva (járás 12 fázis, támadás 7 lépés).
// Használat: node tests/sheet.js <url> <kimeneti png> [S lépték]
const { chromium } = require('playwright-core');
const url = process.argv[2] || 'http://localhost:8901/index.html';
const outPng = process.argv[3] || 'shots/sheet.png';
const S = +process.argv[4] || 3;
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async()=>{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { localStorage.setItem('kilencpecset_profile_v4', JSON.stringify({ xp: 0, seenGuide: true, settings: { sfxVol: 0, musVol: 0 } })); });
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(400);
  const dims = await page.evaluate((S) => {
    const rows = [
      { label: 'tank hős járás (skin 0, kommandós)', stub: { cls: 'tank', color: '#6ee7ff', team: 'ally', skin: 0, head: 'commando' }, foe: false, mode: 'walk' },
      { label: 'tank hős támadás', stub: { cls: 'tank', color: '#6ee7ff', team: 'ally', skin: 0, head: 'commando' }, foe: false, mode: 'atk' },
      { label: 'berserker járás (skin 2, spártai)', stub: { cls: 'berserker', color: '#ff5c7c', team: 'ally', skin: 2, head: 'spartan' }, foe: false, mode: 'walk' },
      { label: 'sniper járás (skin 3, gázmaszk) + támadás', stub: { cls: 'sniper', color: '#ffd166', team: 'ally', skin: 3, head: 'gasmask' }, foe: false, mode: 'walkatk' },
      { label: 'assassin járás (skin 5, kiber)', stub: { cls: 'assassin', color: '#8b5cf6', team: 'ally', skin: 5, head: 'cyber' }, foe: false, mode: 'walk' },
      { label: 'mage járás (skin 1, árnyék) + támadás', stub: { cls: 'mage', color: '#4ade80', team: 'ally', skin: 1, head: 'ninja' }, foe: false, mode: 'walkatk' },
      { label: 'hunter (skin 4) / engineer (skin 0) / necromancer (skin 0) állás', stub: null, foe: false, mode: 'idle3' },
      { label: 'grunt ellenfél járás + támadás', stub: { cls: 'tank', etype: 'grunt', color: '#8b6bff', team: 'foe' }, foe: true, mode: 'walkatk' },
      { label: 'scout / tank / sniper / bomber / medic / charger / turret / wizard / swarmling ellenfél', stub: null, foe: true, mode: 'foes' },
    ];
    const cellW = 50*S, cellH = 56*S, pad = 6;
    const cv = document.createElement('canvas');
    cv.width = 14*cellW + 20; cv.height = rows.length*(cellH + 22) + 20;
    cv.style.cssText = 'position:fixed;left:0;top:0;z-index:999;background:#1b2230';
    document.body.appendChild(cv);
    const g = cv.getContext('2d');
    g.fillStyle = '#1b2230'; g.fillRect(0, 0, cv.width, cv.height);
    const drawAt = (a, opt, x, y) => {
      const o = Object.assign({}, opt, { faceRight: true });
      const sp = getFigureSprite(a, o, S);
      const k = S/sp.S;
      g.drawImage(sp.c, x - sp.ox*k, y - sp.oy*k, sp.c.width*k, sp.c.height*k);
      // talaj-vonal
      g.strokeStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.moveTo(x-20, y); g.lineTo(x+20, y); g.stroke();
    };
    const optFor = (stub, foe) => foe
      ? { loadout: ISO_ENEMY_LOADOUT[stub.etype] || ISO_ENEMY_LOADOUT.grunt, bodyStyle: arenaWideBody(ISO_BODY_FOE[stub.etype] || ISO_BODY_FOE.grunt) }
      : { loadout: ISO_LOADOUT[stub.cls], bodyStyle: arenaWideBody(ISO_BODY[stub.cls]) };
    rows.forEach((row, ri) => {
      const y0 = 10 + ri*(cellH + 22);
      g.fillStyle = '#cfd8e3'; g.font = '12px Trebuchet MS'; g.fillText(row.label, 10, y0 + 12);
      const base = y0 + 18 + cellH - 8*S;
      let col = 0;
      const put = (a, opt) => { drawAt(a, opt, 10 + col*cellW + cellW/2, base); col++; };
      if(row.mode === 'walk' || row.mode === 'walkatk'){
        for(let i = 0; i < WALK_STEPS; i++){ const a = Object.assign({ _walk: i*(PI2/WALK_STEPS) + 0.001, _spd: 0.02, _atk: 0, hp: 1, maxHp: 1, facing: 0 }, row.stub); put(a, optFor(row.stub, row.foe)); }
      }
      if(row.mode === 'atk' || row.mode === 'walkatk'){
        const n = (row.mode === 'atk') ? ATK_STEPS : 2;
        for(let i = 0; i < n; i++){ const atk = (row.mode==='atk') ? 1 - i/(ATK_STEPS-1) : (i===0 ? 1 : 0.55); const a = Object.assign({ _walk: 0, _spd: 0, _atk: Math.max(0.01, atk), hp: 1, maxHp: 1, facing: 0 }, row.stub); put(a, optFor(row.stub, row.foe)); }
        if(row.mode === 'atk'){ const a = Object.assign({ _walk: 0, _spd: 0, _atk: 0, hp: 1, maxHp: 1, facing: 0 }, row.stub); put(a, optFor(row.stub, row.foe)); }
      }
      if(row.mode === 'idle3'){
        for(const [cls, skin, head] of [['hunter', 4, 'commando'], ['engineer', 0, 'commando'], ['necromancer', 0, 'commando'], ['tank', 1, 'commando'], ['tank', 2, 'commando'], ['tank', 3, 'commando'], ['tank', 4, 'commando'], ['tank', 5, 'commando']]){
          const st = { cls, color: '#6ee7ff', team: 'ally', skin, head };
          const a = Object.assign({ _walk: 0, _spd: 0, _atk: 0, hp: 1, maxHp: 1, facing: 0 }, st); put(a, optFor(st, false));
        }
      }
      if(row.mode === 'foes'){
        for(const et of ['scout','tank','sniper','bomber','medic','charger','turret','wizard','swarmling','spawner']){
          const st = { cls: 'tank', etype: et, color: ENEMY_DEFS[et].color, team: 'foe' };
          const a = Object.assign({ _walk: 2.1, _spd: (et==='turret'||et==='spawner') ? 0 : 0.02, _atk: 0, hp: 1, maxHp: 1, facing: 0 }, st); put(a, optFor(st, true));
        }
      }
    });
    return { w: cv.width, h: cv.height };
  }, S);
  await page.screenshot({ path: outPng, clip: { x: 0, y: 0, width: Math.min(1600, dims.w), height: Math.min(1400, dims.h) } });
  console.log('sheet:', outPng, dims, 'errors:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
