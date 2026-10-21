# Duo · abonnement « 1 acheté = 1 offert »

Application web mobile (hackathon, démo vendredi matin). Un membre s'abonne, trouve une
offre et la fait valider en caisse avec le code à 4 chiffres du commerçant ; le commerçant
crée ses offres, choisit leurs jours et suit leur utilisation.

La référence est le dossier « Projet 2 · Duo » (règles de gestion RG01 à RG13, modèle de
données, critères d'acceptation). Le backlog est dans Jira, projet **DUO**.

## Stack

- React 19 + Vite, JavaScript (pas de TypeScript)
- Tailwind CSS v4 via `@tailwindcss/vite` ; couleurs de marque `duo-*` dans `src/index.css`
- React Router (`react-router`) : toutes les routes sont déclarées dans `src/App.jsx`
- Supabase : Auth par e-mail, Postgres, RLS, fonctions SQL. Client unique : `src/lib/supabase.js`
- Hébergement : Vercel, relié au dépôt GitHub ; chaque fusion sur `main` met à jour le lien de démo

## Commandes

- `npm install` : installer les dépendances
- `npm run dev` : serveur local (http://localhost:5173)
- `npm run build` : build de production (à lancer avant chaque PR)
- `npm run lint` : lint (oxlint)

## Structure

- `src/pages/` : une page par écran (`Accueil.jsx`, `Catalogue.jsx`…)
- `src/components/` : composants réutilisables (`Layout.jsx`…)
- `src/lib/` : client Supabase et helpers
- `supabase/schema.sql` : schéma, RLS et fonctions SQL, versionné (US02)

## Base de données (Supabase)

Tables : `profiles`, `subscriptions`, `merchants`, `merchant_secrets`, `offers`,
`redemptions` (+ `redemption_tokens` pour le bonus US14).

- RLS activée sur **toutes** les tables.
- `merchant_secrets` n'est lisible par personne : seules les fonctions `definir_code(pin)`
  et `valider_offre(offer_id, pin)` (security definer, pgcrypto) y accèdent.
- `redemptions` n'est écrite que par `valider_offre` (et `valider_qr` pour le bonus).
- Jour courant à l'heure de Paris : `extract(isodow from now() at time zone 'Europe/Paris')`,
  lundi = 1.
- Catégories (RG11) : Restaurant, Café et boulangerie, Beauté et bien-être, Loisirs, Commerce.
- Toute modification du schéma est faite dans `supabase/schema.sql`, puis jouée dans l'éditeur SQL.

## Règles de l'équipe

- **Ne jamais toucher à `.env`** ni écrire une clé ou un mot de passe dans le code, un commit
  ou une conversation. Les variables sont dans `.env` (local) et dans Vercel ; le modèle est
  `.env.example`.
- **Jamais de modification directe sur `main`.** Une branche par story, nommée avec la clé
  Jira : `DUO-7-mise-en-place`, `DUO-16-valider-offre`.
- Une pull request par story, avec la clé Jira dans le titre, relue par l'autre dev avant
  fusion.
- Une story est terminée quand ses critères d'acceptation sont vérifiés, que sa PR est relue
  et fusionnée, et que la fonctionnalité marche sur le lien de démo.
- Dev A : parcours membre. Dev B : parcours commerçant et validation en caisse. Chacun ajoute
  ses routes dans son bloc de `src/App.jsx` pour limiter les conflits.
- Toujours commencer une story en mode Plan à partir du texte du ticket Jira, et valider le
  plan avant toute modification.
- Interface en français, pensée pour un écran de 375 px de large, sans défilement horizontal.
- Pour `valider_offre`, écrire aussi les requêtes SQL de test des quatre refus.
- Gel du code vendredi à 10 h 30 : ensuite, seules les corrections bloquantes.
