import { JOURS } from './categories.js'
import { supabase } from './supabase.js'

// Offres actives du catalogue, avec leur commerce, au format attendu par OutletCard
export async function chargerOffres() {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase
    .from('offers')
    .select('id, titre, economie, jours, merchants(nom, categorie, ville, photo)')
    .eq('active', true)
  if (error) throw error
  return data.map((o) => ({
    id: o.id,
    commerce: o.merchants.nom,
    categorie: o.merchants.categorie,
    ville: o.merchants.ville,
    photo: o.merchants.photo,
    titre: o.titre,
    economie: Number(o.economie),
    jours: o.jours,
  }))
}

// Jours de validité en texte court : « Tous les jours » ou « lun · mar · jeu »
export function libelleJours(jours) {
  if (jours.length === 7) return 'Tous les jours'
  return JOURS.filter((j) => jours.includes(j.iso))
    .map((j) => j.long.slice(0, 3))
    .join(' · ')
}

// Prochain jour valable à partir d'aujourd'hui (jours ISO, lundi = 1).
// ecart : 0 = aujourd'hui, 1 = demain… ; null si l'offre n'a aucun jour
export function prochainJour(jours, aujourdhui) {
  for (let ecart = 0; ecart < 7; ecart++) {
    const iso = ((aujourdhui - 1 + ecart) % 7) + 1
    if (jours.includes(iso)) return { iso, ecart }
  }
  return null
}

// Offres valables aujourd'hui d'abord, puis par prochain jour le plus proche (RG05)
export function trierParProchainJour(offres, aujourdhui) {
  const ecart = (o) => prochainJour(o.jours, aujourdhui)?.ecart ?? 7
  return [...offres].sort((a, b) => ecart(a) - ecart(b))
}
