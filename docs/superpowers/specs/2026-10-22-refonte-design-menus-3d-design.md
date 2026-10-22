# Refonte du design de Duo · « Les menus 3D »

- **Date** : 22 octobre 2026
- **Branche** : `SCRUM-11-refonte-design-menus-3d` (créée depuis `preprod`)
- **Statut** : spec à relire avant le plan d'implémentation
- **Prototype de référence** : `.superpowers/brainstorm/813-1792618908/content/menus-3d.html`
  (et `concept-dedoublement.html` pour les écrans Offres et Caisse)

## 1. Pourquoi

Le design actuel (SCRUM-11, PR n°1) s'inspire de l'app The Entertainer et lui ressemble trop.
On veut une identité propre à Duo, **chaleureuse et futuriste**, qui fasse comprendre le principe
« 1 acheté = 1 offert » en un coup d'œil, et qui raconte une histoire humaine : le deuxième
produit va toujours à quelqu'un.

### Ce que l'utilisateur a demandé

- Une identité qui ne ressemble pas à Entertainer.
- « Complice et chaleureux », « futuriste, nouvelle génération », avec de la vraie 3D.
- Une navigation d'app mobile : barre d'onglets en bas.
- Des **menus**, chacun racontant une histoire en 3D : 1 acheté 1 offert ; 1 pour vous, 1 pour la
  voisine ; 1 pour vous, 1 pour un sans-abri ; d'autres idées en plus.
- **Tout en gardant ce que demandent les tickets.**

### Ce qui est déduit (à corriger si besoin)

- Seul le menu 1 correspond aux règles actuelles du dossier « Projet 2 · Duo ». Les menus 2 à 6
  ajoutent des règles de gestion : ils deviennent des stories Jira séparées (section 7).
- Pour la démo de vendredi, les histoires 2 à 6 sont jouables mais marquées « Bientôt ».

## 2. Exigences des tickets conservées

La refonte change l'apparence, pas les fonctions. Restent vrais après la refonte :

| Source | Exigence |
|---|---|
| US01 (SCRUM-11) | Application React (Vite) qui affiche une page d'accueil. |
| US01 | Clés Supabase en variables d'environnement, jamais dans le code ; `.env` ignoré. |
| US01 | CLAUDE.md à jour (stack, commandes, règles) : on y ajoute `three` et les nouvelles couleurs. |
| US02 (SCRUM-12) | Aucun changement de schéma dans cette story ; les catégories RG11 restent celles de `src/lib/categories.js`. |
| CLAUDE.md | Interface en français, pensée pour 375 px, **sans défilement horizontal**. |
| CLAUDE.md | Routes déclarées dans `src/App.jsx`, blocs Dev A (membre) et Dev B (commerçant) conservés. |
| CLAUDE.md | Couleurs de marque `duo-*` dans `src/index.css` (on garde le préfixe, on change les valeurs). |
| Parcours membre | S'abonner, trouver une offre (catalogue par catégorie et par jour), la faire valider en caisse avec le code à 4 chiffres du commerçant, voir ses économies. |
| Parcours commerçant | Créer ses offres, choisir leurs jours, suivre leur utilisation. |

## 3. Direction visuelle

- **Concept** : *le Dédoublement*. Ce que tu achètes se dédouble ; le double, en or, est offert.
- **Palette « crépuscule »** (tokens dans `src/index.css`) :
  - fond : prune nuit `#160a14` → `#3a1630`, halo abricot `#ff9a6b` en haut ;
  - marque `duo-*` : corail / rose (`duo-500 #ff5f7e`, `duo-600 #e8476a`…) ;
  - `or` `#ffd27a` : réservé à **tout ce qui est offert** (double, badges « Offert », économies) ;
  - `creme` `#fff4ea` pour le texte, `abricot` `#ffb37a`.
- **Typographie** : Fraunces 900 pour les titres (chaleureux, éditorial), Inter pour le texte.
- **Verre liquide** : panneaux translucides (flou, bord clair, liseré lumineux en haut), utilisés
  pour les cartes, la barre d'onglets et les panneaux d'histoire. Contraste du texte vérifié
  (AA) sur le fond le plus clair.
- **3D** : seulement là où elle raconte quelque chose (carrousel des menus, histoires, animation
  de validation). Le reste de l'app est en 2D, rapide.

## 4. Structure et navigation

Barre d'onglets fixe en bas, en verre : **Accueil · Offres · Économies · Compte**.
L'en-tête « site web » et le pied de page actuels disparaissent de `Layout.jsx`.
Le commerçant connecté voit ses propres onglets (Mes offres · Tableau de bord · Compte) ; ils
sont ajoutés par les stories du parcours commerçant, pas par celle-ci.

## 5. Écrans

### 5.1 Accueil : le carrousel des menus (cette story)

- Titre : « Un achat. À qui le deuxième ? »
- Carrousel 3D de 6 médaillons (verre + bord or), un par menu. Navigation : glisser, boutons
  ‹ ›, flèches du clavier. Panneau en verre en bas : numéro, titre, phrase, « Voir l'histoire ».
- « Voir l'histoire » : la caméra plonge dans la scène, l'histoire se joue en **4 étapes**
  (bouton « Suivant ») :
  1. Tu achètes (commun) · 2. Il se dédouble en or (commun) · 3. Le double part vers le
     destinataire du menu · 4. Conclusion + bouton.
- Bouton final : menu 1 → « Voir les offres » (catalogue) ; menus 2 à 6 → « Bientôt » (désactivé,
  avec l'explication « Ce menu arrive bientôt »).
- Sous le carrousel, accessibles en défilant : « Comment ça marche » (3 pas), abonnement
  (lien vers la page d'abonnement du parcours membre), « Pour les commerçants ».

### 5.2 Offres : le catalogue (cette story, restylage)

- Puces de catégories RG11 en verre, filtre « valable aujourd'hui » (`jourParis()`), comme
  aujourd'hui.
- Chaque carte d'offre a son **jumeau doré en pointillés** décalé derrière elle, badge « OFFERT »,
  montant économisé en or. Données : toujours `OFFRES_EXEMPLE` tant que la story catalogue ne
  branche pas Supabase.

### 5.3 404 (cette story, restylage)

Même fond et même verre ; une tasse seule « qui cherche son double ».

### 5.4 Écrans des autres stories (guide, pas dans cette story)

Les stories concernées réutilisent les composants de la section 6 :
- **Fiche offre** : photo, jours en puces, bouton « Utiliser en caisse ».
- **Validation en caisse** : clavier en verre pour le code à 4 chiffres ; en cas de succès, les
  tickets « Acheté 1 » et « Offert +1 » se rejoignent (animation CSS, pas de Three.js).
- **Économies** : total en or, historique des duos.
- **Commerçant** : mêmes panneaux de verre et mêmes puces de jours.

## 6. Architecture front

| Fichier | Rôle |
|---|---|
| `src/index.css` | Nouveaux tokens (`duo-*` revus, `or`, `creme`, `abricot`, `nuit`, `prune`), utilitaire `verre`, polices. |
| `src/components/Layout.jsx` | Fond crépuscule + `<Outlet />` + `TabBar`. |
| `src/components/TabBar.jsx` | Barre d'onglets en verre, `NavLink`, libellés accessibles. |
| `src/components/Verre.jsx` | Panneau en verre réutilisable (`as`, `className`). |
| `src/components/OutletCard.jsx` | Restylée : carte + jumeau doré. |
| `src/components/CategoryChips.jsx` | Restylée en verre. |
| `src/lib/menus.js` | Données des 6 menus : titre, phrase, destinataire, 4 étapes, `disponible` (true pour le menu 1). |
| `src/three/scene-menus.js` | Moteur Three.js pur (pas de React) : crée la scène, expose `monter(canvas)`, `choisirMenu(i)`, `ouvrirHistoire()`, `etape(n)`, `fermer()`, `detruire()`. Porté du prototype. |
| `src/components/MenusCarrousel.jsx` | Composant React : canvas + panneaux ; charge `scene-menus.js` en **import dynamique** (`React.lazy`/`import()`) pour ne pas alourdir le premier chargement. |
| `src/pages/Accueil.jsx` | Réécrite autour de `MenusCarrousel`. |
| `src/pages/Catalogue.jsx`, `PageIntrouvable.jsx` | Restylées. |

**Dépendance ajoutée** : `three` uniquement (pas de React Three Fiber ni de GSAP : le prototype
s'en passe et ça limite le poids). Version épinglée.

**Performance et robustesse**
- `three` est chargé à part ; la page d'accueil s'affiche (titre, panneau, boutons) avant la 3D.
- Pixel ratio limité à 2 ; rendu mis en pause quand l'onglet est caché ou le canvas hors écran.
- Pas de WebGL, ou `prefers-reduced-motion` : image fixe du médaillon et étapes en texte seul ;
  tout reste utilisable.
- Nettoyage complet (`detruire()`) au démontage pour éviter les fuites en navigation.

**Accessibilité** : boutons ‹ › et « Suivant » au clavier, `aria-live` sur le texte de l'étape,
canvas `aria-hidden` (l'information est toujours dans le texte), cibles tactiles ≥ 44 px.

## 7. Menus 2 à 6 : stories séparées à créer dans Jira

Chaque story ajoute une règle de gestion absente du dossier ; à valider avec l'équipe avant d'en
démarrer une. Point commun : `redemptions` gagnera une colonne `mode`
(`duo`, `voisine`, `solidaire`, `jour`, `etudiant`, `suivant`), écrite par `valider_offre`.

| Menu | Story proposée | Règle à définir | Impact données |
|---|---|---|---|
| 2 · Pour la voisine | « Offrir mon deuxième à un voisin » | Le membre emporte le deuxième produit pour quelqu'un ; rien à vérifier en caisse ? | `mode = 'voisine'` |
| 3 · Pour un sans-abri | « Mettre mon deuxième en attente » | Le deuxième est mis en attente chez le commerçant ; toute personne peut le demander au comptoir, sans app ; le commerçant décrémente le stock. | `mode = 'solidaire'`, compteur d'attente par commerce, action commerçant « remis » |
| 4 · Duo du jour | « Duo du jour » | Une offre mise en avant par jour ; le deuxième est de la **même gamme** ; qui la choisit (rotation, commerçant volontaire) ? | champ `duo_du_jour date` ou table dédiée |
| 5 · Pour un étudiant | « Offrir mon deuxième à un étudiant » | Comment l'étudiant le reçoit (même principe d'attente que le menu 3, réservé sur carte étudiante ?) | `mode = 'etudiant'` |
| 6 · Pour le suivant | « Offrir au client suivant » | Le deuxième est offert au client suivant au comptoir ; chaîne comptée par commerce. | `mode = 'suivant'`, compteur de chaîne |

## 8. Coordination

- La PR n°2 de votre collègue (SCRUM-13, inscription) touche probablement `Layout.jsx` et
  `App.jsx`. Ordre conseillé : fusionner SCRUM-13 d'abord, puis mettre cette branche à jour
  avec `preprod` avant la PR, pour régler les conflits une seule fois.
- Gel du code vendredi 10 h 30 : la refonte doit être fusionnée avant, sinon on garde l'ancien design.

## 9. Hors périmètre

Les règles et écrans des menus 2 à 6 ; le branchement Supabase du catalogue ; les écrans fiche
offre, validation, économies, abonnement et commerçant (ils réutiliseront les composants) ;
toute modification de `supabase/schema.sql`.

## 10. Vérification

1. `npm run lint` et `npm run build` passent ; le build montre `three` dans un fichier séparé.
2. Dans le navigateur en 375 × 812 : aucun défilement horizontal ; carrousel, 6 histoires
   jouables, menu 1 mène au catalogue, menus 2 à 6 affichent « Bientôt ».
3. Clavier seul : on parcourt les menus et les étapes.
4. `prefers-reduced-motion` activé et WebGL désactivé : la page reste lisible et utilisable.
5. Navigation Accueil → Offres → Accueil plusieurs fois : pas d'erreur console, pas de canvas
   en double.
6. Les critères de la section 2 sont toujours vrais (page d'accueil, routes, `.env`, 375 px).
