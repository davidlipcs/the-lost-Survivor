# Tesztek

Fejetlen Chrome + Playwright, a VALÓDI játékhurokkal (nem szimulált logika).

Előkészítés (egyszer): `npm i playwright-core` a repó mellett vagy felett, és egy
Chrome/Chromium bináris. Alapértelmezés a Windows-os Chrome útvonal; másutt a
`CHROME_PATH` környezeti változóval add meg (pl. a Playwright saját Chromiumát:
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`).

Statikus kiszolgáló a repó gyökerén: `python -m http.server 8901`.

- `node tests/smoke.js http://localhost:8901/index.html shots/smoke` - 20 ellenőrzés:
  főmenü, hősválasztó (minden kártya végigkattintva), futam 4 irányú mozgással,
  lövéssel, képességekkel, öléssel, 60+ ellenféllel mért FPS, boss-intro, boss,
  győzelem, végtelen mód, halál, szünet, beállítások, trófeák, létra, sztori,
  nyelvváltás; hurok-hiba és oldal-hiba számláló. Kilépési kód 1, ha bármi elbukik.
- `node tests/screens.js <url> shots/screens` - képernyő-sweep: főmenü, hősválasztó
  (rámutatás, kiválasztás, kinézet/fej), diadal-kép, a 4 boss közelről, sprint,
  halál-animáció, telefon álló és fekvő.
- `node tests/items.js <url>` - a v56 tárgyak (mind a 15) hatása a valódi hurokkal, a tárgy-gombok
  mentése/visszatöltése és az ellenfél-szorzók. Kilépési kód 1, ha bármi elbukik.
- `node tests/sheet.js <url> shots/sheet.png [lépték]` - sprite-lap: a kisütött
  járás- és támadás-fázisok egymás mellett több hősre és ellenfélre (a figura-
  animáció szemrevételezéséhez).
