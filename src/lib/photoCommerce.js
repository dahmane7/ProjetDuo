import { supabase } from './supabase.js'

// Photo du commerce envoyée depuis l'appareil (fichier du PC, galerie ou appareil photo du téléphone).
// Elle est réduite avant l'envoi : une photo de téléphone de plusieurs Mo devient quelques centaines de Ko.
export const ESPACE_PHOTOS = 'photos-commerces'
export const TAILLE_MAX = 5 * 1024 * 1024
const COTE_MAX = 1600

// Nouvelles dimensions pour que le plus grand côté ne dépasse pas `max` (jamais agrandie)
export function dimensionsReduites(largeur, hauteur, max = COTE_MAX) {
  const rapport = Math.min(1, max / Math.max(largeur, hauteur))
  return { largeur: Math.round(largeur * rapport), hauteur: Math.round(hauteur * rapport) }
}

// Message à afficher si le fichier ne convient pas, sinon null
export function problemeFichier(fichier) {
  if (!fichier.type.startsWith('image/')) return "Ce fichier n'est pas une image."
  if (fichier.size > 4 * TAILLE_MAX) return 'Photo trop lourde : 20 Mo au plus.'
  return null
}

async function reduireImage(fichier) {
  const image = await createImageBitmap(fichier)
  const { largeur, hauteur } = dimensionsReduites(image.width, image.height)
  const toile = document.createElement('canvas')
  toile.width = largeur
  toile.height = hauteur
  toile.getContext('2d').drawImage(image, 0, 0, largeur, hauteur)
  image.close?.()
  return new Promise((resoudre, rejeter) =>
    toile.toBlob((blob) => (blob ? resoudre(blob) : rejeter(new Error('image'))), 'image/jpeg', 0.85),
  )
}

// Envoie la photo dans le dossier du commerçant et renvoie son adresse publique
export async function envoyerPhotoCommerce(fichier, userId) {
  const blob = await reduireImage(fichier)
  if (blob.size > TAILLE_MAX) throw new Error('trop_lourde')
  const chemin = `${userId}/commerce-${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from(ESPACE_PHOTOS)
    .upload(chemin, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  return supabase.storage.from(ESPACE_PHOTOS).getPublicUrl(chemin).data.publicUrl
}
