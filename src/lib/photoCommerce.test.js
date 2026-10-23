import { describe, expect, it } from 'vitest'
import { dimensionsReduites, problemeFichier } from './photoCommerce.js'

describe('dimensionsReduites', () => {
  it('ramène le plus grand côté à 1600 px en gardant les proportions', () => {
    expect(dimensionsReduites(4000, 3000)).toEqual({ largeur: 1600, hauteur: 1200 })
    expect(dimensionsReduites(3000, 4000)).toEqual({ largeur: 1200, hauteur: 1600 })
  })

  it("n'agrandit jamais une petite image", () => {
    expect(dimensionsReduites(800, 600)).toEqual({ largeur: 800, hauteur: 600 })
  })
})

describe('problemeFichier', () => {
  it('refuse ce qui n’est pas une image', () => {
    expect(problemeFichier({ type: 'application/pdf', size: 1000 })).toContain("n'est pas une image")
  })

  it('accepte une photo de téléphone', () => {
    expect(problemeFichier({ type: 'image/jpeg', size: 6 * 1024 * 1024 })).toBeNull()
  })

  it('refuse un fichier démesuré', () => {
    expect(problemeFichier({ type: 'image/png', size: 30 * 1024 * 1024 })).toContain('trop lourde')
  })
})
