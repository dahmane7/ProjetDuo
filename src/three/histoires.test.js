import { describe, expect, it } from 'vitest'
import { DESTINATIONS } from '../lib/menus.js'
import { ACTEURS, HISTOIRES, etatHistoire, lisse } from './histoires.js'

describe('HISTOIRES', () => {
  it('a 4 états complets pour chaque destination', () => {
    DESTINATIONS.forEach((d) => {
      expect(HISTOIRES[d]).toHaveLength(4)
      HISTOIRES[d].forEach((e) => ACTEURS.forEach((a) => expect(e[a]).toHaveLength(4)))
    })
  })
  it('étapes 1 et 2 communes : la tasse offerte (B) est cachée puis visible', () => {
    expect(HISTOIRES.ami[0].B[3]).toBe(0)
    expect(HISTOIRES.ami[1].B[3]).toBeGreaterThan(0)
  })
})

describe('etatHistoire', () => {
  it('rend exactement les états aux étapes entières', () => {
    expect(etatHistoire('sdf', 2)).toEqual(HISTOIRES.sdf[2])
  })
  it('borne p entre 0 et 3 (double clic, retour)', () => {
    expect(etatHistoire('voisine', 7)).toEqual(HISTOIRES.voisine[3])
    expect(etatHistoire('voisine', -2)).toEqual(HISTOIRES.voisine[0])
  })
  it('interpole à mi-chemin', () => {
    const a = HISTOIRES.ami[0].toi[0], b = HISTOIRES.ami[1].toi[0]
    expect(etatHistoire('ami', 0.5).toi[0]).toBeCloseTo((a + b) / 2)
  })
  it('lisse vaut 0, 0.5 et 1 aux bornes et au milieu', () => {
    expect([lisse(0), lisse(0.5), lisse(1)]).toEqual([0, 0.5, 1])
  })
})
