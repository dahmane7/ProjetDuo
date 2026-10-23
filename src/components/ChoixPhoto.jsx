import { useRef, useState } from 'react'
import { envoyerPhotoCommerce, problemeFichier } from '../lib/photoCommerce.js'
import Champ from './Champ.jsx'
import Icon from './Icon.jsx'
import Photo from './Photo.jsx'

const ONGLET =
  'min-h-11 rounded-[14px] text-sm font-semibold'

// Photo du commerce : envoyée depuis l'appareil (PC, galerie ou appareil photo du téléphone)
// ou donnée par un lien. Dans les deux cas, la fiche garde l'adresse de l'image.
export default function ChoixPhoto({ valeur, onChange, erreur, userId, nomCategorie, onEnvoiChange }) {
  const champFichier = useRef(null)
  const [mode, setMode] = useState(valeur && !valeur.includes('/photos-commerces/') ? 'lien' : 'appareil')
  const [envoi, setEnvoi] = useState(false)
  const [probleme, setProbleme] = useState('')

  async function choisir(e) {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    const refus = problemeFichier(fichier)
    if (refus) return setProbleme(refus)

    setProbleme('')
    setEnvoi(true)
    onEnvoiChange?.(true)
    try {
      onChange(await envoyerPhotoCommerce(fichier, userId))
    } catch (err) {
      setProbleme(
        err?.message === 'trop_lourde'
          ? 'Photo trop lourde, même réduite : essayez une autre photo.'
          : "L'envoi de la photo n'a pas abouti. Réessayez.",
      )
    } finally {
      setEnvoi(false)
      onEnvoiChange?.(false)
    }
  }

  const apercu = /^https:\/\//.test(valeur.trim()) ? valeur.trim() : null

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-creme">
        Photo du commerce <span className="font-normal text-creme/75">(facultatif)</span>
      </legend>

      <div role="tablist" aria-label="Comment ajouter la photo" className="grid grid-cols-2 gap-1 rounded-[18px] bg-nuit/40 p-1">
        {[
          ['appareil', 'Depuis mon appareil'],
          ['lien', 'Coller un lien'],
        ].map(([valeurOnglet, libelle]) => (
          <button
            key={valeurOnglet}
            type="button"
            role="tab"
            aria-selected={mode === valeurOnglet}
            onClick={() => setMode(valeurOnglet)}
            className={`${ONGLET} ${mode === valeurOnglet ? 'bg-creme text-prune' : 'text-creme/85 hover:text-creme'}`}
          >
            {libelle}
          </button>
        ))}
      </div>

      {mode === 'appareil' ? (
        <div>
          {/* accept="image/*" : sur téléphone, galerie ou appareil photo ; sur PC, l'explorateur de fichiers */}
          <input ref={champFichier} type="file" accept="image/*" onChange={choisir} className="sr-only" id="fichier-photo" />
          <button
            type="button"
            onClick={() => champFichier.current?.click()}
            disabled={envoi}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-or/60 bg-or/10 px-4 py-3 font-semibold text-creme hover:bg-or/20 disabled:opacity-60"
          >
            <Icon name="photo" className="size-5 text-or" />
            {envoi ? 'Envoi de la photo…' : apercu ? 'Changer de photo' : 'Choisir une photo'}
          </button>
          <p className="mt-1.5 text-sm text-creme/75">
            Une photo de votre devanture ou de votre salle. Elle est réduite automatiquement.
          </p>
        </div>
      ) : (
        <Champ
          id="photo"
          label="Adresse de la photo"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          erreur={erreur}
          aide="L'adresse d'une image déjà en ligne, par exemple sur votre site."
        />
      )}

      {(probleme || (mode === 'appareil' && erreur)) && (
        <p role="alert" className="text-sm font-medium text-duo-200">
          {probleme || erreur}
        </p>
      )}

      {nomCategorie && (
        <Photo
          key={apercu ?? 'sans-photo'}
          id={apercu}
          nomCategorie={nomCategorie}
          largeur={640}
          hauteur={360}
          className="h-40 w-full rounded-xl"
        />
      )}

      {apercu && (
        <button
          type="button"
          onClick={() => {
            setProbleme('')
            onChange('')
          }}
          disabled={envoi}
          className="justify-self-start text-sm font-semibold text-abricot underline decoration-abricot/50 underline-offset-4 hover:text-creme"
        >
          Retirer la photo
        </button>
      )}
    </fieldset>
  )
}
