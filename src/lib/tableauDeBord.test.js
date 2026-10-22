import { describe, expect, it } from 'vitest'
import { formaterDateHeure, formaterNumero, hauteurBarre, lireTableauDeBord } from './tableauDeBord.js'

describe('lireTableauDeBord', () => {
  it('renvoie des zéros pour un commerçant sans utilisation', () => {
    const t = lireTableauDeBord({ total: 0, par_offre: [], par_jour: [], dernieres: [] })
    expect(t.total).toBe(0)
    expect(t.parOffre).toEqual([])
    expect(t.dernieres).toEqual([])
    expect(t.parJour.map((j) => j.utilisations)).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('tolère une réponse vide', () => {
    expect(lireTableauDeBord(null).total).toBe(0)
  })

  it('range les jours du lundi au dimanche, même désordonnés ou manquants', () => {
    const t = lireTableauDeBord({
      par_jour: [
        { jour: 7, utilisations: 2 },
        { jour: 1, utilisations: 5 },
        { jour: 5, utilisations: 9 },
      ],
    })
    expect(t.parJour.map((j) => j.long)).toEqual([
      'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    ])
    expect(t.parJour.map((j) => j.utilisations)).toEqual([5, 0, 0, 0, 9, 0, 2])
  })

  it('met en forme les offres et les dernières utilisations', () => {
    const t = lireTableauDeBord({
      total: 3,
      par_offre: [{ id: 'o1', titre: 'Plat', active: false, utilisations: 3 }],
      dernieres: [{ numero: 56, created_at: '2026-10-22T10:21:00+00:00', titre: 'Plat' }],
    })
    expect(t.parOffre).toEqual([{ id: 'o1', titre: 'Plat', active: false, utilisations: 3 }])
    expect(t.dernieres).toEqual([{ numero: 56, quand: '2026-10-22T10:21:00+00:00', titre: 'Plat' }])
  })
})

describe('formaterDateHeure', () => {
  it('affiche l’heure de Paris en été (UTC+2)', () => {
    expect(formaterDateHeure('2026-07-14T10:05:00Z')).toEqual({ date: '14/07/2026', heure: '12 h 05' })
  })

  it('affiche l’heure de Paris en hiver (UTC+1)', () => {
    expect(formaterDateHeure('2026-01-14T10:05:00Z')).toEqual({ date: '14/01/2026', heure: '11 h 05' })
  })

  it('change de jour à minuit heure de Paris, pas à minuit UTC', () => {
    expect(formaterDateHeure('2026-10-21T22:30:00Z')).toEqual({ date: '22/10/2026', heure: '0 h 30' })
  })
})

describe('formaterNumero', () => {
  it('complète à six chiffres', () => {
    expect(formaterNumero(56)).toBe('N° 000056')
    expect(formaterNumero(1234567)).toBe('N° 1234567')
  })
})

describe('hauteurBarre', () => {
  it('met la plus haute barre à 100 %', () => {
    expect(hauteurBarre(28, 28)).toBe(100)
    expect(hauteurBarre(14, 28)).toBe(50)
  })

  it('n’affiche rien pour zéro, ni quand tout est à zéro', () => {
    expect(hauteurBarre(0, 28)).toBe(0)
    expect(hauteurBarre(0, 0)).toBe(0)
  })

  it('garde visible une petite valeur', () => {
    expect(hauteurBarre(1, 500)).toBe(4)
  })
})
