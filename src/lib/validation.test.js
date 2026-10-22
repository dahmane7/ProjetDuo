import { describe, expect, it } from 'vitest'
import { codeRefus, formaterEuros, formaterNumero, messageValidation } from './validation.js'

describe('messages de valider_offre', () => {
  it('affiche « Code incorrect » pour un mauvais code', () => {
    expect(messageValidation({ message: 'code_incorrect' })).toBe('Code incorrect')
  })

  it('dit quel contrôle a échoué', () => {
    expect(codeRefus({ message: 'abonnement_inactif' })).toBe('abonnement_inactif')
    expect(messageValidation({ message: 'offre_non_valable' })).toContain("non valable aujourd'hui")
    expect(messageValidation({ message: 'limite_atteinte' })).toContain('Limite')
  })

  it('donne un message générique pour une erreur inattendue', () => {
    expect(codeRefus({ message: 'Failed to fetch' })).toBeNull()
    expect(messageValidation({ message: 'Failed to fetch' })).toContain("n'a pas abouti")
  })
})

describe('mise en forme du résultat', () => {
  it('complète le numéro sur six chiffres', () => {
    expect(formaterNumero(123)).toBe('N° 000123')
  })

  it("n'affiche les centimes que s'il y en a", () => {
    expect(formaterEuros(16)).toMatch(/^16\s€$/)
    expect(formaterEuros('12.5')).toMatch(/^12,50\s€$/)
  })
})
