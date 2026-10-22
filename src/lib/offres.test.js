import { describe, expect, it } from 'vitest'
import { prochainJour, trierParProchainJour } from './offres.js'

describe('prochainJour', () => {
  it("renvoie aujourd'hui quand l'offre est valable ce jour-là", () => {
    expect(prochainJour([1, 3], 3)).toEqual({ iso: 3, ecart: 0 })
  })

  it('renvoie demain', () => {
    expect(prochainJour([4], 3)).toEqual({ iso: 4, ecart: 1 })
  })

  it('passe du dimanche au lundi suivant', () => {
    expect(prochainJour([1, 2], 7)).toEqual({ iso: 1, ecart: 1 })
  })

  it('trouve le prochain jour la semaine suivante', () => {
    expect(prochainJour([2], 3)).toEqual({ iso: 2, ecart: 6 })
  })

  it("renvoie null pour une offre sans jour", () => {
    expect(prochainJour([], 3)).toBeNull()
  })
})

describe('trierParProchainJour', () => {
  it("met les offres du jour en premier, puis la plus proche", () => {
    const offres = [
      { id: 'a', jours: [2] }, // mardi : dans 6 jours
      { id: 'b', jours: [3] }, // aujourd'hui
      { id: 'c', jours: [5] }, // vendredi : dans 2 jours
    ]
    expect(trierParProchainJour(offres, 3).map((o) => o.id)).toEqual(['b', 'c', 'a'])
  })
})
