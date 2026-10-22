// Données d'exemple pour la maquette : à remplacer par la lecture de `merchants` et `offers` dans Supabase.
// photo : identifiant d'une photo libre de droits sur Unsplash (voir photoUrl)
export const OFFRES_EXEMPLE = [
  { id: 1, commerce: 'Le Bistrot du coin', categorie: 'Restaurant', ville: 'Lyon 2e', titre: 'Un plat du jour acheté, le second offert', economie: 16, jours: [1, 2, 3, 4, 5], photo: '1517248135467-4c7edcad34c4' },
  { id: 2, commerce: 'Pizza Mamma', categorie: 'Restaurant', ville: 'Lyon 7e', titre: 'Une pizza achetée, la seconde offerte', economie: 13, jours: [2, 4, 6], photo: '1513104890138-7c749659a591' },
  { id: 3, commerce: 'Maison Fournil', categorie: 'Café et boulangerie', ville: 'Lyon 1er', titre: 'Un pain de campagne acheté, le second offert', economie: 4, jours: [1, 2, 3, 4, 5, 6, 7], photo: '1509440159596-0249088772ff' },
  { id: 4, commerce: 'Atelier Coiffure Lina', categorie: 'Beauté et bien-être', ville: 'Villeurbanne', titre: 'Un brushing acheté, le second offert', economie: 28, jours: [3, 4, 5], photo: '1560066984-138dadb4c035' },
  { id: 5, commerce: 'Le Coffre à Jeux', categorie: 'Loisirs', ville: 'Lyon 3e', titre: 'Une soirée jeux achetée, la seconde offerte', economie: 8, jours: [1, 2, 3, 4], photo: '1585504198199-20277593b94f' },
  { id: 6, commerce: 'Bol Vert', categorie: 'Restaurant', ville: 'Lyon 6e', titre: 'Un bol acheté, le second offert', economie: 12, jours: [6, 7], photo: '1512621776951-a57141f2eefd' },
  { id: 7, commerce: 'Fleurs de Saison', categorie: 'Commerce', ville: 'Lyon 4e', titre: 'Un bouquet acheté, le second offert', economie: 20, jours: [2, 3, 4, 5, 6], photo: '1490750967868-88aa4486c946' },
  { id: 8, commerce: 'Spa Les Bains', categorie: 'Beauté et bien-être', ville: 'Lyon 6e', titre: 'Un massage acheté, le second offert', economie: 55, jours: [1, 2, 3], photo: '1544161515-4ab6ce6db874' },
  { id: 9, commerce: 'Brunch & Co', categorie: 'Restaurant', ville: 'Lyon 1er', titre: 'Un brunch acheté, le second offert', economie: 24, jours: [6, 7], photo: '1504754524776-8f4f37790ca0' },
  { id: 10, commerce: 'Café des Pentes', categorie: 'Café et boulangerie', ville: 'Lyon 1er', titre: 'Un cappuccino acheté, le second offert', economie: 4, jours: [1, 2, 3, 4, 5], photo: '1495474472287-4d71bcdd2085' },
]

// URL d'une photo Unsplash recadrée à la taille voulue (largeur doublée pour les écrans rétina)
export function photoUrl(id, largeur = 640, hauteur = 400) {
  // Adresse complète saisie par le commerçant (US05)
  if (/^https?:\/\//.test(id)) return id
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${largeur}&h=${hauteur}&q=70`
}

// Initiales affichées dans la pastille « logo » du commerce
export function initiales(nom) {
  return nom
    .split(/\s+/)
    .filter((mot) => mot.length > 2 || /^[A-Z]/.test(mot))
    .slice(0, 2)
    .map((mot) => mot[0].toUpperCase())
    .join('')
}
