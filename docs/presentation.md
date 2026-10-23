# Duo · Trame de la présentation (US13)

Durée visée : **10 minutes**, puis les questions. Gel du code vendredi à **10 h 30** : après,
seules les corrections bloquantes sont acceptées.

| Temps | Partie | Qui |
|---|---|---|
| 1 min | Le problème et l'idée | … |
| 6–7 min | La démo en direct (`docs/scenario-demo.md`) | Membre : … · Commerçant : … |
| 1 min | Comment c'est construit | … |
| 1 min | Le board Jira : ce qui est fait | … |
| 1 min | Hors périmètre et suite | … |

---

## 1. Le problème et l'idée (1 min)

- Les petits commerces ont des heures creuses ; les habitants veulent sortir sans trop dépenser.
- **Duo** : un abonnement de 12 mois qui donne accès à des offres **« 1 acheté = 1 offert »**
  dans le quartier (restaurants, cafés, beauté, loisirs, commerces).
- Le commerçant choisit **ses jours** et suit l'effet de ses offres ; le membre suit ses économies.

## 2. La démo (6 à 7 min)

Suivre `docs/scenario-demo.md` : visiteur, membre abonnée, validation en caisse (code faux,
puis QR code), économies mises à jour, espace commerçant et tableau de bord.

## 3. Comment c'est construit (1 min)

- Application web mobile : React et Vite, pensée pour 375 px ; hébergée sur Vercel.
- Supabase : comptes, base PostgreSQL, **règles d'accès sur toutes les tables**.
- Les actions sensibles passent par des **fonctions dans la base** : un membre ne peut ni créer
  une utilisation, ni lire le code d'un commerçant, même en interrogeant l'API directement.
- Code commerçant **chiffré** ; validation en caisse : **quatre contrôles** (abonnement, jour,
  limite, code) avant d'enregistrer.
- Détail : `docs/documentation-technique.md` (2 pages).

## 4. Le board Jira (1 min)

Montrer le board **SCRUM** à l'écran :

- **Terminé** (fusionné, vérifié sur le lien en ligne) : US01 à US12, US14 (bonus QR code),
  documentation (SCRUM-26), US13 (cette présentation).
- À dire : une branche et une PR par story, relue par l'autre développeur ; `preprod` pour
  intégrer, `main` pour le lien de démo ; tests automatiques sur les règles (Vitest).
- Ce qui n'est pas terminé à l'heure du gel est montré tel quel, et passe en V2.

## 5. Hors périmètre et suite (1 min)

Volontairement laissé de côté pour la démo :

| Sujet | Aujourd'hui | Plus tard (V2) |
|---|---|---|
| Paiement | Simulé | Paiement réel (Stripe), renouvellement et résiliation |
| Mot de passe oublié | Non géré | Réinitialisation par e-mail |
| Confirmation de l'e-mail | Désactivée pour la démo | Activée |
| Photos des commerces | Adresse d'une image | Envoi d'une photo depuis le téléphone |
| Trouver une offre | Catégories et jour | Carte, géolocalisation, recherche |
| Notifications | Aucune | Rappels « offre valable aujourd'hui » |
| Administration | Aucune | Espace pour valider les commerces et modérer |
| Application | Site web mobile | Application installable (PWA) |
| Commerçants | Un commerce par compte | Plusieurs établissements |

## 6. Questions probables

- **Et si le commerçant se trompe de code ?** « Code incorrect », rien n'est enregistré.
- **Peut-on tricher ?** Non : tout est vérifié dans la base, pas seulement à l'écran.
- **Pourquoi un QR code en plus ?** Le commerçant valide depuis son propre téléphone ; le code
  à 4 chiffres reste disponible.
- **Pourquoi pas de vrai paiement ?** Hors périmètre du hackathon : le parcours est complet, le
  paiement s'ajoute à l'étape « Activer mon abonnement ».
