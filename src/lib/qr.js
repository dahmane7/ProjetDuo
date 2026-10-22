// Validation par QR code (US14) : mise en forme et messages des refus de valider_qr

// « ABC·DEF » : le code court se lit et se dicte en deux moitiés
export function formaterCodeCourt(code) {
  return code ? `${code.slice(0, 3)}·${code.slice(3)}` : ''
}

// Saisie du commerçant ramenée au format du code : majuscules, sans espace ni séparateur
export function nettoyerCodeCourt(saisie) {
  return saisie.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

// Secondes restantes avant expiration (jamais négatif)
export function secondesRestantes(expireLe, maintenant = Date.now()) {
  return Math.max(0, Math.ceil((new Date(expireLe).getTime() - maintenant) / 1000))
}

// « 4:05 »
export function formaterCompteARebours(secondes) {
  const s = Math.max(0, secondes)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const REFUS_QR = {
  jeton_inconnu: 'QR code ou code court inconnu.',
  jeton_expire: 'QR code expiré : demandez au membre d’en afficher un nouveau.',
  jeton_deja_utilise: 'Ce QR code a déjà été utilisé.',
  jeton_autre_commerce: 'Ce QR code est pour une offre d’un autre commerce.',
  reserve_aux_commercants: 'Seul un commerçant connecté peut scanner un QR code.',
  abonnement_inactif: "L'abonnement du membre n'est pas actif.",
  offre_non_valable: "L'offre n'est pas valable aujourd'hui.",
  limite_atteinte: "Le membre a déjà utilisé cette offre autant de fois que permis.",
  offre_introuvable: "Cette offre n'existe plus.",
}

// Message affiché au commerçant après un refus de valider_qr
export function messageQr(error) {
  const texte = error?.message ?? ''
  const code = Object.keys(REFUS_QR).find((c) => texte.includes(c))
  return REFUS_QR[code] ?? "La validation n'a pas abouti. Réessayez dans un instant."
}
