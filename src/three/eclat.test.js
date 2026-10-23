import { describe, expect, it } from 'vitest'
import { DUREE_ECLAT, GRAVITE, eclatement, goutte } from './eclat.js'

describe('goutte', () => {
  const g = { depart: [0, 0.5, 0.9], v: [2, 1, 0.5], taille: 1 }

  it('n\'existe pas avant le toucher ni après l\'éclatement', () => {
    expect(goutte(g, -0.1)).toBeNull()
    expect(goutte(g, DUREE_ECLAT)).toBeNull()
  })

  it('part du bord de la boule à pleine taille', () => {
    expect(goutte(g, 0)).toEqual({ x: 0, y: 0.5, z: 0.9, taille: 1 })
  })

  it('file droit et retombe sous la gravité', () => {
    const p = goutte(g, 0.5)
    expect(p.x).toBeCloseTo(1)
    expect(p.z).toBeCloseTo(1.15)
    expect(p.y).toBeCloseTo(0.5 + 0.5 - (GRAVITE * 0.25) / 2)
  })

  it('fond à la fin de l\'éclatement', () => {
    expect(goutte(g, 1)).toMatchObject({ taille: 1 })
    expect(goutte(g, DUREE_ECLAT - 0.01).taille).toBeLessThan(0.05)
  })
})

describe('eclatement', () => {
  it('ne fait rien avant le toucher ni après le retour', () => {
    expect(eclatement(-1)).toEqual({ f: 0, flash: 0 })
    expect(eclatement(DUREE_ECLAT)).toEqual({ f: 0, flash: 0 })
  })

  it('part de la boule entière avec le flash au plus fort', () => {
    expect(eclatement(0)).toEqual({ f: 0, flash: 1 })
  })

  it('est éclatée au maximum à 0,3 s', () => {
    expect(eclatement(0.3).f).toBe(1)
  })

  it('est revenue à moitié au milieu du retour', () => {
    expect(eclatement(0.95).f).toBeCloseTo(0.5)
  })

  it('le flash s\'éteint pendant l\'éclatement', () => {
    expect(eclatement(0.5).flash).toBeLessThan(0.1)
  })
})
