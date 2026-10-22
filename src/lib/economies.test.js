import { describe, expect, it } from 'vitest'
import { libelleNombre } from './economies.js'

describe('libelleNombre', () => {
  it('accorde au singulier et au pluriel', () => {
    expect(libelleNombre(0)).toBe('0 offre utilisée')
    expect(libelleNombre(1)).toBe('1 offre utilisée')
    expect(libelleNombre(3)).toBe('3 offres utilisées')
  })
})
