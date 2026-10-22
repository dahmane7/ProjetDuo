import { supabase } from './supabase.js'

// Économies et historique du membre connecté (US11), calculés par mes_economies() en SQL
export async function chargerEconomies() {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.rpc('mes_economies')
  if (error) throw error
  return {
    abonnement: data.abonnement,
    total: Number(data.total),
    nombre: data.nombre,
    historique: data.historique.map((u) => ({ ...u, economie: Number(u.economie) })),
  }
}

// « 1 offre utilisée », « 3 offres utilisées »
export function libelleNombre(nombre) {
  return `${nombre} offre${nombre > 1 ? 's' : ''} utilisée${nombre > 1 ? 's' : ''}`
}
