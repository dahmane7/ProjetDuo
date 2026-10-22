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

// Une offre active et sa fiche commerce, pour la page détail (US09) ; null si introuvable ou inactive
export async function chargerOffre(id) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase
    .from('offers')
    .select(
      'id, titre, description, economie, jours, max_par_membre, merchants(nom, categorie, ville, adresse, description, photo)',
    )
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()
  // Identifiant mal formé (22P02) : même traitement qu'une offre introuvable
  if (error && error.code !== '22P02') throw error
  if (!data) return null
  return { ...data, economie: Number(data.economie), commerce: data.merchants }
}

// « demain », « jeudi »… : le prochain jour valable, pour les textes
export function libelleProchainJour(jours, aujourdhui) {
  const prochain = prochainJour(jours, aujourdhui)
  if (!prochain) return null
  if (prochain.ecart === 1) return 'demain'
  return JOURS.find((j) => j.iso === prochain.iso).long
}

// Pourquoi « Utiliser » est désactivé (US09) ; null si le bouton est actif.
// Un visiteur garde le bouton actif : l'appui l'invite à créer un compte (RG03).
export function raisonIndisponible({ connecte, role, abonne, valableAujourdhui, restantes, prochain }) {
  if (!connecte) return null
  if (role !== 'membre') return { code: 'membres', texte: 'Les offres sont réservées aux membres.' }
  if (!abonne) return { code: 'abonnement', texte: 'Abonnez-vous pour utiliser cette offre.' }
  if (!valableAujourdhui)
    return {
      code: 'jour',
      texte: prochain ? `Pas valable aujourd'hui : revenez ${prochain}.` : "Pas valable aujourd'hui.",
    }
  if (restantes <= 0)
    return { code: 'limite', texte: 'Vous avez déjà utilisé cette offre autant de fois que permis.' }
  return null
}
