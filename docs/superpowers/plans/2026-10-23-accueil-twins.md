# Accueil Twins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renommer le site en Twins, faire de la première boule 3D un logo ketchup-mayonnaise qui coule au toucher, étaler l'accueil sur tout l'écran PC et allumer les panneaux au toucher.

**Architecture:** Changements de textes dans les pages ; boule Twins = cas `i === 0` de `medaillon()` dans `src/three/scene-menus.js` (shader injecté par `onBeforeCompile`) ; mise en page PC par classes `lg:` dans `Accueil.jsx` ; panneau lumineux = composant qui pose `--x`/`--y` calculés par une fonction pure testée.

**Tech Stack:** React 19, Tailwind v4, Three.js 0.160, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-23-accueil-twins-design.md`

## Global Constraints

- Interface en français ; 375 px sans défilement horizontal ; `or` réservé à ce qui est offert (le « s » du logo reprend le « o » or actuel, accepté).
- Marque « Twins » ; le mot « duo » nom commun et tout le code interne (`duo-*`, package, ids, `@duo.test`) restent.
- Ketchup `#c8261b`, mayonnaise `#f6e7b4`, coulée de la boule Twins `COULEE_SAUCE = 1.3` s.
- PC = `lg:` (≥ 1024 px), largeur max des panneaux 1200 px.
- Animations réduites : pas de halo qui suit ; repli texte sans WebGL inchangé.

## Review Focus

- Toucher rapide répété sur la boule Twins : l'onde et la coulée repartent proprement (pas d'étirement cumulé).
- Pointeur qui sort du panneau pendant un glisser : le panneau s'éteint (`pointerleave`, `pointercancel`).
- Écran entre 768 et 1023 px : mise en page téléphone, sans débordement.
- Toucher sur un panneau ne doit pas bloquer le défilement vertical (pas de `preventDefault`).
- Halo hors panneau (coordonnées négatives) : borné à 0–100 % (testé dans `halo.test.js`).

---

### Task 1: Renommage Duo → Twins

**Files:** Modify `index.html:14`, `src/components/Layout.jsx:37-41`, `src/components/MenusCarrousel.jsx:150`, `src/lib/menus.js:17,86`,
`src/pages/Abonnement.jsx:61`, `AccueilCommercant.jsx:50`, `AccueilMembre.jsx:22`, `Economies.jsx:63`, `Inscription.jsx:15,84`, `Offre.jsx:192`, `README.md:1`.

- [ ] Remplacer la marque « Duo » par « Twins » à ces lignes ; logo de l'en-tête `twin<span className="text-or">s</span>`, `aria-label="Twins, accueil"`.
- [ ] `grep -rn "Duo\b" src index.html` ne renvoie plus que des noms communs ou du code interne.
- [ ] `npm test` vert ; commit « SCRUM-11 Le site s'appelle Twins ».

### Task 2: Halo des panneaux

**Files:** Create `src/lib/halo.js`, `src/lib/halo.test.js`, `src/components/PanneauLumineux.jsx`; Modify `src/index.css` (utilitaire `lumineux`).

**Interfaces:** Produces `positionHalo({ clientX, clientY }, { left, top, width, height }) -> { x: number, y: number }` (pourcentages 0–100) ; `<PanneauLumineux as className ...props>` (mêmes props que `Verre`).

- [ ] Test : `positionHalo({clientX:150,clientY:50},{left:100,top:0,width:200,height:100})` → `{x:25,y:50}` ; hors panneau `{clientX:0,clientY:500}` → `{x:0,y:100}`.
- [ ] Lancer `npx vitest run src/lib/halo.test.js` : échec (module absent).
- [ ] Implémenter `positionHalo` (borné 0–100).
- [ ] Test vert.
- [ ] `PanneauLumineux` : `pointerenter/move/down` → `--x`, `--y` et `data-allume`; `pointerleave/up/cancel` → retire `data-allume`. CSS `lumineux` : pseudo-élément radial-gradient centré sur `var(--x) var(--y)`, bordure et fond plus clairs quand `[data-allume]`, transition 0,4 s, halo masqué sous `prefers-reduced-motion`.
- [ ] Commit « SCRUM-11 Panneaux qui s'allument au toucher ».

### Task 3: Accueil pleine largeur sur PC

**Files:** Modify `src/pages/Accueil.jsx`, `src/components/MenusCarrousel.jsx` (hauteur du canvas en `lg:`).

**Interfaces:** Consumes `PanneauLumineux` (Task 2).

- [ ] Accueil : section héros `lg:grid lg:grid-cols-2 lg:min-h-[calc(100dvh-5rem)]` ; colonne gauche titre + accroche + bouton « Je m'abonne » visible en `lg:` seulement ; colonne droite `MenusCarrousel`.
- [ ] Panneaux : `Verre` → `PanneauLumineux`, conteneur `lg:max-w-[1200px] lg:grid-cols-3`.
- [ ] Carrousel : canvas plus haut en `lg:` sans changer le téléphone.
- [ ] Commit « SCRUM-11 Accueil pleine largeur sur PC ».

### Task 4: Boule Twins ketchup-mayonnaise

**Files:** Modify `src/three/scene-menus.js` (`medaillon`, boucle, `toucher`).

- [ ] `i === 0` : `SphereGeometry(0.95, 96, 64)` + `MeshPhysicalMaterial` (clearcoat 1, roughness 0.15) avec `onBeforeCompile` : uniforms `uT`, `uTouche` (vec3 local), `uDepuis` ; sommets = ondulation lente + onde depuis `uTouche` amortie ; couleur = mélange ketchup/mayonnaise selon un bruit en spirale. Mot « twins » : plan avec `texte('twins', 512, 160, 120, '#fff6e8')` devant.
- [ ] Coulée : pour `i === 0`, durée `COULEE_SAUCE` et rebond ; `toucher()` renseigne `uTouche` (point en repère local) et `uDepuis`.
- [ ] Commit « SCRUM-11 Boule Twins ketchup-mayonnaise ».

### Task 5: Vérification

- [ ] `npm test`, `npm run lint`, `npm run build` verts.
- [ ] Panneau navigateur 375 × 812 et 1440 × 900 : `scrollWidth` = largeur ; boule visible, coulée au toucher ; panneaux qui s'allument ; « Twins » sur connexion et catalogue. Captures.
- [ ] Push ; lien `https://github.com/dahmane7/ProjetDuo/compare/preprod...SCRUM-11-US01-page-accueil?expand=1`.
