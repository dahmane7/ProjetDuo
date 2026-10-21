// Catégories de commerce (RG11), dans l'ordre d'affichage.
// Les noms doivent rester identiques à la contrainte check de merchants.categorie (supabase/schema.sql).
// icone : nom dans components/Icon.jsx ; photo : photo Unsplash de la catégorie ;
// visuel : fond affiché quand il n'y a pas de photo
export const CATEGORIES = [
  {
    nom: 'Restaurant',
    icone: 'restaurant',
    photo: '1414235077428-338989a2e8c0',
    visuel: 'bg-linear-to-br from-orange-200 via-rose-200 to-rose-300',
    accroche: 'Deux plats pour le prix d’un, du bistrot au brunch du dimanche.',
  },
  {
    nom: 'Café et boulangerie',
    icone: 'cafe',
    photo: '1555507036-ab1f4038808a',
    visuel: 'bg-linear-to-br from-amber-100 via-amber-200 to-orange-300',
    accroche: 'Le deuxième café, croissant ou gâteau offert.',
  },
  {
    nom: 'Beauté et bien-être',
    icone: 'beaute',
    photo: '1600334089648-b0d9d3028eb2',
    visuel: 'bg-linear-to-br from-pink-100 via-fuchsia-200 to-purple-300',
    accroche: 'Coiffure, soins et massages, à moitié prix à deux.',
  },
  {
    nom: 'Loisirs',
    icone: 'loisirs',
    photo: '1538511059256-46e76f13f071',
    visuel: 'bg-linear-to-br from-sky-100 via-sky-200 to-indigo-300',
    accroche: 'Escape games, bowling, cinéma : une entrée achetée, une offerte.',
  },
  {
    nom: 'Commerce',
    icone: 'commerce',
    photo: '1441986300917-64674bd600d8',
    visuel: 'bg-linear-to-br from-emerald-100 via-teal-200 to-teal-300',
    accroche: 'Fleuristes, librairies, épiceries fines du quartier.',
  },
]

export function categorie(nom) {
  return CATEGORIES.find((c) => c.nom === nom) ?? CATEGORIES[0]
}

// Jours ISO : lundi = 1 … dimanche = 7, comme extract(isodow …) côté Postgres
export const JOURS = [
  { iso: 1, court: 'L', long: 'lundi' },
  { iso: 2, court: 'M', long: 'mardi' },
  { iso: 3, court: 'M', long: 'mercredi' },
  { iso: 4, court: 'J', long: 'jeudi' },
  { iso: 5, court: 'V', long: 'vendredi' },
  { iso: 6, court: 'S', long: 'samedi' },
  { iso: 7, court: 'D', long: 'dimanche' },
]

// Jour courant à l'heure de Paris, au même format que la base
export function jourParis(date = new Date()) {
  const nom = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    timeZone: 'Europe/Paris',
  }).format(date)
  return JOURS.find((j) => j.long === nom)?.iso ?? 1
}
