# v54 - Figurák, hősválasztó és főmenü átdolgozása

Egyetlen HTML fájl maradt, a mentés-kulcsok és a szerkezetük nem változtak,
a `TEST_MODE_UNLOCK_ALL` marad `false`, a felhőmentés nincs bekapcsolva.
A játékmenet számai (élet, sebzés, sebesség, hullámok) nem változtak.

## Mit lát a játékos

### Hősválasztó
- A hősök nem felülnézeti korongként, hanem UGYANÚGY jelennek meg, ahogy harc
  közben: a 45 fokos nézet rigelt figurája áll egy talaj-rombuszon, a kaszt
  színű fényudvarral.
- A kiválasztott kártya kiemelkedik (lüktető keret), a figurája él: lélegzik,
  időnként megsuhintja a fegyverét. Kiválasztáskor a kártya, a nagy előnézet
  és a részletnézet figurája is suhint egyet. Egérrel rámutatva a kártya hőse
  lépked.
- A nagy előnézet (a név mellett) kétszer akkora lett; koppintásra suhint.
- A FEJ választó a játékbeli fejet mutatja: kommandós (a kaszt saját sisakja /
  csuklyája), gázmaszk, kiber-vizor, árnyék-csuklya, spártai taréjos sisak.
  Ezek mostantól a harcban is látszanak a figurán.
- A KINÉZET választó a figurát mutatja az adott kinézetben. A kinézetek
  mostantól a harcban is látszanak: a ruha a kinézet főszínét, a lemezek a
  másodszínét viszik, és sorszám szerint dísz is jár (fényszegély, szegecsek,
  vállszalag, kopott karcok, prémium aranyszegély + izzó embléma).
- A választott csapatszín (a hat színes pötty) a figura övén, szemfényén és
  díszein látszik.

### Főmenü
- A cím alatt egy színpad: a választott hős (kinézettel, fejjel, színnel),
  mellette a társa, a túloldalon két ólálkodó ellenfél. A hős időnként
  megsuhintja a fegyverét. Alacsony (640 px alatti) kijelzőn a színpad
  elrejtőzik, hogy a gombok maradjanak.
- A menük rövid beúszással jelennek meg.

### Harc közben
- Lépésciklus: a térd behajlik lendítéskor, kinyúlik támaszban, a talp ívben
  emelkedik, a csípő a lépés ütemére ring, a felsőtest haladáskor enyhén
  előredől, a szabad kar ellenlendül. Az egyenes pálcika-lábak, amelyek
  "átcsúsztak" egymáson, megszűntek. A lépés-tempó a tényleges sebességhez
  igazodik (egy ciklus ~30 képkocka).
- Támadás-animáció: a hős, a társ, az ellenfelek és a boss figurája is
  meglendíti a fegyverét / visszarúg és torkolattüzet villant, amikor üt vagy
  lő. (Eddig a figura támadás-animációja soha nem indult el.)
- Találat: az eltalált ellenfél fehéren villan, a megfagyott jeges kék, a
  sérült hős vörösen villan.
- Halál: az ellenfél figurája dől el, rogy össze, csúszik el, emelkedik fel,
  fröccsen szét vagy omlik össze (típus szerint) - ugyanaz az alak, ami az
  előbb még állt. (Eddig a halál-animáció egyáltalán nem rajzolódott ki.)
- Sprint: a hős színű utóképei maradnak a nyomában; a felderítő cikázásánál
  is utókép látszik.
- Lágy, elmosott talaj-árnyék minden alak alatt a kemény ellipszis helyett;
  lépés-por a hős talpa alatt.
- A boss is figura: nagy, szarvas sisakos alak, a típusára jellemző
  háttérréteggel (Árnyék: csápok, Jég: keringő jégtűk, Láng: lobogó lángok,
  Király: bíbor köpeny és korona), rúna-gyűrűvel a talpa körül; a belépőnél a
  földből nő fel. Ugyanúgy üt, villan és fagy, mint a többi alak.
- Kamera: a kép kicsit a célzás irányába tolódik (előretartás), hogy lásd,
  mire lősz.

### Diadal-kép
- A Király legyőzése utáni képen a hős, a társ és a hercegnő a játék saját
  figurái (kinézet, fej, szín szerint); a hercegnő hosszú hajat és tiarát
  visel.

## Mi változott a kódban
- `isoFigureRaw`: kétcsontos IK a lábakon (vászon-térben, mert a széles
  testeknél az x-tengely nyújtott), csípő-süllyedés (`hipDrop`), előredőlés
  (`mlx`), kar-lendítés; `WALK_STEPS = 12` fázis sül ki.
- `heroHeadStyle` + új fejstílusok (`spartan`, `gasmask`, `cyber`, `horned`,
  `king`, `crown`) az `isoHeadShape`/`isoHeadFace`-ben; `drawSkinTrim` a
  kinézet-díszekhez; a kinézet színei a figura anyagszíneiben.
- Új segédek a VFX-rétegben: `isoFaceRight`, `mixHex`, `drawSoftShadow`,
  `figTinted` (sprite-onként gyorsítótárazott színezett másolat),
  `addFigureGhost`/`drawFigureGhosts`.
- `_atk` horgok: hős lövés, társ lövés, ellenfél lövés/varázslás/roham/csapás/
  gyógyítás, boss lövés; lecsengés a `tickVfx`-ben.
- `drawDeath(g, d)` a `VFX.deaths`-ből, mélység szerint rendezve (a régi
  `drawDeaths` a nem létező `game.deaths`-t nézte, és N haláleset esetén N x N
  rajzot csinált rossz helyre).
- `drawBoss` a figura-rajzolóra épül (`BOSS_LOADOUT`, `BOSS_BODY`,
  `bossBodyStyle`); a hívó már nem nyújtja vízszintesen.
- Menü: `stageSetup`/`stageDraw`/`stageFlourish`/`stageSprite`/`stageTile`/
  `drawHeadPreview`/`menuAnimTick`/`menuStageDraw`/`renderMenuStage`. A
  színpadok a fő hurokból kapják a lépést (`loop` -> `menuAnimTick`), csak
  amíg nincs futó játék és a képernyőjük látszik. Csökkentett mozgásnál
  minden áll.
- A figura-rajzoló blokk (45 fokos vetítés + figurák) a MENÜ UI elé került,
  mert a hősválasztó portréi betöltéskor kisülnek, és a script-szintű
  const-ok csak a definíciójuk után érhetők el. Ugyanezért a `FIG_WIDE` /
  `arenaWideBody` is előrébb került.
- `drawTableauFigure` a diadal-képhez (a régi `drawStandingFigure` kikerült).
- Kamera-előretartás a `draw()`-ban (`input.aimX/aimY` felé, max 80 egység).
- CSS: `.overlay > *{ flex-shrink:0 }` (túlcsordulásnál görgessen, ne nyomja
  össze a gombokat), `screenIn` beúszás, színpad-méretek.

## Kivett kód (2300 sor)
- A különálló csempés misszió-jelenet teljes egészében (`ISO_TERRAIN`,
  `ISO_MAP_DEFS`, `isoGenerateMapDef`, `isoRender`, `isoStartScene`,
  `isoUpdate`, `isoDraw`, kamera, képességek, lövedékek, HUD): a hódítás már
  a fő motoron megy (#28), ez a jelenet sosem indult el. A hódítás-kezelő
  közvetlenül a `startConquestBattle`-t hívja.
- A régi felülnézeti hős-rajzoló (`drawHeroFigure`, `drawPlayerHead`,
  `drawHeroBodyPath`, `drawHeroAccent`, `drawHeroWeapon`, `drawHeroTrim`,
  `drawHeadLayered`, `drawPlayer`, `CLASS_VIS`, `CLASS_HW`, `HERO_WEAPON`,
  `WEAPON_HANDS`) - csak a menü-portrék használták.
- A régi felülnézeti ellenfél-sprite (`enemySprite`, `bakeEnemyBody`,
  `drawEnemyFaceAt0`, `enemyShapePath`, `drawEnemyShapeAt0`) - csak a (nem
  rajzolódó) halál-animáció és a felderítő-utókép használta.
- A misszió-jelenet fordítás-kulcsai (`isoAb_*`, `isoLeaveConfirm`,
  `isoWin*`, `isoLose*`).

## Teljesítmény
- A figurák továbbra is kisütött sprite-ok (12 járás + 7 támadás állás
  irányonként); a színezett (találat/fagyás/sérülés/utókép) másolatok
  sprite-onként egyszer készülnek. 60+ ellenféllel a mért képkockasebesség a
  tesztgépen 120+ (a fejetlen Chrome nem korlátoz 60-ra).
- A menü színpadai közül csak az élők rajzolnak minden képkockán (előnézet,
  részletnézet, kiválasztott kártya, főmenü); a többi kártya egyetlen kép.

## Tesztelés
- `tests/smoke.js`: 20/20 zöld (valódi hurok: menü, hősválasztó minden
  kártyával, futam mozgással/lövéssel/képességekkel/öléssel, FPS 60+
  ellenféllel, boss-intro, boss, győzelem, végtelen, halál, szünet,
  beállítások, trófeák, létra, sztori, nyelvváltás; 0 hurok-hiba, 0
  oldal-hiba).
- `tests/screens.js`: képernyő-sweep asztalon és telefonon (álló/fekvő),
  bossok közelről, diadal-kép, halál-animáció, sprint.
- `tests/sheet.js`: sprite-lap a járás/támadás fázisokról (ezen látszott és
  lett javítva a guggoló járás).

## Ami szándékosan NEM változott
- Irányítás, kontroller, érintés; menü-szerkezet és szövegek; mentés-kulcsok;
  balansz; hang; PWA; admin; felszerelés; hódítás-logika.
