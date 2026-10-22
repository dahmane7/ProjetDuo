import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { chargerOffre } from '../lib/offres.js'
import { BOUTON_PRINCIPAL, VERRE_FUME } from '../lib/styles.js'
import { supabase } from '../lib/supabase.js'
import {
  codeRefus,
  formaterEuros,
  formaterHeure,
  formaterNumero,
  messageValidation,
} from '../lib/validation.js'

const TOUCHES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'effacer', '0', 'valider']
const TOUCHE =
  'grid min-h-14 place-items-center rounded-[18px] border border-creme/20 bg-creme/10 font-titre text-[26px] font-black text-creme active:bg-creme/25 disabled:opacity-40'

// Écran à tendre au commerçant (US10) : il tape son code, valider_offre fait les contrôles
export default function Validation() {
  const { id } = useParams()
  const [offre, setOffre] = useState(undefined)
  const [code, setCode] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [resultat, setResultat] = useState(null)

  useEffect(() => {
    let encore = true
    chargerOffre(id)
      .then((o) => encore && setOffre(o))
      .catch(() => encore && setOffre(null))
    return () => {
      encore = false
    }
  }, [id])

  async function valider() {
    if (code.length !== 4 || envoi) return
    setEnvoi(true)
    setErreur(null)
    const { data, error } = await supabase.rpc('valider_offre', { offre: id, pin: code })
    setEnvoi(false)
    if (error) {
      setErreur({ code: codeRefus(error), texte: messageValidation(error) })
      setCode('')
      return
    }
    setResultat(data)
  }

  function appuyer(touche) {
    if (touche === 'effacer') return setCode((c) => c.slice(0, -1))
    if (touche === 'valider') return valider()
    setErreur(null)
    setCode((c) => (c.length < 4 ? c + touche : c))
  }

  if (offre === undefined) return null

  if (offre === null) {
    return (
      <section className="mx-auto max-w-md px-4 pt-2">
        <Verre className={`mt-6 ${VERRE_FUME} rounded-[28px] px-6 py-10 text-center`}>
          <p className="font-titre text-[24px] font-black">Offre introuvable</p>
          <Link to="/catalogue" className={`mt-6 ${BOUTON_PRINCIPAL}`}>
            Retour au catalogue
          </Link>
        </Verre>
      </section>
    )
  }

  // Offre validée : en grand, pour que le commerçant le voie
  if (resultat) {
    return (
      <section className="mx-auto max-w-md px-4 pt-2 pb-6">
        <Verre
          role="status"
          className="mt-4 rounded-[28px] border border-emerald-300/50 bg-emerald-900/40 px-5 py-8 text-center"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-300 text-nuit">
            <Icon name="check" className="size-9" />
          </span>
          <p className="mt-4 font-titre text-[30px] leading-tight font-black">Offre validée</p>
          <p className="mt-1 text-creme/85">
            {resultat.commerce} · {resultat.titre}
          </p>
          <p className="mt-6 text-sm font-semibold tracking-wide text-creme/75 uppercase">
            Numéro de validation
          </p>
          <p className="font-titre text-[48px] leading-none font-black tracking-tight text-or tabular-nums">
            {formaterNumero(resultat.numero)}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-[18px] bg-nuit/40 px-4 py-3">
              <dt className="text-sm text-creme/75">Heure</dt>
              <dd className="font-titre text-[28px] font-black tabular-nums">
                {formaterHeure(resultat.created_at)}
              </dd>
            </div>
            <div className="rounded-[18px] bg-nuit/40 px-4 py-3">
              <dt className="text-sm text-creme/75">Économie</dt>
              <dd className="font-titre text-[28px] font-black text-or">
                {formaterEuros(resultat.economie)}
              </dd>
            </div>
          </dl>
          <Link to={`/offres/${id}`} className={`mt-7 ${BOUTON_PRINCIPAL}`}>
            Terminé
          </Link>
        </Verre>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md px-4 pt-2 pb-6">
      <Link
        to={`/offres/${id}`}
        className="inline-flex min-h-11 items-center gap-1 font-semibold text-abricot hover:text-creme"
      >
        <Icon name="chevron" className="size-5 rotate-90" />
        Retour à l'offre
      </Link>

      <Verre className={`mt-2 ${VERRE_FUME} rounded-[28px] px-5 py-6`}>
        <p className="text-center text-sm font-semibold text-abricot">
          Tendez ce téléphone au commerçant
        </p>
        <h1 className="mt-2 text-center font-titre text-[28px] leading-tight font-black">
          {offre.commerce.nom}
        </h1>
        <p className="mt-1 text-center text-creme/85">{offre.titre}</p>

        <p id="consigne-code" className="mt-6 text-center font-semibold">
          Code du commerçant
        </p>
        <div
          role="group"
          aria-labelledby="consigne-code"
          aria-describedby={erreur ? 'erreur-validation' : undefined}
          className="mt-3 flex justify-center gap-3"
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`grid size-14 place-items-center rounded-[16px] border-2 ${
                erreur?.code === 'code_incorrect'
                  ? 'border-duo-500'
                  : i === code.length
                    ? 'border-or'
                    : 'border-creme/30'
              } bg-nuit/40`}
            >
              {i < code.length && <span className="size-3.5 rounded-full bg-creme" />}
            </span>
          ))}
          <span className="sr-only" aria-live="polite">
            {code.length} chiffre{code.length > 1 ? 's' : ''} sur 4
          </span>
        </div>

        <p
          id="erreur-validation"
          role="alert"
          className={`mt-4 min-h-6 text-center font-bold ${
            erreur?.code === 'code_incorrect' ? 'text-[20px] text-duo-200' : 'text-creme'
          }`}
        >
          {erreur?.texte}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {TOUCHES.map((t) =>
            t === 'valider' ? (
              <button
                key={t}
                type="button"
                onClick={() => appuyer(t)}
                disabled={code.length !== 4 || envoi}
                className={`${BOUTON_PRINCIPAL} min-h-14 disabled:opacity-40 disabled:shadow-none`}
                aria-label="Valider le code"
              >
                {envoi ? '…' : <Icon name="check" className="size-7" />}
              </button>
            ) : t === 'effacer' ? (
              <button
                key={t}
                type="button"
                onClick={() => appuyer(t)}
                disabled={!code || envoi}
                className={TOUCHE}
                aria-label="Effacer le dernier chiffre"
              >
                <Icon name="close" className="size-6" />
              </button>
            ) : (
              <button
                key={t}
                type="button"
                onClick={() => appuyer(t)}
                disabled={envoi}
                className={TOUCHE}
              >
                {t}
              </button>
            ),
          )}
        </div>
      </Verre>
    </section>
  )
}
