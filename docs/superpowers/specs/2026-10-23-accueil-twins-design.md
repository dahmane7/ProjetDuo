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

## 2. Boule Twins : sphère de points qui éclate (`src/three/scene-menus.js`, `src/three/eclat.js`)

Révisé le 23/10/2026 : la boule ketchup-mayonnaise ne plaisait pas ; l'utilisateur a choisi « un truc futuriste,
simple, qui éclate quand on le touche ».

- Le médaillon `i === 0` est une **sphère de 1 500 points lumineux** (cyan `#5ff0ff`, violet `#9a6bff`, un peu
  d'abricot `#ffb37a` : l'or reste réservé à ce qui est offert), qui respire et tourne lentement, avec un cœur de verre
  sombre et le mot **« twins »** au centre.
- **Au toucher** : flash, les points **éclatent** dans toutes les directions (0,3 s) puis reviennent se reformer
  (jusqu'à 1,6 s, `DUREE_ECLAT`). Le rythme est la fonction pure `eclatement(k)` d'`eclat.js`, testée. Le carrousel
  attend la fin de l'éclatement avant de tourner. Les 5 autres médaillons ne changent pas (ils coulent toujours).
- Repli sans WebGL ou avec animations réduites : inchangé (texte du menu).

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
