// Validation en caisse (US10) : messages des refus de valider_offre et mise en forme du résultat

const MESSAGES = {
  code_incorrect: 'Code incorrect',
  abonnement_inactif: "Abonnement inactif : l'offre ne peut pas être validée.",
  offre_non_valable: "Offre non valable aujourd'hui.",
  limite_atteinte: "Limite d'utilisation atteinte pour cette offre.",
  reserve_aux_membres: 'Seul un membre peut valider une offre.',
  offre_introuvable: "Cette offre n'existe plus.",
}

// Code renvoyé par valider_offre (ex. « code_incorrect »), ou null pour une erreur inattendue
export function codeRefus(error) {
  const texte = error?.message ?? ''
  return Object.keys(MESSAGES).find((code) => texte.includes(code)) ?? null
}

export function messageValidation(error) {
  return MESSAGES[codeRefus(error)] ?? "La validation n'a pas abouti. Réessayez dans un instant."
}

// « N° 000123 » : lisible de loin par le commerçant
export function formaterNumero(numero) {
  return `N° ${String(numero).padStart(6, '0')}`
}

// « 14:05 », à l'heure de Paris
export function formaterHeure(date) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
}

// Montant en euros, sans décimales inutiles : « 16 € », « 12,50 € »
export function formaterEuros(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(Number(montant)) ? 0 : 2,
  }).format(Number(montant))
}
