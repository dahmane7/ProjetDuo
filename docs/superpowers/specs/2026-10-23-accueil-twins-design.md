# Accueil « Twins » · design

Story : US01 · SCRUM-11 (Mettre le projet en place). Branche : `SCRUM-11-US01-page-accueil`, depuis `preprod` (`ae6f56c`).
Validé en conversation le 23/10/2026. Gel du code : vendredi 10 h 30.

## Ce que veut l'utilisateur

- Le site s'appelle **Twins** au lieu de Duo.
- L'accueil marche aussi sur **PC** et **remplit tout l'écran**.
- La **première boule 3D** du carrousel devient le **logo Twins** : deux sauces jumelles, **ketchup** (rouge) et
  **mayonnaise** (crème), qui tourbillonnent et **coulent comme une sauce épaisse** quand on la touche. Inspiration :
  sites 3D haut de gamme.
- Les **panneaux** de l'accueil **s'allument** quand on les touche (doigt ou souris).

## 1. Renommage Duo → Twins (textes visibles, tout le site)

- `index.html` : titre de l'onglet « Twins · 1 acheté = 1 offert ».
- `src/components/Layout.jsx` : logo de l'en-tête « twin**s** » (dernière lettre en or, comme le « o » actuel), `aria-label` « Twins, accueil ».
- Chaque mention de la **marque** dans les pages, composants et `src/lib/menus.js` (ex. « Tu montres Duo » → « Tu montres Twins »), et le README.
- **Gardé tel quel** : le mot « duo » nom commun (« Les duos à saisir », « ton duo ») ; le code interne (couleurs `duo-*`,
  package npm, identifiants, base Supabase, e-mails `@duo.test`, noms de fichiers).

## 2. Boule Twins 3D qui éclate en mayonnaise et ketchup (`src/three/scene-menus.js`, `src/three/eclat.js`)

Révisé deux fois le 23/10/2026 : la sphère de sauce en spirale, puis la sphère de points lumineux (« on dirait une
boîte de nuit, je suis dans la restauration ») ont été refusées.

- Le médaillon `i === 0` est une **boule 3D pleine, laquée prune** (`#5a1f45`, vernis brillant), cerclée de l'anneau
  doré des autres médaillons, avec **« twins » en lettres 3D** en relief devant : « twin » crème, « s » or comme le logo
  de l'en-tête. Police Gentilis Bold (SIL OFL), réduite aux cinq lettres utiles dans `src/three/police-twins.json` (9 Ko).
- **Au toucher** : la boule se contracte d'un coup (0,3 s) avec un flash chaud, 34 gouttes de **mayonnaise** (`#f6e7b4`)
  et 34 de **ketchup** (`#c8261b`) giclent, surtout vers l'avant et le haut, retombent sous la gravité, s'étirent dans le
  sens de leur course et fondent ; la boule se reforme (jusqu'à 1,6 s, `DUREE_ECLAT`). Rythme et trajectoires : fonctions
  pures `eclatement(k)` et `goutte(g, k)` d'`eclat.js`, testées. Le carrousel attend la fin avant de tourner.
- Les 5 autres médaillons ne changent pas (ils coulent toujours). Repli sans WebGL ou animations réduites : inchangé.

## 3. Accueil pleine largeur sur PC (`src/pages/Accueil.jsx`, `MenusCarrousel.jsx`)

- **Téléphone (< 1024 px)** : inchangé, une colonne, pas de défilement horizontal à 375 px.
- **PC (≥ 1024 px, `lg:`)** :
  - premier écran sur toute la largeur et la hauteur (`min-h` ≈ écran moins l'en-tête) : à gauche le grand titre,
    une phrase d'accroche et le bouton « Je m'abonne » ; à droite le carrousel 3D en grand ;
  - dessous, les 3 panneaux côte à côte (`lg:grid-cols-3`), largeur max ≈ 1200 px.
- Seul l'accueil change de largeur ; les autres pages gardent leur colonne.

## 4. Panneaux qui s'allument (`src/components/PanneauLumineux.jsx`, nouveau)

- Enveloppe `Verre` ; écoute `pointermove` / `pointerdown` / `pointerleave` / `pointerup`.
- Pendant le toucher ou le survol : tout le panneau s'illumine (bordure lumineuse, fond plus clair) et un **halo** radial
  suit le pointeur (variables CSS `--x`, `--y`). Au relâchement : extinction en ≈ 0,4 s.
- Les boutons des panneaux brillent aussi au toucher.
- Animations réduites : le panneau s'éclaire, sans halo qui suit.
- Calcul de la position du halo dans une fonction pure `positionHalo(evenement, rect)` (`src/lib/halo.js`), testée.

## Vérification

- `npm test` (dont `src/lib/halo.test.js`), `npm run lint`, `npm run build`.
- Panneau navigateur, accueil à **375 × 812** et **1440 × 900** : `scrollWidth` = largeur, boule Twins visible et qui coule
  au toucher, panneaux qui s'allument ; pages connexion / catalogue : nom « Twins » partout.
- Push de la branche, lien de PR vers `preprod` à ouvrir à la main.
