# Twins · Scénario de démo (US13)

Lien en ligne : **https://projet-duo-delta.vercel.app** · Durée de la démo : **6 à 7 minutes**.
Gel du code vendredi à **10 h 30** : après, plus aucune fusion, sauf correction bloquante.

Deux rôles : **Membre** (Léa, sur un téléphone) et **Commerçant** (La Table Zen, sur un
deuxième téléphone, ou un ordinateur avec la fenêtre réduite à la largeur d'un téléphone).

---

## Avant la démo (le matin même)

- [ ] Toutes les PR prévues sont fusionnées sur `main` avant 10 h 30, et le lien en ligne est à jour.
- [ ] Le binôme lance **`supabase/schema.sql`** puis **`supabase/seed-demo.sql`** dans l'éditeur
      SQL de Supabase (copié depuis l'éditeur de code, Run sans sélection).
- [ ] Noter **hors du dépôt** les valeurs affichées en fin de script : mot de passe de Léa et de
      La Table Zen, code de caisse. Elles changent à chaque exécution.
- [ ] Vérifier la ligne de contrôle du script : 7 commerces, environ 80 à 90 utilisations à
      La Table Zen, 4 pour Léa.
- [ ] Téléphone 1 connecté en **Léa** (`lea.demo@duo.test`), téléphone 2 en **La Table Zen**
      (`table-zen.demo@duo.test`). Luminosité au maximum, notifications coupées.
- [ ] Un onglet de navigation privée pour l'acte 1 (visiteur non connecté).
- [ ] Plan B ouvert dans un coin : captures d'écran ou vidéo de la répétition.

---

## Acte 1 · Le visiteur (1 min)

1. Onglet privé, page d'accueil : la promesse « 1 acheté = 1 offert » et le prix de l'abonnement.
2. **Offres** : le catalogue est public. Toucher une catégorie, puis **Plus de filtres** et
   **Valables aujourd'hui seulement** : les deux filtres se combinent.
3. Montrer **Le Café du Lundi** : un vendredi, sa carte affiche **« Dès lundi »** (jours de validité).
4. Ouvrir une offre et toucher **Utiliser** : le visiteur est invité à **créer un compte** (RG03).

> À dire : « Tout ce qui est sensible est protégé dans la base, pas seulement à l'écran. »

## Acte 2 · Léa, membre abonnée (1 min 30)

1. Téléphone 1, **Compte** : l'espace de Léa affiche **« Abonné jusqu'au … »** (12 mois).
2. **Économies** : son total sur l'abonnement en cours et son historique (4 utilisations).
3. **Offres**, puis **La Table Zen** (« 1 plat acheté = 1 plat offert », 18 €) : fiche du commerce,
   conditions, jours, valeur, **utilisations restantes 1 / 1**.

## Acte 3 · En caisse (2 min) : le moment clé

1. Léa touche **Utiliser** : écran à tendre au commerçant, avec le nom du commerce et l'offre.
2. Le commerçant tape un **code faux** : **« Code incorrect »**, rien n'est enregistré.
3. Léa passe sur l'onglet **QR code** : QR, code court de 6 caractères, compte à rebours de 5 minutes.
4. Téléphone 2 (La Table Zen) : **Scanner un QR code**, viser le QR de Léa.
   *Si l'appareil photo ne lit pas : taper le code court. Ou revenir au pavé et taper le bon code.*
5. Les deux écrans affichent **« Offre validée »** : numéro de validation, heure, **18 €**.
6. Léa touche **Mes économies** : le total a augmenté de 18 €, sans recharger la page.
7. Retour sur l'offre : **« Vous avez déjà utilisé cette offre autant de fois que permis »** (limite RG06).

> À dire : « Quatre contrôles dans la base avant d'enregistrer : abonnement, jour, limite, code. »

## Acte 4 · La Table Zen, commerçant (1 min 30)

1. Téléphone 2, espace commerçant : la fiche du restaurant.
2. **Mes offres** : l'offre active et une offre **désactivée** (elle n'apparaît plus au catalogue).
3. **Tableau de bord** : environ 90 utilisations sur 30 jours, par offre et par jour de la semaine ;
   la validation de Léa apparaît en tête des dernières utilisations.

> À dire : « Le commerçant voit quels jours son offre attire du monde, et choisit ses jours en conséquence. »

---

## Plan B

| Incident | Réponse |
|---|---|
| Plus de réseau, ou Supabase en panne | Passer sur les captures et la vidéo de la répétition |
| L'appareil photo ne lit pas le QR code | Taper le code court sur le Scanner, ou valider au pavé avec le code de caisse |
| « Limite atteinte » dès le début (validation déjà faite) | Le binôme relance `seed-demo.sql` (une minute), puis on reprend à l'acte 3 |
| Mot de passe ou code refusé | Les valeurs ont changé : reprendre celles de la **dernière** exécution du script |
| Page blanche | Recharger ; sinon ouvrir le lien dans un autre navigateur |

---

## Répétition sur le lien en ligne (critère d'acceptation)

| Date et heure | Joué en entier ? | Durée | Problèmes trouvés |
|---|---|---|---|
| … | ☐ oui | … min | … |

Après la répétition : relancer `seed-demo.sql` pour remettre Léa à zéro avant la vraie démo,
et noter les nouvelles valeurs.
