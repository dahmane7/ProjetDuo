// Abonnement Twins (RG02) : un prix, 12 mois, paiement simulé pour la démo
export const PRIX = '49 €'
export const DUREE_MOIS = 12

export const AVANTAGES = [
  'Toutes les offres 1 acheté = 1 offert pendant 12 mois',
  'Restaurants, cafés, beauté, loisirs et commerces',
  'Une offre par commerçant et par jour',
  'Le suivi de vos économies dans votre espace',
]

// Même règle que activer_abonnement dans supabase/schema.sql
export function estActif(abonnement) {
  if (!abonnement || abonnement.statut !== 'active') return false
  return !abonnement.fin || new Date(abonnement.fin) > new Date()
}

// « 22 octobre 2027 », à l'heure de Paris
export function formaterDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

// Date de fin si on s'abonne maintenant, pour la confirmation
export function finSiActiveMaintenant() {
  const fin = new Date()
  fin.setMonth(fin.getMonth() + DUREE_MOIS)
  return fin
}
