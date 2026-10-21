# Duo

Abonnement « 1 acheté = 1 offert » chez des restaurants et commerces. Projet hackathon en duo.

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les clés Supabase
npm run dev
```

## Déploiement

Le dépôt est relié à Vercel : chaque fusion sur `main` met à jour le lien de démo.
Dans Vercel, déclarer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
(Project Settings > Environment Variables).

Les conventions de l'équipe sont dans [CLAUDE.md](CLAUDE.md).
