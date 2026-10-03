// A v56 tárgyak tesztje a VALÓDI játékhurokkal (Playwright + a gépi Chrome).
// Használat: node tests/items.js <url>
// Mind a 15 új tárgy hatása, a tárgy-gombok mentése, az ellenfél-szorzók.
// Kilépési kód 1, ha bármelyik ellenőrzés elbukik.
const { chromium } = require('playwright-core');
const url = process.argv[2] || 'http://localhost:8901/index.html';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async()=>{
const b = await chromium.launch({ executablePath: CHROME, headless: true });
let fails=0; const ok=(n,c,extra)=>{ console.log((c?'  ✓ ':'  ✗ HIBA: ')+n+(extra!==undefined?'  -> '+JSON.stringify(extra):'')); if(!c) fails++; };
const errs=[];
const p = await (await b.newContext({ viewport:{width:1280,height:800} })).newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(url); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  profile.seenGuide=true; profile.ownedHeroes=Object.keys(CLASSES); saveProfile();
  Math.random = (()=>{ let s=12345; return ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; })();
  window.T_start = (cls, items)=>{
    game = null; showScreen('startScreen'); setClass(cls); document.getElementById('startBtn').click();
    game.obstacles.length=0; game.barrels.length=0; game.crates.length=0;
    game.enemies.length=0; game.pendingSpawns.length=0; game.enemyBullets.length=0; game.waveTimer=1e9;
    const pl=game.player; pl.x=WORLD.w/2; pl.y=WORLD.h/2; pl.invuln=0; pl.critChance=0;
    for(const id of (items||[])) giveItem(pl, id);
    return pl;
  };
  window.T_calm = ()=>{ game.enemies=game.enemies.filter(e=>e._keep); game.pendingSpawns.length=0; game.waveTimer=1e9; game.state='playing'; };
  window.T_foe = (dx,dy,type='grunt',hp=99999)=>{ const pl=game.player; const e=spawnEnemyType(type, pl.x+dx, pl.y+dy);
    e.speed=0; e.hp=e.maxHp=hp; e._keep=true; e.dmg=0; return e; };
  window.T_aim = (x,y)=>{ const s=arenaToScreen(x,y); mouse.x=s.x; mouse.y=s.y; };
  window.T_step = (n)=>{ for(let i=0;i<n;i++){ T_calm(); update(); } };
  window.T_shoot = (x,y)=>{ const pl=game.player; T_aim(x,y); pl.fireCooldown=0; const nb=game.bullets.length;
    mouse.down=true; T_calm(); update(); mouse.down=false; return game.bullets.slice(nb); };
  window.T_key = (abId)=>{ const ab=game.player.abilities.find(a=>a.id===abId); if(!ab) return null; keys[ab.key]=true; T_calm(); update(); keys[ab.key]=false; return ab; };
  window.T_hitMe = (dmg)=>{ const pl=game.player; pl.invuln=0; pl.shieldActive=0;
    game.enemyBullets.push({x:pl.x,y:pl.y,vx:0,vy:0,r:6,dmg,life:30}); const h0=pl.hp; T_calm(); update(); return h0-pl.hp; };
});

console.log('-- TANK --');
let r = await p.evaluate(()=>{ const pl=T_start('tank',['sunfire']); const e=T_foe(0,130+0); const h0=e.hp; mouse.down=false; T_step(90);
  const far = h0-e.hp; const f2=T_foe(60,0); T_aim(f2.x,f2.y); for(let i=0;i<8;i++){ pl.fireCooldown=0; mouse.down=true; T_step(1); mouse.down=false; } 
  return { far, heat:pl._heat }; });
ok('Napmag-páncél: a 130-ra álló ellenfél ég, ütés nélkül is', r.far > 0, r);
ok('Napmag-páncél: a csapásoktól forróbb lesz', r.heat > 1.5, r.heat);
r = await p.evaluate(()=>{ const pl=T_start('tank',['aftershock']); const e=T_foe(-150,0); const h0=e.hp; for(let i=0;i<3;i++) T_shoot(pl.x+200,pl.y);
  return { dmg:h0-e.hp, stun:e.stunT||0 }; });
ok('Utórengés: a 3. csapás a háta mögötti ellenfelet is megsebzi és elkábítja', r.dmg>0 && r.stun>0, r);

console.log('-- MESTERLÖVÉSZ --');
r = await p.evaluate(()=>{ const pl=T_start('sniper',['deadeye']); const ab=pl.abilities.find(a=>a.id==='it_deadeye');
  const a=T_foe(300,0), c=T_foe(0,400), d0=[a.hp,c.hp]; T_aim(a.x,a.y); T_key('it_deadeye'); const on=pl._deadeye, slow=game.slowT;
  T_step(185); return { key:ab&&ab.key, bar:document.querySelectorAll('#abilityBar .abIcon').length, n:pl.abilities.length, on, slow, da:d0[0]-a.hp, dc:d0[1]-c.hp, cd:ab.cd }; });
ok('Holtszem: saját gombot kap ('+r.key+'), a sávban is ott van', !!r.key && r.bar===r.n, r);
ok('Holtszem: lelassul az idő, és a végén a célzott ÉS a nem célzott ellenfelet is lelövi', r.on>0 && r.slow>0 && r.da>0 && r.dc>0, r);
r = await p.evaluate(()=>{ const pl=T_start('sniper',['fourth']); const e=T_foe(300,0,'grunt',10000); let flags=[];
  for(let i=0;i<4;i++){ e.hp = (i===3) ? 2400 : 10000; const bs=T_shoot(e.x,e.y); flags.push(bs.some(x=>x.execute)); T_step(40); }
  return { flags, dead: !game.enemies.includes(e) || e.hp<=0 }; });
ok('Negyedik lövés: csak a 4. lövés kivégző, és megöli a 25% alattit', r.flags.join()==='false,false,false,true' && r.dead, r);

console.log('-- BERSERKER --');
r = await p.evaluate(()=>{ const pl=T_start('berserker',['spartan']); const e=T_foe(50,0); T_aim(e.x,e.y);
  for(let i=0;i<45 && !(pl._rageT>0);i++){ pl.fireCooldown=0; mouse.down=true; T_step(1); mouse.down=false; }
  const m=itemDmgMul(pl); pl.hp=pl.maxHp*0.5; const h0=pl.hp; pl.fireCooldown=0; mouse.down=true; T_step(1); mouse.down=false; return { rage:pl._rageT, m, healed:pl.hp-h0 }; });
ok('Spártai düh: a dühmérő megtelik, dupla sebzés és az ütés gyógyít', r.rage>0 && r.m===2 && r.healed>0, r);
r = await p.evaluate(()=>{ const pl=T_start('berserker',['undying']); pl.hp=5; const lost=T_hitMe(500); const st1=game.state, hp1=pl.hp, t=pl._undyT;
  T_hitMe(500); const hp2=pl.hp; T_step(310); pl.hp=5; T_hitMe(500); return { st1, hp1, t, hp2, st2:game.state }; });
ok('Halhatatlan düh: a halálos találat után 1 életen marad, 5 mp-ig nem hal meg', r.st1==='playing' && r.hp1===1 && r.t>0 && r.hp2===1, r);
ok('Halhatatlan düh: 60 mp-en belül másodszor már nem ment meg', r.st2!=='playing', r);
r = await p.evaluate(()=>{ const pl=T_start('berserker',['leap']); const x0=pl.x; const e=T_foe(250,0); const h0=e.hp; T_aim(e.x,e.y); T_key('it_leap'); T_step(26);
  return { moved: pl.x-x0, dmg:h0-e.hp }; });
ok('Becsapódó ugrás: odaugrik és a becsapódás sebez', r.moved>180 && r.dmg>0, r);

console.log('-- ORGYILKOS --');
r = await p.evaluate(()=>{
  let pl=T_start('assassin',[]); const e0=T_foe(400,0); const b0=T_shoot(e0.x,e0.y)[0]; const base={dmg:b0.dmg, life:b0.life};
  pl=T_start('assassin',['smokebomb']); const e=T_foe(400,0); T_step(5); const hidden0 = pl.buffs.invisible>0;
  const b1x=T_shoot(e.x,e.y)[0]; const b1={dmg:b1x.dmg, life:b1x.life}; T_step(2); const shown = !(pl.buffs.invisible>0); T_step(125); const hidden1 = pl.buffs.invisible>0;
  const f=T_foe(80,0); T_key('it_smoke'); const sm=game._it.smokes.length, stun=f.stunT||0;
  const h0=f.hp; T_aim(f.x,f.y); pl.fireCooldown=0; mouse.down=true; T_step(1); mouse.down=false; T_step(10);
  return { base, now:{dmg:b1.dmg, life:b1.life}, hidden0, shown, hidden1, sm, stun, dmgIn:h0-f.hp }; });
ok('Füstbomba: dobás nélkül láthatatlan, dobás után látszik, 2 mp múlva újra eltűnik', r.hidden0 && r.shown && r.hidden1, r);
ok('Füstbomba: a dobás +70% sebzés és fele táv', Math.abs(r.now.dmg/r.base.dmg-1.7)<0.08 && Math.abs(r.now.life/r.base.life-0.5)<0.1, r);
ok('Füstbomba gomb: füstfelhő, a benne álló elkábul', r.sm===1 && r.stun>0, r);

console.log('-- NEKROMANTA --');
r = await p.evaluate(()=>{ const pl=T_start('necromancer',['bonearmor']); for(let i=0;i<5;i++) T_foe(Math.cos(i)*120, Math.sin(i)*120); T_step(150);
  const sh=pl._bone; const lost=T_hitMe(30); return { sh, lost }; });
ok('Csontpáncél: a közeli ellenfelek után pajzs, ami elnyeli a sebzést', r.sh>0 && r.lost<30, r);
r = await p.evaluate(()=>{ const pl=T_start('necromancer',['lifesiphon']); const e=T_foe(200,0); pl.hp=pl.maxHp*0.5; const h0=pl.hp; T_shoot(e.x,e.y); T_step(30); return { gain:pl.hp-h0 }; });
ok('Életszívás: a sebzés gyógyít', r.gain>0, r);

console.log('-- VADÁSZ --');
r = await p.evaluate(()=>{ const pl=T_start('hunter',['dragonstrike']); const e=T_foe(900,0); const h0=e.hp; const bs=T_shoot(e.x,e.y);
  const dr=game.bullets.filter(x=>x.look==='dragon').length; T_step(160); const bs2=T_shoot(e.x,e.y);
  return { dr, dmg:h0-e.hp, again:bs2.filter(x=>x.look==='dragon').length }; });
ok('Sárkánycsapás: két sárkány indul, és a 900 egységre álló ellenfelet is eléri', r.dr===2 && r.dmg>0, r);
ok('Sárkánycsapás: 8 mp-en belül nem jön újra', r.again===0, r);
r = await p.evaluate(()=>{ const pl=T_start('hunter',['clusterarrow']); const e=T_foe(200,0); T_shoot(e.x,e.y); let bombs=0;
  for(let i=0;i<40;i++){ T_step(1); bombs=Math.max(bombs, game.bullets.filter(x=>x.look==='bomb').length); } return { bombs }; });
ok('Kazettás nyíl: becsapódáskor 4 kis bomba', r.bombs===4, r);

console.log('-- GÉPÉSZ --');
r = await p.evaluate(()=>{ const pl=T_start('engineer',['mech']); const cd0=itemFireCd(pl); T_key('it_mech'); const cd1=itemFireCd(pl);
  const lost=T_hitMe(40); const mh=pl._mechHp; return { t:pl._mechT, cd0, cd1, lost, mh, max:pl.maxHp }; });
ok('Harci robot: 10 mp, gyorsabb gépágyú, a páncél elnyeli a sebzést', r.t>500 && r.cd1<r.cd0 && r.lost===0 && r.mh<r.max, r);
r = await p.evaluate(()=>{ const pl=T_start('engineer',['tesla']); T_key('it_tesla'); const st=game._it; const t=st.teslas[0];
  const foes=[0,1,2,3].map(i=>T_foe(150+i*120, 40)); const h0=foes.map(f=>f.hp); T_step(45);
  const hit=foes.filter((f,i)=>f.hp<h0[i]).length; T_key('it_tesla'); const n2=st.teslas.length; const ab=pl.abilities.find(a=>a.id==='it_tesla'); const cdAlive=ab.cd;
  t.hp=1; T_step(2); const gone=st.teslas.length, cdAfter=ab.cd; T_key('it_tesla'); return { hit, n2, cdAlive, gone, cdAfter, again:st.teslas.length }; });
ok('Tesla-torony: a villám 4 ellenfélre ugrik', r.hit===4, r);
ok('Tesla-torony: amíg áll, nem rakható le másik; ha elfogyott, újra lerakható', r.n2===1 && r.cdAlive>0 && r.gone===0 && r.cdAfter===0 && r.again===1, r);
r = await p.evaluate(()=>{ const pl=T_start('engineer',['spidermines']); pl._spiderCd=599; T_step(1); const n=game._it.spiders.length; const e=T_foe(220,0); const h0=e.hp; T_step(150); return { n, dmg:h0-e.hp }; });
ok('Pókaknák: 6 pók indul, odamászik és felrobban', r.n===6 && r.dmg>0, r);

console.log('-- MENTÉS, ELLENFELEK --');
r = await p.evaluate(()=>{ const pl=T_start('engineer',['tesla','mech']); game.state='playing'; saveRun(); const saved=JSON.parse(localStorage.getItem('lostsurvivor_run_v1')).abilities.map(a=>a.id);
  resumeRun(); const ids=game.player.abilities.map(a=>a.id); return { saved, ids }; });
ok('Mentés/visszatöltés: a tárgy-gombok nem mentődnek, de visszajönnek, egyszer', !r.saved.some(i=>i.startsWith('it_')) && r.ids.filter(i=>i==='it_tesla').length===1 && r.ids.filter(i=>i==='it_mech').length===1, r);
r = await p.evaluate(()=>({ hp:ENEMY_HP_MUL, dmg:ENEMY_DMG_MUL, dodge: typeof dodgeBullets }));
ok('Ellenfelek: 3× élet, 2,25× sebzés, nincs kitérés', r.hp===3 && r.dmg===2.25 && r.dodge==='undefined', r);
console.log('loopErrors:', await p.evaluate(()=>JSON.stringify(window.__loopErrors||[])));
console.log('oldal-hibák:', errs.length?errs.join(' | '):'nincs');
console.log(fails? fails+' HIBA' : 'MINDEN ZÖLD'); await b.close();
process.exit((fails || errs.length) ? 1 : 0);
})();
