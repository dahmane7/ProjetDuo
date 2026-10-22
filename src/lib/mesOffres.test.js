import { describe, expect, it } from 'vitest'
import { formaterMontant, lireMontant, verifierOffre } from './mesOffres.js'

const valide = {
  titre: '1 plat acheté = 1 plat offert',
  conditions: '',
  jours: [1, 2, 3],
  maxParMembre: '1',
  valeur: '12,50',
}

describe('lireMontant', () => {
  it('accepte la virgule et le point décimaux', () => {
    expect(lireMontant('12,50')).toBe(12.5)
    expect(lireMontant('12.5')).toBe(12.5)
    expect(lireMontant(' 8 ')).toBe(8)
  })

  it('refuse ce qui n’est pas un montant', () => {
    for (const texte of ['', 'abc', '-5', '12,345', '1e3', '12 €']) expect(lireMontant(texte)).toBeNaN()
  })
})

describe('formaterMontant', () => {
  it('met la virgule décimale et garde deux décimales', () => {
    expect(formaterMontant(12.5)).toBe('12,50')
    expect(formaterMontant(4.2)).toBe('4,20')
  })

  it('n’ajoute pas « ,00 » à un montant entier', () => {
    expect(formaterMontant(6)).toBe('6')
  })
})

describe('verifierOffre', () => {
  it('ne signale rien pour une offre valide', () => {
    expect(verifierOffre(valide)).toEqual({})
  })

  it('demande un titre, de 3 à 80 caractères', () => {
    expect(verifierOffre({ ...valide, titre: '   ' }).titre).toMatch(/Indiquez le titre/)
    expect(verifierOffre({ ...valide, titre: 'ab' }).titre).toMatch(/trop court/)
    expect(verifierOffre({ ...valide, titre: 'x'.repeat(81) }).titre).toMatch(/trop long.*81/)
    expect(verifierOffre({ ...valide, titre: 'x'.repeat(80) }).titre).toBeUndefined()
  })

  it('limite les conditions à 200 caractères et dit combien il y en a', () => {
    expect(verifierOffre({ ...valide, conditions: 'x'.repeat(200) }).conditions).toBeUndefined()
    expect(verifierOffre({ ...valide, conditions: 'x'.repeat(215) }).conditions).toMatch(/200.*215/)
  })

  it('demande au moins un jour de validité (RG05)', () => {
    expect(verifierOffre({ ...valide, jours: [] }).jours).toMatch(/au moins un jour/)
  })

  it('borne les utilisations par membre de 1 à 10 (RG06)', () => {
    for (const maxParMembre of ['0', '11', '', 'abc', '1,5', '-1'])
      expect(verifierOffre({ ...valide, maxParMembre }).maxParMembre).toMatch(/entier de 1 à 10/)
    for (const maxParMembre of ['1', '10']) expect(verifierOffre({ ...valide, maxParMembre }).maxParMembre).toBeUndefined()
  })

  it('exige une valeur en euros supérieure à 0, au plus 9 999,99 (RG07)', () => {
    for (const valeur of ['', '0', '0,00', 'abc', '-3'])
      expect(verifierOffre({ ...valide, valeur }).valeur).toMatch(/valeur de l’article offert/)
    expect(verifierOffre({ ...valide, valeur: '10000' }).valeur).toMatch(/trop élevée/)
    expect(verifierOffre({ ...valide, valeur: '9999,99' }).valeur).toBeUndefined()
  })

  it('signale tous les champs invalides à la fois', () => {
    const erreurs = verifierOffre({ titre: '', conditions: 'x'.repeat(201), jours: [], maxParMembre: '0', valeur: '' })
    expect(Object.keys(erreurs).sort()).toEqual(['conditions', 'jours', 'maxParMembre', 'titre', 'valeur'])
  })
})
