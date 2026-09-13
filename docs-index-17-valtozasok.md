# index-17.html - vizuális ráncfelvarrás (az index-16 alapján)

Ez a verzió KIZÁRÓLAG a látványt változtatja. Az irányítás, a menük, a szövegek, a mentés-formátum,
a balansz és minden játékmeneti szám ugyanaz, mint az index-16-ban. A `TEST_MODE_UNLOCK_ALL` marad `false`,
a `PROFILE_KEY` marad `kilencpecset_profile_v4`, a felhő-mentés nincs bekapcsolva.
Egyetlen HTML fájl maradt, külső fájl vagy könyvtár nem kell hozzá.

## Mi változott

### Hősök (a 6. pont "Karakterek" része)
- Végtagok: két láb, ami haladáskor lépésciklusban jár, álláskor középen áll; két kar a vállból a fegyver fogásáig.
- A fegyver a testhez kötve, hősönként más: toronypajzs + buzogány (Tank), hosszú puska távcsővel (Sniper),
  kétélű bárd (Berserker), varázsbot izzó gömbbel (Mágus, Support, Nekromanta, Mester), két tőr (Assassin),
  íj nyílvesszővel (Vadász), tekercses sugárvető (Gépész), pallos (Mesterek Mestere), fény-gömbök (Isten).
- Animáció: lépés-ringás, dőlés kanyarban, lélegzés álláskor, hátrarúgás és torkolattűz lövéskor,
  sprint (dash) alatt utóképek + sebességvonalak.
- Fej: nyak-árnyék, rögzített fényirány szerinti fény-folt és árnyék-perem (a régi 5 fejstílus megmaradt).
- Test: fényirány szerinti gradiens, fény-perem a megvilágított élen, vetett árnyék a talajon.
- Archetípus szerinti méret CSAK vizuálisan (`CLASS_VIS`): Tank 1,2x, Assassin 0,86x stb. A hitbox (`p.r`) nem változott.
- Kinézetenként eltérő sziluett-részlet: köpeny (1. és 5. skin), vállszegecs (2., 5.), heveder (3.), kopott foltok (4.), gallérfény (5.).
- A menü-portrék (hőskártya, részletnézet, kinézet-választó, előnézet) ugyanezt a teljes figurát mutatják.

### Ellenfelek
- Sprite-alapú rajzolás: a 9 típus teste állapotonként (normál / találat / fagyott) egyszer sül ki egy kis vászonra
  2x felbontáson, utána képkockánként egyetlen `drawImage`. A régi elmosás (shadowBlur) minden ellenfélnél kikerült,
  így a részletesebb rajz OLCSÓBB lett, mint a régi.
- Test: gradiens, plasztika, fény-perem, típusonkénti páncél-részlet (szegecsek, lemezek, tár stb.), a régi arcok megtartva.
- Típusfüggő mozgás-karakter: a Tank nehézkesen dülöng és porfelhőt rúg; a Scout cikázva dől és utóképet húz;
  a Charger a rohamnál elnyúlik és sebességvonalakat hagy, a figyelmeztetésnél remeg és irányjelző éket kap;
  a Bomber "szívverése" gyorsul, ahogy közeledik, a gyújtózsinórja szikrázik; a Medic lebeg; a Turret hátrarúg lövéskor;
  a Swarmling tekereg.
- Találat-visszajelzés: hőkölés a lövedék irányába (csak rajz), a villanás fehér perem + világosodás.
- Halál-animáció típusonként: a Tank összerogy és kődarabokra hullik; a Bomber felfúvódik és lökéshullámmal robban;
  a Scout előrecsúszva foszlik szét; a Medic felemelkedik zöld kereszt-fénnyel; a Swarmling szétfröccsen;
  a Turret megbillen, szikrázik és füstöl; a többi hátrabillenve esik szét szilánkokra.
- HP-csík: lekerekített, sötét kerettel, színe a maradék élettel változik.

### Bossok
- Rétegzett test (gradiens, lüktető erezet, rúna-gyűrűk), típus-specifikus háttérréteg: Árnyék = hullámzó csápok,
  Jég = keringő jégtűk és dér, Láng = lobogó tűznyelvek és parázs, Király = bíbor köpeny és korona.
- Belépő-animáció: a földből nő fel, lökéshullámmal, villanással és képernyőrázással.
- HP-csík lekerekítve, kerettel, a boss nevével.

### Akadályok
- Helyszín szerinti téma: beton (romok), faragott kő (királyság), ércszikla (bánya), szenes kő parázs-repedésekkel (hamu),
  jégtömb (szentély), mohás szikla (fenyves), faláda (farm), obszidián-kristály (kapu). A díszhordó is témás
  (fa / rozsdás fémhordó / kőurna / jeges hordó).
- 2.5D: oldallap és vetett árnyék, fény-perem a bal-felső élen. A fenyő rétegzett, a szentélyben havas; a bokor és a szénabála árnyalt.
- A rombolható fedezék az élete fogytával reped, szilánkosodik, majd törmelékre esik szét (pattogó darabok, porfelhő).
- A statikus akadályok egy külön rétegre sülnek ki (`getObstacleLayer`), képkockánként egy `drawImage`.
- Robbanó hordó és rejtett láda: 3D-s, veszély-csíkos / fém sarkos, lüktető fénnyel.

### Háttér és légkör
- Rögzített fényforrás bal-felülről: lágy fény-tócsa a talajon, minden árnyék jobbra-le esik.
- Talaj: finom foltosság minden témán; romoknál kövezet-lapok; erdőben lombárnyék-foltok és fénypászmák; bányában valódi, tükröződő tócsák.
- Légkör-réteg: lassan gomolygó ködfoltok + témafüggő porszemcsék enyhe parallaxszal (hópehely, parázs, csillagpor, virágpor, érc-csillanás).

### Ütés-visszajelzés és effektek (5. pont)
- Lökéshullám-gyűrű, képernyő-villanás és "kromatikus" perem-lüktetés: képesség- és ult-aktiváláskor, robbanásnál,
  boss-belépésnél, szintlépésnél, sérüléskor.
- Kritikus találat: kis rázás + gyűrű; sérülés: vörös villanás.
- Lövedékek additív fénnyel és nyomvonallal, kritikus lövedék forgó szikrával; villámlánc tört vonalként.
- Tűzgolyó, méregfelhő, meteor-célzó (töltődő korong), sugár, torony, drón, XP-gömb mind újrarajzolva.

### HUD és menük
- Üvegpanelek, fénysávos élet/XP-csík, hullámszám "pop" váltáskor, kész ult lüktetése, képesség-ikonok lélegzése.
- Gombok fény-söpréssel hover-re, kártyák emelkedéssel és lüktető kerettel, portré-háttér lélegzik.
- Menü-háttér lassan hömpölygő fényköd; több és kétféle lebegő szikra.
- Győzelem / halál / boss címek berobbanása; halál-képernyő vörös, boss-intro rózsaszín lüktetés.
- Minden új CSS-animáció kikapcsol `prefers-reduced-motion` mellett.

## Teljesítmény
- A "Kímélő látvány" beállítás és az 55 fölötti ellenfélszám (ahogy eddig) most a VFX-réteget is visszafogja:
  fele porszemcse, nincs utókép, nincs sebességvonal, kevesebb törmelék/pamacs.
- Az ellenfél-sprite és a fény-korong sprite-ok gyorsítótárból mennek, az akadály-réteg csak pályaváltáskor / átméretezéskor épül újra.

## Hogyan lett tesztelve
- Node `vm` + DOM-stub füst-teszt, 14 ellenőrzés, mind zöld: menü-portrék; mind a 12 hős x 6 kinézet előnézete;
  kampány indítás 300 képkocka; mozgás + lövés + képességek + ult; mind a 9 ellenféltípus + halál-animációk;
  rombolható fedezék + hordó; 3 boss-variáns + boss-halál; szintlépés; kímélő mód 80 ellenféllel; szünet/folytatás;
  halál-képernyő; mind a 9 sztori-fejezet (mind a 8 talaj-téma); rAF-loop.
- Headless Chrome renderek: főmenü, hős-választó, 8 pálya-téma, 4 boss-típus közelről, mind a 12 hős közelről,
  mind a 9 ellenfél közelről, akadály-tábla témánként, szintlépés, halál, győzelem, szünet, boss-intro, telefon-méret (390x844).

## Ami szándékosan NEM változott
- Irányítás, gamepad, érintés; menü-szerkezet; minden felirat és fordítás; mentés-kulcsok és struktúra;
  balansz, sebzés, HP, sebesség, hullámok; hang; PWA; admin.
