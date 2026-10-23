// Position du halo lumineux d'un panneau : le pointeur en pourcentage du panneau (0 à 100),
// bornée au panneau quand le doigt glisse au-dehors
const borne = (v) => Math.min(100, Math.max(0, v))

export function positionHalo({ clientX, clientY }, { left, top, width, height }) {
  if (!width || !height) return { x: 50, y: 50 }
  return {
    x: borne(((clientX - left) / width) * 100),
    y: borne(((clientY - top) / height) * 100),
  }
}
