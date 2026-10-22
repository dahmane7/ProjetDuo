import { describe, expect, it } from 'vitest'
import {
  libelleJours,
  libelleProchainJour,
  prochainJour,
  raisonIndisponible,
  trierParProchainJour,
} from './offres.js'

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

describe('libelleJours', () => {
  it('abrège les jours dans l’ordre de la semaine', () => {
    expect(libelleJours([5, 1, 3])).toBe('lun · mer · ven')
  })

  it('dit « Tous les jours » pour les sept jours', () => {
    expect(libelleJours([1, 2, 3, 4, 5, 6, 7])).toBe('Tous les jours')
  })
})

describe('libelleProchainJour', () => {
  it('dit « demain » ou le nom du jour', () => {
    expect(libelleProchainJour([5], 4)).toBe('demain')
    expect(libelleProchainJour([1], 4)).toBe('lundi')
  })
})

describe('raisonIndisponible', () => {
  const membreOk = {
    connecte: true,
    role: 'membre',
    abonne: true,
    valableAujourdhui: true,
    restantes: 1,
    prochain: 'demain',
  }

  it('laisse le bouton actif pour un membre abonné, le bon jour, sous la limite', () => {
    expect(raisonIndisponible(membreOk)).toBeNull()
  })

  it('laisse le bouton actif pour un visiteur (invitation à créer un compte)', () => {
    expect(raisonIndisponible({ ...membreOk, connecte: false, role: undefined })).toBeNull()
  })

  it('bloque un commerçant', () => {
    expect(raisonIndisponible({ ...membreOk, role: 'commercant' }).code).toBe('membres')
  })

  it('bloque un membre non abonné', () => {
    expect(raisonIndisponible({ ...membreOk, abonne: false }).code).toBe('abonnement')
  })

  it("bloque une offre qui n'est pas valable aujourd'hui", () => {
    const raison = raisonIndisponible({ ...membreOk, valableAujourdhui: false, prochain: 'lundi' })
    expect(raison.code).toBe('jour')
    expect(raison.texte).toContain('lundi')
  })

  it('bloque quand le membre a atteint le maximum de l’offre (RG06)', () => {
    expect(raisonIndisponible({ ...membreOk, restantes: 0 }).code).toBe('limite')
  })
})
