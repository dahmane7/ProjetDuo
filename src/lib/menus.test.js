import { describe, expect, it } from 'vitest'
import { DESTINATIONS, MENUS, menuVoisin } from './menus.js'

describe('MENUS', () => {
  it('contient 6 menus de 4 étapes, dans l’ordre des destinations', () => {
    expect(MENUS).toHaveLength(6)
    expect(MENUS.map((m) => m.dest)).toEqual(DESTINATIONS)
    MENUS.forEach((m) => expect(m.etapes).toHaveLength(4))
  })
  it('seul le menu 1 (1 acheté, 1 offert) est disponible', () => {
    expect(MENUS.filter((m) => m.disponible).map((m) => m.id)).toEqual(['duo'])
  })
})

describe('menuVoisin', () => {
  it('avance, recule et boucle', () => {
    expect(menuVoisin(0, 1)).toBe(1)
    expect(menuVoisin(5, 1)).toBe(0)
    expect(menuVoisin(0, -1)).toBe(5)
    expect(menuVoisin(2, -7)).toBe(1)
  })
})
