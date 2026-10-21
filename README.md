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

## Déploiement

Le dépôt est relié à Vercel : chaque fusion sur `main` met à jour le lien de démo.
Dans Vercel, déclarer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
(Project Settings > Environment Variables).

Les conventions de l'équipe sont dans [CLAUDE.md](CLAUDE.md).
