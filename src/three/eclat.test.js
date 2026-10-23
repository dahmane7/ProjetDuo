import { describe, expect, it } from 'vitest'
import { DUREE_ECLAT, eclatement } from './eclat.js'

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
