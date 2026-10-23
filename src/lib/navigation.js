// Onglets de navigation, partagés par la barre d'onglets (téléphone) et l'en-tête PC
const ONGLETS = [
  { to: '/', label: 'Accueil', icone: 'home', end: true },
  { to: '/catalogue', label: 'Offres', icone: 'tag' },
  { to: '/economies', label: 'Économies', icone: 'piggy' },
]

// `compte` : destination de l'onglet Compte (la connexion, ou l'espace du rôle une fois connecté)
export function onglets(compte = '/connexion') {
  return [...ONGLETS, { to: compte, label: 'Compte', icone: 'user' }]
}
