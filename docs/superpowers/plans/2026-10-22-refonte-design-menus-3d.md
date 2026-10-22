# Refonte du design « menus 3D » · plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** donner à Duo sa nouvelle identité « crépuscule » (verre liquide, or pour ce qui est offert), une barre d'onglets, et un accueil en carrousel 3D de 6 menus qui racontent chacun leur histoire.

**Architecture :** les données (menus, états 3D des histoires) sont des modules JS purs testés avec Vitest. Le rendu Three.js vit dans un module sans React (`src/three/scene-menus.js`), chargé en import dynamique par un composant React (`MenusCarrousel`) qui gère l'état et le texte. Les autres écrans sont restylés avec un utilitaire CSS `verre` et les nouveaux tokens.

**Tech Stack :** React 19, Vite 8, Tailwind CSS v4, React Router 8, Three.js `0.160.0` (seule dépendance ajoutée), Vitest (dev).

**Spec :** `docs/superpowers/specs/2026-10-22-refonte-design-menus-3d-design.md`
**Prototype à porter :** `.superpowers/brainstorm/813-1792618908/content/menus-3d.html` (scène, acteurs, états, carrousel) et `concept-dedoublement.html` (cartes avec jumeau doré).

## Global Constraints

- Interface en français, pensée pour 375 px de large, **aucun défilement horizontal**.
- Couleurs de marque toujours préfixées `duo-*` dans `src/index.css` ; `duo-500 #ff5f7e`, `duo-600 #e8476a`.
- Nouveaux tokens : `nuit #160a14`, `prune #3a1630`, `abricot #ffb37a`, `corail #ff7a6b`, `or #ffd27a`, `creme #fff4ea`. L'or est réservé à ce qui est offert.
- Polices : Fraunces 900 (titres, `font-titre`), Inter (texte, `font-sans`).
- Seule dépendance d'exécution ajoutée : `three@0.160.0`, version épinglée, jamais dans le premier chargement (import dynamique).
- Aucune modification de `supabase/schema.sql`, de `.env` ni des catégories RG11 (`src/lib/categories.js`).
- Routes déclarées dans `src/App.jsx`, dans les blocs Dev A (membre) / Dev B (commerçant) existants.
- Menu 1 seul « disponible » ; menus 2 à 6 jouables mais leur bouton final affiche « Bientôt » (désactivé).
- Chaque commit se termine par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Aller-retour Accueil ↔ Offres répété** : un seul canvas, pas de contexte WebGL qui s'accumule (« Too many active WebGL contexts ») → test manuel Tâche 4, étape 6.
2. **Pas de WebGL ou `prefers-reduced-motion`** : la page reste lisible et utilisable, histoires en texte → Tâche 4, étape 7.
3. **375 px** : les médaillons hors écran et les puces de catégories ne créent pas de défilement horizontal de la page → Tâches 4 et 6 (`document.documentElement.scrollWidth === 375`).
4. **Étape hors bornes ou menu changé pendant une histoire** (double clic sur « Suivant », retour puis autre menu) : `etatHistoire` borne `p` à [0, 3] et `menuVoisin` boucle → tests Tâches 2 et 3.
5. **Flèches du clavier** quand le focus est dans un champ ou que l'histoire est ouverte : elles ne changent pas de menu → Tâche 4, étape 6.

---

## Fichiers

| Fichier | Responsabilité |
|---|---|
| `src/index.css` | Tokens, polices, utilitaires `verre` et `defile`, fond `body`. |
| `index.html` | Polices Fraunces + Inter, `theme-color` `#160a14`. |
| `src/components/Verre.jsx` | Panneau en verre réutilisable. |
| `src/lib/menus.js` (+ `menus.test.js`) | Les 6 menus et `menuVoisin`. |
| `src/three/histoires.js` (+ `histoires.test.js`) | États 3D des histoires, interpolation. |
| `src/lib/webgl.js` | `webglDisponible()` sans charger Three.js. |
| `src/three/scene-menus.js` | Rendu Three.js (porté du prototype). |
| `src/components/MenusCarrousel.jsx` | Canvas + panneaux menu / histoire. |
| `src/components/TabBar.jsx`, `Layout.jsx` | Barre d'onglets, fond crépuscule. |
| `src/pages/Economies.jsx` | Page d'attente de l'onglet Économies. |
| `src/pages/Accueil.jsx`, `Catalogue.jsx`, `PageIntrouvable.jsx` | Écrans restylés. |
| `src/components/OutletCard.jsx`, `CategoryChips.jsx`, `InfoBanner.jsx` | Restylés (jumeau doré, puces en verre). |
| `CLAUDE.md` | Stack (+ `three`, Vitest, `npm test`) et couleurs. |

---

### Task 1 : Identité de base (tokens, polices, verre)

**Files :** Modify `src/index.css`, `index.html` · Create `src/components/Verre.jsx`

**Interfaces :**
- Produces : classes Tailwind `bg-nuit`, `text-creme`, `text-or`, `bg-or`, `from-abricot`, `to-corail`, `font-titre`… ; utilitaire `verre` ; `export default function Verre({ as: Tag = 'div', className = '', ...props })` qui rend `<Tag className={`verre ${className}`} {...props} />`.

- [ ] **Step 1 : tokens dans `@theme`** — garder les tokens existants (`encre`, `fond`, `ligne`, `valide`…) pour les écrans non restylés ; remplacer `duo-50…700` par `#fff0f2 #ffe0e6 #ffc2cd #ff5f7e #e8476a #c7365a` ; ajouter les 6 tokens des Global Constraints ; `--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;` et `--font-titre: 'Fraunces', ui-serif, Georgia, serif;`.
- [ ] **Step 2 : `body`** — `@apply bg-nuit text-creme antialiased;` avec en `background-image` les trois dégradés du prototype (`.ciel` de `menus-3d.html`) en `background-attachment: fixed`.
- [ ] **Step 3 : `@utility verre`** — reprendre exactement la règle `.verre` du prototype (dégradé `rgba(255,240,230,.16)→.05`, bord `rgba(255,235,220,.22)`, ombre intérieure, `backdrop-filter: blur(18px) saturate(140%)` + préfixe `-webkit-`). Garder `@utility defile` tel quel. `:focus-visible` passe en `outline-or`.
- [ ] **Step 4 : `index.html`** — remplacer Noto Sans par `family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Inter:wght@400;600;800&display=swap` ; `theme-color` → `#160a14`.
- [ ] **Step 5 : créer `Verre.jsx`** (signature ci-dessus).
- [ ] **Step 6 : vérifier** — `npm run build` → « built » sans erreur ; `npm run dev`, ouvrir http://localhost:5173 : fond prune/abricot visible.
- [ ] **Step 7 : commit** — `git add src/index.css index.html src/components/Verre.jsx && git commit -m "SCRUM-11 Identité crépuscule : tokens, polices, verre"`

### Task 2 : Données des menus (TDD)

**Files :** Create `src/lib/menus.js`, `src/lib/menus.test.js` · Modify `package.json`, `vite.config.js`

**Interfaces :**
- Produces :
  - `MENUS: Array<{ id, titre, titreOr, court, texte, dest, disponible: boolean, etapes: Array<{ titre, texte }> }>` (6 éléments, 4 étapes chacun) ;
  - `DESTINATIONS = ['ami','voisine','sdf','jour','etudiant','suivant']` ;
  - `menuVoisin(i: number, delta: number, n = MENUS.length): number` (boucle).

- [ ] **Step 1 : installer Vitest** — `npm install -D vitest@3` ; script `"test": "vitest run"` ; dans `vite.config.js` ajouter `test: { environment: 'node' }`.
- [ ] **Step 2 : écrire `menus.test.js`**

```js
import { describe, expect, it } from 'vitest'
import { DESTINATIONS, MENUS, menuVoisin } from './menus.js'

describe('MENUS', () => {
  it('contient 6 menus de 4 étapes, dans l’ordre des destinations', () => {
    expect(MENUS).toHaveLength(6)
    expect(MENUS.map((m) => m.dest)).toEqual(DESTINATIONS)
    MENUS.forEach((m) => expect(m.etapes).toHaveLength(4))
  })
  it('seul le menu 1 (1 acheté, 1 offert) est disponible', () => {
    expect(MENUS.filter((m) => m.disponible).map((m) => m.id)).toEqual(['duo'])
  })
})

describe('menuVoisin', () => {
  it('avance, recule et boucle', () => {
    expect(menuVoisin(0, 1)).toBe(1)
    expect(menuVoisin(5, 1)).toBe(0)
    expect(menuVoisin(0, -1)).toBe(5)
    expect(menuVoisin(2, -7)).toBe(1)
  })
})
```

- [ ] **Step 3 : lancer** — `npm test` → FAIL « Failed to resolve import "./menus.js" ».
- [ ] **Step 4 : écrire `menus.js`** — textes exacts : reprendre `MENUS` du prototype (`titre` coupé en `titre` + `titreOr`, ex. `'1 pour vous,'` / `'1 pour la voisine'`) ; ids `duo, voisine, solidaire, jour, etudiant, suivant`. `menuVoisin` = `((i + delta) % n + n) % n`.
- [ ] **Step 5 : lancer** — `npm test` → 3 tests PASS.
- [ ] **Step 6 : commit** — `git add package.json package-lock.json vite.config.js src/lib/menus.js src/lib/menus.test.js && git commit -m "SCRUM-11 Données des 6 menus et Vitest"`

### Task 3 : États 3D des histoires (TDD)

**Files :** Create `src/three/histoires.js`, `src/three/histoires.test.js`

**Interfaces :**
- Consumes : `DESTINATIONS` (Task 2).
- Produces :
  - `ACTEURS = ['A','B','toi','ami','voisine','sdf','etudiant','suivant','com','maison','coeur','chaine']` ;
  - type `Etat = { [acteur]: [x, y, z, echelle], an: number, mini: number, glow: number, cam: [x, y, z, lx, ly, lz] }` ;
  - `HISTOIRES: Record<dest, Etat[4]>` ;
  - `lisse(x: number): number` (smoothstep) ;
  - `etatHistoire(dest: string, p: number): Etat` (`p` borné à [0, 3], interpolation lissée entre `HISTOIRES[dest][floor(p)]` et l'étape suivante).

- [ ] **Step 1 : écrire `histoires.test.js`**

```js
import { describe, expect, it } from 'vitest'
import { DESTINATIONS } from '../lib/menus.js'
import { ACTEURS, HISTOIRES, etatHistoire, lisse } from './histoires.js'

describe('HISTOIRES', () => {
  it('a 4 états complets pour chaque destination', () => {
    DESTINATIONS.forEach((d) => {
      expect(HISTOIRES[d]).toHaveLength(4)
      HISTOIRES[d].forEach((e) => ACTEURS.forEach((a) => expect(e[a]).toHaveLength(4)))
    })
  })
  it('étapes 1 et 2 communes : la tasse offerte (B) est cachée puis visible', () => {
    expect(HISTOIRES.ami[0].B[3]).toBe(0)
    expect(HISTOIRES.ami[1].B[3]).toBeGreaterThan(0)
  })
})

describe('etatHistoire', () => {
  it('rend exactement les états aux étapes entières', () => {
    expect(etatHistoire('sdf', 2)).toEqual(HISTOIRES.sdf[2])
  })
  it('borne p entre 0 et 3 (double clic, retour)', () => {
    expect(etatHistoire('voisine', 7)).toEqual(HISTOIRES.voisine[3])
    expect(etatHistoire('voisine', -2)).toEqual(HISTOIRES.voisine[0])
  })
  it('interpole à mi-chemin', () => {
    const a = HISTOIRES.ami[0].toi[0], b = HISTOIRES.ami[1].toi[0]
    expect(etatHistoire('ami', 0.5).toi[0]).toBeCloseTo((a + b) / 2)
  })
  it('lisse vaut 0, 0.5 et 1 aux bornes et au milieu', () => {
    expect([lisse(0), lisse(0.5), lisse(1)]).toEqual([0, 0.5, 1])
  })
})
```

- [ ] **Step 2 : lancer** — `npm test` → FAIL (module introuvable).
- [ ] **Step 3 : écrire `histoires.js`** — porter `CACHE`, `ent`, `dbl`, `S()` et `HIST` du prototype tels quels (mêmes nombres) ; `etatHistoire` mélange chaque tableau d'acteur et `cam`, et les nombres `an`, `mini`, `glow`.
- [ ] **Step 4 : lancer** — `npm test` → tous PASS.
- [ ] **Step 5 : commit** — `git commit -m "SCRUM-11 États 3D des histoires"` (avec les deux fichiers).

### Task 4 : Carrousel des menus 3D

**Files :** Create `src/lib/webgl.js`, `src/three/scene-menus.js`, `src/components/MenusCarrousel.jsx` · Modify `package.json`

**Interfaces :**
- Consumes : `MENUS`, `menuVoisin` (Task 2) ; `ACTEURS`, `etatHistoire` (Task 3) ; `Verre` (Task 1).
- Produces :
  - `webglDisponible(): boolean` (crée un canvas, teste `getContext('webgl2') || getContext('webgl')`) ;
  - `creerSceneMenus(canvas: HTMLCanvasElement, { reduit: boolean }): { choisirMenu(i: number): void, ouvrirHistoire(dest: string): void, etape(n: number): void, fermerHistoire(): void, detruire(): void }` ;
  - `export default function MenusCarrousel()` (aucune prop).

- [ ] **Step 1 : installer** — `npm install three@0.160.0`.
- [ ] **Step 2 : `scene-menus.js`** — porter du prototype : environnement crépuscule, lumières, sol à ombres, matériaux `verre`/`or`/`argile`, fabriques `tasse`, `personne`, `commerceObj`, `maisonObj`, `coeurObj`, anneau « DUO DU JOUR », étincelles, `medaillon(i)` et le carrousel, et la boucle (états via `etatHistoire`, caméra menus ↔ histoire). Ajouts par rapport au prototype : taille prise sur `canvas.clientWidth/Height` via `ResizeObserver` ; boucle en pause si `document.hidden` ou canvas hors écran (`IntersectionObserver`) ; `reduit` → interpolations instantanées et pas de rotation automatique ; `detruire()` arrête la boucle, déconnecte les observateurs, appelle `dispose()` sur géométries, matériaux, textures, puis `renderer.dispose()` et `renderer.forceContextLoss()`.
- [ ] **Step 3 : `MenusCarrousel.jsx`** — état `menu`, `mode` (`'menus' | 'histoire'`), `etape`. Si `webglDisponible()` et pas `prefers-reduced-motion`, `useEffect` fait `import('../three/scene-menus.js')`, crée la scène et appelle `detruire()` au démontage ; sinon pas de canvas. Panneau menus (`Verre`) : `0N / 06 · Menu`, `titre` + `<span className="text-or">{titreOr}</span>`, `texte`, boutons ‹ « Voir l'histoire » › (aria-labels « Menu précédent » / « Menu suivant »). Panneau histoire : `court · n/4`, titre, texte dans un `aria-live="polite"`, boutons ⌂ (« Retour aux menus ») et « Suivant » ; à l'étape 4 : menu disponible → « Voir les offres ✦ » (`navigate('/catalogue')`), sinon bouton désactivé « Bientôt » + « Ce menu arrive bientôt ». Glisser (> 40 px) et flèches ← → changent de menu **uniquement en mode menus et si `event.target` n'est pas un champ**. Canvas `aria-hidden="true"`, cibles ≥ 44 px.
- [ ] **Step 4 : brancher temporairement** — afficher `<MenusCarrousel />` en tête de `Accueil.jsx` (remplacé proprement en Task 6).
- [ ] **Step 5 : vérifier le découpage** — `npm run build` : un fichier `dist/assets/scene-menus-*.js` séparé contient Three.js ; le fichier `index-*.js` ne grossit pas de plus de ~5 Ko.
- [ ] **Step 6 : vérifier dans le navigateur (375 × 812)** — les 6 menus défilent (‹ ›, glisser, flèches) ; les 6 histoires vont jusqu'à l'étape 4 ; menu 1 → `/catalogue`, menus 2 à 6 → « Bientôt » désactivé ; flèches sans effet pendant une histoire ; `document.documentElement.scrollWidth === 375` ; 10 allers-retours Accueil ↔ Offres : `document.querySelectorAll('canvas').length === 1` et aucune erreur console.
- [ ] **Step 7 : vérifier le repli** — émulation `prefers-reduced-motion: reduce` puis WebGL désactivé (`webglDisponible` forcé à `false` le temps du test) : pas de canvas, panneaux et histoires en texte utilisables.
- [ ] **Step 8 : commit** — `git commit -m "SCRUM-11 Carrousel des menus en 3D"` (les 3 fichiers créés, `package.json`, `package-lock.json`, `Accueil.jsx`).

### Task 5 : Barre d'onglets et Layout

**Files :** Create `src/components/TabBar.jsx`, `src/pages/Economies.jsx` · Modify `src/components/Layout.jsx`, `src/App.jsx`, `src/components/Icon.jsx`

**Interfaces :**
- Consumes : `Verre`, `Icon` (existe déjà : `tag` pour Offres).
- Produces : `export default function TabBar()` ; icônes `home`, `piggy`, `user` ajoutées à `Icon.jsx` (même format de tracé 24 × 24 que les autres) ; route `/economies` (bloc membre Dev A).

- [ ] **Step 0 : icônes** — ajouter `home`, `piggy`, `user` dans `src/components/Icon.jsx`.

- [ ] **Step 1 : `TabBar.jsx`** — `<nav aria-label="Navigation principale">` fixe en bas (`inset-x-3 bottom-3`, `rounded-[26px]`, `verre`), 4 `NavLink` : Accueil `/` (`end`), Offres `/catalogue`, Économies `/economies`, Compte `/connexion`. Onglet actif : pastille dégradé `from-or to-corail` + halo, `aria-current` géré par `NavLink`.
- [ ] **Step 2 : `Layout.jsx`** — supprimer en-tête, menu burger et pied de page ; garder l'effet de défilement vers l'ancre ; rendre un petit en-tête (logo `du<span className="text-or">o</span>` en `font-titre`), `<main className="flex-1 pb-28">` (place pour la barre) et `<TabBar />`.
- [ ] **Step 3 : `Economies.jsx`** — `Verre` centré : titre « Tes économies » + `text-or` « arrivent bientôt », phrase « Chaque duo validé en caisse s'ajoutera ici. », lien « Voir les offres ».
- [ ] **Step 4 : `App.jsx`** — ajouter `<Route path="economies" element={<Economies />} />` dans le bloc « Parcours membre (Dev A) ».
- [ ] **Step 5 : vérifier** — `npm run build && npm run lint` sans erreur ; en 375 px : barre visible sur toutes les pages, le dernier élément de chaque page n'est pas masqué par la barre, Tab au clavier atteint les 4 onglets.
- [ ] **Step 6 : commit** — `git commit -m "SCRUM-11 Barre d'onglets et Layout crépuscule"`

### Task 6 : Pages Accueil et Offres

**Files :** Modify `src/pages/Accueil.jsx`, `src/pages/Catalogue.jsx`, `src/components/OutletCard.jsx`, `src/components/CategoryChips.jsx`, `src/components/InfoBanner.jsx`

**Interfaces :**
- Consumes : `MenusCarrousel` (Task 4), `Verre` (Task 1), `OFFRES_EXEMPLE`, `jourParis`, `CATEGORIES` (existants).

- [ ] **Step 1 : `Accueil.jsx`** — réécrire : titre `font-titre` « Un achat. » / dégradé « À qui le deuxième ? », `<MenusCarrousel />`, puis trois sections `Verre` avec ancres conservées : `#comment` (3 pas : « Tu choisis une offre », « Tu la montres en caisse », « Le commerçant tape son code : le deuxième est offert »), `#abonnement` (lien « Je m'abonne » → `/connexion`), `#commercants` (lien « Je suis commerçant » → `/connexion`). Supprimer le code et les imports devenus inutiles.
- [ ] **Step 2 : `OutletCard.jsx`** — carte en `verre` ; derrière elle, un jumeau absolu décalé `translate(10px,10px) rotate(2.5deg)`, bord pointillé `or`, badge « OFFERT » ; économie affichée en `text-or` (`−{economie} €`) ; garder lien, photo, « Valable aujourd'hui » / « Le lundi et mardi », `Pas aujourd'hui`. Le jumeau a `aria-hidden="true"` et l'animation de flottement est coupée sous `motion-reduce`.
- [ ] **Step 3 : `CategoryChips.jsx`** — puces en `verre` ; active : `bg-linear-to-r from-[#ffd9a0] to-corail text-prune font-semibold`. `aria-pressed` conservé.
- [ ] **Step 4 : `InfoBanner.jsx` et `Catalogue.jsx`** — bandeau en `verre` arrondi dans la marge `px-4` ; titres `font-titre` ; remplacer `bg-white`, `bg-fond`, `text-encre-doux`, `border-ligne` par leurs équivalents sur fond sombre (`verre`, `text-creme/75`, `border-white/10`) ; liste en une colonne sous 640 px avec `gap-7` (place pour le jumeau).
- [ ] **Step 5 : vérifier (375 × 812)** — `/` et `/catalogue` : `document.documentElement.scrollWidth === 375` ; filtre catégorie et « Valables aujourd'hui » fonctionnent comme avant ; « Aucun résultat » s'affiche avec un filtre vide ; contraste du texte creme sur verre ≥ 4,5:1 (outil d'audit du navigateur).
- [ ] **Step 6 : commit** — `git commit -m "SCRUM-11 Accueil des menus et catalogue aux jumeaux dorés"`

### Task 7 : 404, CLAUDE.md et vérification finale

**Files :** Modify `src/pages/PageIntrouvable.jsx`, `CLAUDE.md`

- [ ] **Step 1 : 404** — `Verre` centré, titre `font-titre` « Cette tasse cherche son double », texte « Cette page n'existe pas encore ou le lien est incomplet. », bouton dégradé « Revenir à l'accueil ».
- [ ] **Step 2 : CLAUDE.md** — Stack : ajouter « Three.js 0.160 (carrousel des menus, chargé en import dynamique) » et « Vitest : `npm test` » ; section Commandes : `npm test` ; ligne couleurs : « couleurs `duo-*`, `or` (réservé à ce qui est offert), `nuit`, `prune`, `abricot`, `corail`, `creme` dans `src/index.css` ».
- [ ] **Step 3 : vérification complète** — `npm test`, `npm run lint`, `npm run build` sans erreur ; refaire les contrôles de la spec section 10 et des Global Constraints (page d'accueil, routes dans les bons blocs, `git grep` sans clé, `.env` ignoré, 375 px).
- [ ] **Step 4 : commit** — `git commit -m "SCRUM-11 Page 404 et CLAUDE.md"`
- [ ] **Step 5 : avant la PR** — `git fetch origin && git merge origin/preprod` (après la fusion de SCRUM-13 si possible), résoudre les conflits de `Layout.jsx` / `App.jsx` en gardant les routes du collègue, relancer l'étape 3, pousser, PR vers `preprod`.
