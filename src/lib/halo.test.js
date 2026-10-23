import { describe, expect, it } from 'vitest'
import { positionHalo } from './halo.js'

const rect = { left: 100, top: 0, width: 200, height: 100 }

describe('positionHalo', () => {
  it('donne la position du pointeur en pourcentage du panneau', () => {
    expect(positionHalo({ clientX: 150, clientY: 50 }, rect)).toEqual({ x: 25, y: 50 })
  })

  it('reste dans le panneau quand le pointeur en sort', () => {
    expect(positionHalo({ clientX: 0, clientY: 500 }, rect)).toEqual({ x: 0, y: 100 })
  })

  it('centre le halo sur un panneau sans taille', () => {
    expect(positionHalo({ clientX: 10, clientY: 10 }, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 50, y: 50 })
  })
})
