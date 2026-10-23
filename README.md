# Twins

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

1. Jouer `supabase/schema.sql`, puis coller tout `supabase/seed-demo.sql` dans l'éditeur SQL et lancer (Run).
   **Il n'y a rien à remplir** : le script invente le mot de passe de Léa et de La Table Zen ainsi que le code de
   caisse, et les affiche dans le résultat (colonnes `mot_de_passe` et `code_caisse`). **Notez-les** avant de
   quitter la page : ils ne sont écrits nulle part ailleurs, et changent à chaque exécution.
2. Le résultat affiche aussi la ligne de contrôle : 7 commerces, 1 offre du lundi, environ 80 à 90 utilisations
   à La Table Zen, 4 pour Léa et 2 comptes connectables.

Comptes où l'on peut se connecter (avec le mot de passe affiché) :

- `lea.demo@duo.test` : Léa, membre abonnée, avec un historique d'économies ;
- `table-zen.demo@duo.test` : La Table Zen, le restaurant du scénario (code de caisse affiché, tableau de bord rempli).

Pour garder des valeurs fixes, remplir `mot_de_passe` (6 caractères au moins) et `code_caisse` (4 chiffres) en tête
du script **dans l'éditeur** : ne jamais commiter le fichier rempli.

Le script est rejouable : le relancer juste avant la démo remet les utilisations à zéro
(Léa peut de nouveau valider l'offre de La Table Zen) et donne de nouvelles valeurs si vous ne les avez pas fixées.
Pour tout retirer, voir l'en-tête du script. `seed.sql` et `seed-utilisations.sql` restent utilisables à part.

## Documentation

- [Documentation technique](docs/documentation-technique.md) (2 pages) : architecture, modèle de données,
  sécurité, règles de gestion, validation en caisse, installation.
- [Guide utilisateur](docs/guide-utilisateur.md) : parcours membre et commerçant, messages et questions fréquentes.
- Versions PDF à rendre ou imprimer : [docs/pdf/](docs/pdf/). Elles se génèrent à partir des fichiers Markdown :
  modifier le `.md`, puis lancer `npm run docs:pdf` (Edge ou Chrome doit être installé). Ne jamais modifier un PDF à la main.

## Déploiement

Le dépôt est relié à Vercel : chaque fusion sur `main` met à jour le lien de démo.
Dans Vercel, déclarer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
(Project Settings > Environment Variables).

Les conventions de l'équipe sont dans [CLAUDE.md](CLAUDE.md).
