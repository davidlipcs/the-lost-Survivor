# The Lost Survivor — munkamódszer

Ez a fájl azokat a szabályokat rögzíti, amiket David kért. Minden
munkamenetben érvényesek, nem csak abban, amelyikben elhangzottak.

## Minden üzenet végén

1. **Pushold.** Ha van változás, commitold és told fel — ne maradjon
   munka a konténerben. A konténer törlődik, ami nincs feltolva, elvész.
   Ha semmi nem változott, mondd ki, hogy nincs mit feltolni.
2. **Mondd el, hogyan fog működni.** Nem elég a technikai leírás: azt
   írd le, hogy a JÁTÉKOS mit fog látni és csinálni. Hol találja, mit
   nyom meg, mi történik. A „mit változtattam" után mindig jöjjön a
   „hogyan használod".

## Feltöltés menete

Ág: `claude/404-error-opening-62h3cp` → PR → squash merge a `main`-be.
Merge után az ágat állítsd vissza a `main`-re
(`git checkout -B <ág> origin/main` + force-with-lease), különben a
következő PR ütközik: a squash miatt ugyanaz a tartalom kétszer
szerepelne.

Minden kiadásnál emeld a `sw.js`-ben a `CACHE_NAME` verziót.

## E-mail

Minden fejlesztésről írj e-mailt **davidlipcs@gmail.com** címre: mi volt
a baj, mit csináltál, hogyan tesztelted. Magyarul.

## A játék állandó megkötései

- **Egyetlen HTML fájl.** Nincs külső függőség, nincs build lépés.
- **Magyar ÉS angol** minden új, felhasználónak látszó szöveghez
  (`TRANSLATIONS.hu` / `.en`, `GAME_TEXT_EN`).
- A **localStorage kulcsok és szerkezetük visszafelé kompatibilisek**
  maradnak: `kilencpecset_profile_v4`, `lostsurvivor_run_v1`,
  `HERO_STATS_KEY`. Meglévő mentés nem veszhet el.
- `TEST_MODE_UNLOCK_ALL` **marad `false`**.
- **Felhőmentés = Google-bejelentkezés + Pantry** (David kérte). Csak
  akkor él, ha a `GOOGLE_CONFIG.clientId` ÉS a `PANTRY_CONFIG.id` is ki
  van töltve; addig a fiók-sor rejtve, és semmi nem megy a hálózatra.
  A kosár neve `g_<Google sub>`, az e-mail sosem kerül a felhőbe.
  A régi, begépelt névhez kötött felhőmentés megszűnt — ne hozd vissza.
  Külső szkriptet (Google GSI) ne tölts be: átirányításos bejelentkezés.
- **Admin:** a Google-lel bejelentkezett, ellenőrzött **davidlipcs@gmail.com**
  (`ADMIN_EMAILS`). A begépelt `davidlipcs1234` név CSAK addig admin, amíg
  a Google-bejelentkezés nincs beállítva.
- **Támogató:** a többjátékos módig NEM választható hős (`HIDDEN_HEROES`),
  társként marad. Ne kapcsold vissza kérés nélkül.
- **Felszerelés:** futamonként, 5 hely, szigorú kaszt-kötés; 100 XP-nként
  10% esély egy választásra, a varázsló-pecsét is 10%. CSAK David nyolc
  tárgya: Teljes tüske, Pajzsbuborék (Tank), Rikoset, Elemi mester,
  Robbanó kések, Lélekgyűjtő, Fagyasztócsapda, Hadiállomás. A Berserkernek
  nincs, amíg David nem választ neki. Saját ötletet ne tegyél be.
- **Ellenfél-zsákmány:** mesterlövész→Távcső, tank→Életerő, rajlény→Dupla
  lövés, rohamozó→Gyorstöltés, felderítő→Fürgeség; ölésenként 10%,
  rétegenként max. 3 (a Dupla lövés 1), nem foglal felszerelés-helyet.
- **Gyógyítás:** minden hősnek saját gombon (H / zöld ✚ / LT), 30% életerő,
  10 mp; a „Gyógyulás” képesség nem foglal képesség-helyet.
- **Ellenfelek:** feleannyi (`ENEMY_COUNT_MUL` 0,5), kétszeres élet,
  másfélszeres sebzés; a boss nem változik.
- **Pálya:** sima csatában a vászon 2,4-szerese tengelyenként
  (`WORLD_SCALE_PLAIN`) — a korábbi 3,4-es terület fele. A lőtávolság
  (`rangeMul`) a pályával együtt változik (David így kérte).
- **Mobilon is működjön minden.**

## Tesztelés

Fejetlen Chromium + Playwright, a böngésző itt:
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
A tesztkészletek a munkamenet scratchpad-jében vannak, két kiszolgálóval:
8901 = a repó, 8902 = a scratchpad másolata.

A teszt a VALÓDI játékhurkot hajtsa, ne szimulálja a logikát. Minden
változtatás után fusson a teljes sweep, és a válaszban szerepeljen, mi
lett az eredménye — ha valami elbukik, azt is mondd ki.

## Amit kérdezz meg, ne találgass

A design döntések Davidnél vannak. Ha egy kérés többféleképpen érthető,
és a két olvasat érdemben más munkát jelent, kérdezz.
