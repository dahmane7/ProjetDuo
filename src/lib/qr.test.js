import { describe, expect, it } from 'vitest'
import {
  formaterCodeCourt,
  formaterCompteARebours,
  messageQr,
  nettoyerCodeCourt,
  secondesRestantes,
} from './qr.js'

describe('code court', () => {
  it('se lit en deux moitiés', () => {
    expect(formaterCodeCourt('ABCDEF')).toBe('ABC·DEF')
  })

  it('accepte une saisie en minuscules avec séparateurs', () => {
    expect(nettoyerCodeCourt('abc·d-e f')).toBe('ABCDEF')
    expect(nettoyerCodeCourt('ABCDEFGH')).toBe('ABCDEF')
  })
})

describe('compte à rebours', () => {
  it('compte les secondes restantes, jamais en dessous de zéro', () => {
    const maintenant = Date.parse('2026-10-22T12:00:00Z')
    expect(secondesRestantes('2026-10-22T12:05:00Z', maintenant)).toBe(300)
    expect(secondesRestantes('2026-10-22T11:59:00Z', maintenant)).toBe(0)
  })

  it('affiche minutes et secondes', () => {
    expect(formaterCompteARebours(300)).toBe('5:00')
    expect(formaterCompteARebours(65)).toBe('1:05')
  })
})

describe('messageQr', () => {
  it('dit pourquoi un QR code est refusé', () => {
    expect(messageQr({ message: 'jeton_expire' })).toContain('expiré')
    expect(messageQr({ message: 'jeton_deja_utilise' })).toContain('déjà été utilisé')
    expect(messageQr({ message: 'jeton_autre_commerce' })).toContain('autre commerce')
  })

  it('reprend les contrôles d’US10', () => {
    expect(messageQr({ message: 'limite_atteinte' })).toContain('autant de fois')
  })
})
