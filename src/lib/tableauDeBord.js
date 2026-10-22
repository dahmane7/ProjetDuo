import { JOURS } from './categories.js'
import { supabase } from './supabase.js'

// Réponse de public.tableau_de_bord() (supabase/schema.sql) mise en forme pour l'écran.
// Tolère un champ absent : un commerçant sans offre ni utilisation n'a que des zéros.
export function lireTableauDeBord(donnees) {
  const d = donnees ?? {}
  return {
    total: Number(d.total ?? 0),
    parOffre: (d.par_offre ?? []).map((o) => ({
      id: o.id,
      titre: o.titre,
      active: o.active,
      utilisations: Number(o.utilisations),
    })),
    // Toujours les 7 jours, du lundi au dimanche
    parJour: JOURS.map((j) => ({
      ...j,
      utilisations: Number(d.par_jour?.find((x) => x.jour === j.iso)?.utilisations ?? 0),
    })),
    dernieres: (d.dernieres ?? []).map((u) => ({ numero: u.numero, quand: u.created_at, titre: u.titre })),
  }
}

// Utilisations des 30 derniers jours du commerçant connecté : total, par offre, par jour, dernières
export async function chargerTableauDeBord() {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.rpc('tableau_de_bord')
  if (error) throw error
  return lireTableauDeBord(data)
}

const FORMAT_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: 'h23',
})

// « 22/10/2026 » et « 18 h 42 », toujours à l'heure de Paris (comme les jours de la semaine côté base)
export function formaterDateHeure(iso) {
  const date = new Date(iso)
  const parties = Object.fromEntries(FORMAT_HEURE.formatToParts(date).map((p) => [p.type, p.value]))
  return { date: FORMAT_DATE.format(date), heure: `${parties.hour} h ${parties.minute}` }
}

// Numéro de validation d'une utilisation : « N° 000123 »
export function formaterNumero(numero) {
  return `N° ${String(numero).padStart(6, '0')}`
}

// Hauteur d'une barre du graphique, en % de la hauteur disponible ; une valeur non nulle reste visible
export function hauteurBarre(valeur, max) {
  if (!(valeur > 0) || !(max > 0)) return 0
  return Math.max(4, Math.round((valeur / max) * 100))
}
