# Duo

Abonnement « 1 acheté = 1 offert » chez des restaurants et commerces. Projet hackathon en duo.

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les clés Supabase
npm run dev
```

## Base de données

Jouer `supabase/schema.sql` dans l'éditeur SQL de Supabase (tables, contraintes et RLS).
Le script est rejouable après chaque modification.

## Données de démo

1. Jouer `supabase/schema.sql`, puis coller tout `supabase/seed-demo.sql` dans l'éditeur SQL.
2. **Dans l'éditeur**, remplir les deux valeurs en tête du script : `mot_de_passe` (6 caractères au moins)
   et `code_caisse` (4 chiffres). Elles restent vides dans le dépôt : ne jamais commiter le fichier rempli.
3. Run. La ligne de contrôle affiche 7 commerces, 1 offre du lundi, environ 80 à 90 utilisations à La Table Zen,
   4 pour Léa et 2 comptes connectables.

Comptes où l'on peut se connecter (avec le mot de passe choisi) :

- `lea.demo@duo.test` : Léa, membre abonnée, avec un historique d'économies ;
- `table-zen.demo@duo.test` : La Table Zen, le restaurant du scénario (code de caisse choisi, tableau de bord rempli).

Le script est rejouable : le relancer juste avant la démo remet les utilisations à zéro
(Léa peut de nouveau valider l'offre de La Table Zen). Pour tout retirer, voir l'en-tête du script.
`seed.sql` et `seed-utilisations.sql` restent utilisables à part.

## Déploiement

Le dépôt est relié à Vercel : chaque fusion sur `main` met à jour le lien de démo.
Dans Vercel, déclarer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
(Project Settings > Environment Variables).

Les conventions de l'équipe sont dans [CLAUDE.md](CLAUDE.md).
