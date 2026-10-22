import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Alerte from '../components/Alerte.jsx'
import Champ from '../components/Champ.jsx'
import Verre from '../components/Verre.jsx'
import { JOURS } from '../lib/categories.js'
import {
  CONDITIONS_MAX,
  UTILISATIONS_MAX,
  chargerMonOffre,
  enregistrerOffre,
  formaterMontant,
  verifierOffre,
} from '../lib/mesOffres.js'
import { BOUTON_PRINCIPAL, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { useCommerce } from '../lib/useCommerce.js'

// Même habillage que Champ (thème crépuscule), pour la zone de conditions
const classeChamp =
  'mt-1.5 block w-full rounded-[14px] border bg-nuit/60 px-3.5 py-3 text-base text-creme [color-scheme:dark] outline-none focus:border-or focus:ring-2 focus:ring-or/60'

const lienRetour =
  'text-sm font-semibold text-abricot underline decoration-abricot/50 underline-offset-4 hover:text-creme'

const VIDE = { titre: '', conditions: '', jours: [], maxParMembre: '1', valeur: '' }

function Formulaire({ merchantId, offre }) {
  const navigate = useNavigate()
  const [valeurs, setValeurs] = useState(
    offre
      ? {
          titre: offre.titre,
          conditions: offre.conditions,
          jours: offre.jours,
          maxParMembre: String(offre.maxParMembre),
          valeur: formaterMontant(offre.valeur),
        }
      : VIDE,
  )
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)

  function changer(e) {
    const { name, value } = e.target
    setValeurs((v) => ({ ...v, [name]: value }))
    setErreurs((er) => ({ ...er, [name]: undefined, general: undefined }))
  }

  function basculerJour(iso) {
    setValeurs((v) => ({
      ...v,
      jours: v.jours.includes(iso) ? v.jours.filter((j) => j !== iso) : [...v.jours, iso],
    }))
    setErreurs((er) => ({ ...er, jours: undefined, general: undefined }))
  }

  function tousLesJours() {
    const tous = valeurs.jours.length === JOURS.length
    setValeurs((v) => ({ ...v, jours: tous ? [] : JOURS.map((j) => j.iso) }))
    setErreurs((er) => ({ ...er, jours: undefined, general: undefined }))
  }

  async function envoyer(e) {
    e.preventDefault()
    const nouvellesErreurs = verifierOffre(valeurs)
    if (Object.keys(nouvellesErreurs).length) return setErreurs(nouvellesErreurs)

    setEnvoi(true)
    try {
      await enregistrerOffre(merchantId, valeurs, offre?.id)
    } catch {
      setEnvoi(false)
      return setErreurs({ general: "L'offre n'a pas pu être enregistrée. Vérifiez les champs et réessayez." })
    }
    navigate('/commercant/offres', {
      state: { message: offre ? 'Offre modifiée.' : 'Offre créée : elle est visible dans le catalogue.' },
    })
  }

  return (
    <form onSubmit={envoyer} noValidate className="mt-7 grid gap-5">
      <Champ
        id="titre"
        label="Titre de l'offre"
        placeholder="1 plat acheté = 1 plat offert"
        maxLength={120}
        value={valeurs.titre}
        onChange={changer}
        erreur={erreurs.titre}
      />

      <div>
        <label htmlFor="conditions" className="block text-sm font-semibold text-creme">
          Conditions <span className="font-normal text-creme/75">(facultatif)</span>
        </label>
        <textarea
          id="conditions"
          name="conditions"
          rows={3}
          value={valeurs.conditions}
          onChange={changer}
          aria-invalid={Boolean(erreurs.conditions)}
          aria-describedby="conditions-message"
          className={`${classeChamp} resize-none ${erreurs.conditions ? 'border-duo-500' : 'border-creme/40'}`}
        />
        <p
          id="conditions-message"
          className={`mt-1.5 text-sm ${erreurs.conditions ? 'font-medium text-duo-200' : 'text-right text-creme/75'}`}
        >
          {erreurs.conditions ?? `${valeurs.conditions.trim().length} / ${CONDITIONS_MAX}`}
        </p>
      </div>

      <fieldset aria-describedby={erreurs.jours ? 'jours-message' : undefined}>
        <legend className="text-sm font-semibold text-creme">Jours de validité</legend>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {JOURS.map((j) => {
            const choisi = valeurs.jours.includes(j.iso)
            return (
              // La case est masquée : l'anneau doré du focus clavier est porté par la pastille
              <label
                key={j.iso}
                className={`grid min-h-12 cursor-pointer place-items-center rounded-[14px] border text-[13px] font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-or ${
                  choisi
                    ? 'border-corail bg-corail/20 text-creme'
                    : 'border-creme/30 bg-creme/5 text-creme/80 hover:border-creme/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={choisi}
                  onChange={() => basculerJour(j.iso)}
                  className="sr-only"
                />
                <span aria-hidden="true">{j.long.slice(0, 3)}</span>
                <span className="sr-only">{j.long}</span>
              </label>
            )
          })}
        </div>
        <button
          type="button"
          onClick={tousLesJours}
          className="mt-2 text-sm font-semibold text-abricot underline decoration-abricot/50 underline-offset-4 hover:text-creme"
        >
          {valeurs.jours.length === JOURS.length ? 'Tout décocher' : 'Tous les jours'}
        </button>
        {erreurs.jours && (
          <p id="jours-message" className="mt-1.5 text-sm font-medium text-duo-200">
            {erreurs.jours}
          </p>
        )}
      </fieldset>

      <Champ
        id="maxParMembre"
        label="Utilisations par membre"
        inputMode="numeric"
        autoComplete="off"
        value={valeurs.maxParMembre}
        onChange={changer}
        erreur={erreurs.maxParMembre}
        aide={`Combien de fois un même membre peut profiter de cette offre (1 à ${UTILISATIONS_MAX}).`}
      />

      <Champ
        id="valeur"
        label="Valeur de l'article offert (€)"
        inputMode="decimal"
        autoComplete="off"
        placeholder="12,50"
        value={valeurs.valeur}
        onChange={changer}
        erreur={erreurs.valeur}
        aide="Le prix de l'article offert : c'est l'économie affichée aux membres."
      />

      {erreurs.general && <Alerte>{erreurs.general}</Alerte>}

      <button type="submit" disabled={envoi} className={`w-full disabled:opacity-60 ${BOUTON_PRINCIPAL}`}>
        {envoi ? 'Enregistrement…' : offre ? 'Enregistrer les modifications' : "Publier l'offre"}
      </button>
    </form>
  )
}

// /commercant/offres/nouvelle et /commercant/offres/:id/modifier
export default function FormulaireOffre() {
  const { id } = useParams()
  const { commerce, chargement } = useCommerce()
  // Modification : 'chargement' → { offre } | 'introuvable' | 'erreur' ; création : aucun chargement
  const [lecture, setLecture] = useState(id ? 'chargement' : { offre: null })

  useEffect(() => {
    if (!id || !commerce) return
    let actif = true
    chargerMonOffre(commerce.id, id)
      .then((offre) => actif && setLecture(offre ? { offre } : 'introuvable'))
      .catch(() => actif && setLecture('erreur'))
    return () => {
      actif = false
    }
  }, [id, commerce])

  const pret = !chargement && commerce && typeof lecture === 'object'

  return (
    <section className="mx-auto max-w-md px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <Link to="/commercant/offres" className={lienRetour}>
          ← Mes offres
        </Link>
        <h1 className={`mt-3 ${TITRE_PAGE}`}>{id ? "Modifier l'offre" : 'Nouvelle offre'}</h1>
        <p className="mt-2 text-creme/80">Un article acheté, le second offert, les jours que vous choisissez.</p>

        {lecture === 'introuvable' && (
          <div className="mt-7">
            <Alerte>Cette offre n'existe pas ou n'est pas la vôtre. Retournez à « Mes offres ».</Alerte>
          </div>
        )}
        {lecture === 'erreur' && (
          <div className="mt-7">
            <Alerte>L'offre n'a pas pu être chargée. Réessayez dans un instant.</Alerte>
          </div>
        )}
        {pret && <Formulaire merchantId={commerce.id} offre={lecture.offre} />}
      </Verre>
    </section>
  )
}
