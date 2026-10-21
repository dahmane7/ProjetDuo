import { createClient } from '@supabase/supabase-js'

// Les clés viennent de .env (en local) ou des variables d'environnement Vercel.
// Jamais de clé écrite en dur dans le code.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Supabase non configuré : copiez .env.example en .env et renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null
