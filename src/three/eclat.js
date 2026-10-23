// Rythme de l'éclatement de la boule Twins, k secondes après le toucher.
// f : éclatement (0 = boule entière, 1 = éclatée au maximum) ; flash : éclat lumineux (1 → 0).
// La boule éclate vite (0,3 s) puis se reforme en douceur jusqu'à DUREE_ECLAT.
export const DUREE_ECLAT = 1.6 // secondes
const SORTIE = 0.3 // secondes
export const GRAVITE = 4.5 // unités de scène par seconde², pour les gouttes de sauce
const FONTE = 1.1 // secondes : les gouttes commencent à fondre

// Goutte de mayonnaise ou de ketchup, k secondes après le toucher : lancée du bord de la boule
// (depart) à la vitesse v, elle file, retombe sous la gravité et fond à la fin. null hors de l'éclatement.
export function goutte({ depart, v, taille }, k) {
  if (k < 0 || k >= DUREE_ECLAT) return null
  return {
    x: depart[0] + v[0] * k,
    y: depart[1] + v[1] * k - (GRAVITE * k * k) / 2,
    z: depart[2] + v[2] * k,
    taille: k < FONTE ? taille : taille * (1 - (k - FONTE) / (DUREE_ECLAT - FONTE)),
  }
}

export function eclatement(k) {
  if (k < 0 || k >= DUREE_ECLAT) return { f: 0, flash: 0 }
  const flash = Math.exp(-k * 5)
  if (k < SORTIE) return { f: 1 - Math.pow(1 - k / SORTIE, 3), flash }
  const r = (k - SORTIE) / (DUREE_ECLAT - SORTIE)
  return { f: 1 - r * r * (3 - 2 * r), flash }
}
