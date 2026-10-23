// Rythme de l'éclatement de la boule Twins, k secondes après le toucher.
// f : écartement des points (0 = boule entière, 1 = éclatée au maximum) ; flash : éclat lumineux (1 → 0).
// Les points partent vite (0,3 s) puis reviennent en douceur jusqu'à DUREE_ECLAT.
export const DUREE_ECLAT = 1.6 // secondes
const SORTIE = 0.3 // secondes

export function eclatement(k) {
  if (k < 0 || k >= DUREE_ECLAT) return { f: 0, flash: 0 }
  const flash = Math.exp(-k * 5)
  if (k < SORTIE) return { f: 1 - Math.pow(1 - k / SORTIE, 3), flash }
  const r = (k - SORTIE) / (DUREE_ECLAT - SORTIE)
  return { f: 1 - r * r * (3 - 2 * r), flash }
}
