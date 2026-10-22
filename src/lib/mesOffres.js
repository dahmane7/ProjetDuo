import { supabase } from './supabase.js'

// Bornes du formulaire d'offre (US06). Elles reprennent les contraintes de supabase/schema.sql :
// la base refuse de toute façon ce que le formulaire laisserait passer.
export const TITRE_MIN = 3
export const TITRE_MAX = 80
export const CONDITIONS_MAX = 200
export const UTILISATIONS_MAX = 10 // RG06
export const VALEUR_MAX = 9999.99 // RG07 : numeric(6, 2)

// « 12,50 », « 12.5 » ou « 12 » → nombre ; NaN pour tout le reste (vide, lettres, négatif, 3 décimales)
export function lireMontant(texte) {
  const propre = String(texte ?? '').trim().replace(',', '.')
  return /^\d+(\.\d{1,2})?$/.test(propre) ? Number(propre) : NaN
}

// Montant en euros à l'affichage et dans le champ : « 12,50 », « 6 » (virgule décimale, sans « ,00 »)
export function formaterMontant(montant) {
  return Number.isInteger(montant) ? String(montant) : montant.toFixed(2).replace('.', ',')
}

// Valeurs du formulaire : { titre, conditions, jours: [iso], maxParMembre, valeur } (champs en texte).
// Renvoie un message par champ invalide, qui dit lequel et comment le corriger.
export function verifierOffre({ titre, conditions, jours, maxParMembre, valeur }) {
  const erreurs = {}

  const lgTitre = titre.trim().length
  if (lgTitre === 0)
    erreurs.titre = 'Indiquez le titre de l’offre, par exemple « 1 plat acheté = 1 plat offert ».'
  else if (lgTitre < TITRE_MIN) erreurs.titre = `Le titre est trop court : ${TITRE_MIN} caractères au moins.`
  else if (lgTitre > TITRE_MAX)
    erreurs.titre = `Le titre est trop long : ${TITRE_MAX} caractères au plus (il y en a ${lgTitre}).`

  const lgConditions = conditions.trim().length
  if (lgConditions > CONDITIONS_MAX)
    erreurs.conditions = `Les conditions font ${CONDITIONS_MAX} caractères au plus (il y en a ${lgConditions}) : raccourcissez-les.`

  if (jours.length === 0) erreurs.jours = 'Choisissez au moins un jour de validité.'

  const nombre = /^\d+$/.test(maxParMembre.trim()) ? Number(maxParMembre) : NaN
  if (!(nombre >= 1 && nombre <= UTILISATIONS_MAX))
    erreurs.maxParMembre = `Indiquez un nombre entier de 1 à ${UTILISATIONS_MAX}.`

  const montant = lireMontant(valeur)
  if (!(montant > 0))
    erreurs.valeur = 'Indiquez la valeur de l’article offert en euros, supérieure à 0 (par exemple 12,50).'
  else if (montant > VALEUR_MAX) erreurs.valeur = 'La valeur est trop élevée : 9 999,99 € au plus.'

  return erreurs
}

// Offre telle que l'écran la manipule ; utilisations = nombre de redemptions déjà validées
function versOffre(o) {
  return {
    id: o.id,
    titre: o.titre,
    conditions: o.description ?? '',
    valeur: Number(o.economie),
    jours: [...o.jours].sort((a, b) => a - b),
    maxParMembre: o.max_par_membre,
    active: o.active,
    utilisations: o.redemptions?.[0]?.count ?? 0,
  }
}

const CHAMPS = 'id, titre, description, economie, jours, max_par_membre, active, redemptions(count)'

// Toutes les offres du commerçant, actives ou non, la plus récente en premier
export async function chargerMesOffres(merchantId) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase
    .from('offers')
    .select(CHAMPS)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(versOffre)
}

// Une offre du commerçant (null si elle n'existe pas ou n'est pas la sienne)
export async function chargerMonOffre(merchantId, id) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase
    .from('offers')
    .select(CHAMPS)
    .eq('merchant_id', merchantId)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? versOffre(data) : null
}

// Crée l'offre, ou la modifie si id est donné. Les valeurs ont déjà passé verifierOffre.
export async function enregistrerOffre(merchantId, valeurs, id) {
  if (!supabase) throw new Error('Supabase non configuré')
  const ligne = {
    titre: valeurs.titre.trim(),
    description: valeurs.conditions.trim() || null,
    economie: lireMontant(valeurs.valeur),
    jours: [...valeurs.jours].sort((a, b) => a - b),
    max_par_membre: Number(valeurs.maxParMembre),
  }
  const requete = id
    ? supabase.from('offers').update(ligne).eq('id', id).eq('merchant_id', merchantId)
    : supabase.from('offers').insert({ ...ligne, merchant_id: merchantId })
  const { data, error } = await requete.select('id')
  if (error) throw error
  // Une modification refusée par la RLS ne renvoie ni erreur ni ligne
  if (!data?.length) throw new Error('Offre introuvable')
}

// Désactive (active = false) ou réactive une offre (RG10). Jamais de suppression :
// les utilisations passées restent rattachées à l'offre et comptées.
export async function changerEtatOffre(id, active) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.from('offers').update({ active }).eq('id', id).select('id')
  if (error) throw error
  if (!data?.length) throw new Error('Offre introuvable')
}
