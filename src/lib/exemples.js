// Helpers des photos et logos des commerces

// URL d'une photo Unsplash recadrée à la taille voulue (largeur doublée pour les écrans rétina)
export function photoUrl(id, largeur = 640, hauteur = 400) {
  // Adresse complète saisie par le commerçant (US05)
  if (/^https?:\/\//.test(id)) return id
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${largeur}&h=${hauteur}&q=70`
}
