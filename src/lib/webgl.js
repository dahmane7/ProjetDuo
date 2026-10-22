// Détection de WebGL : sans lui, l'accueil reste en texte (pas de canvas 3D).
// Résultat mis en cache : le test ne crée qu'un seul contexte, libéré aussitôt.
let disponible = null

export function webglDisponible() {
  if (disponible !== null) return disponible
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    disponible = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    disponible = false
  }
  return disponible
}
