import QrScanner from 'qr-scanner'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { messageQr, nettoyerCodeCourt } from '../lib/qr.js'
import { BOUTON_PRINCIPAL, VERRE_FUME } from '../lib/styles.js'
import { supabase } from '../lib/supabase.js'
import { formaterEuros, formaterHeure, formaterNumero } from '../lib/validation.js'

const CHAMP =
  'block w-full rounded-[16px] border border-creme/30 bg-nuit/40 px-4 py-3 text-center font-titre text-[26px] font-black tracking-[4px] text-creme uppercase outline-none focus:border-or'

// « Scanner » (US14) : le commerçant lit le QR code du membre avec l'appareil photo,
// ou tape le code court ; valider_qr refait les contrôles d'US10 pour le membre.
export default function Scanner() {
  const video = useRef(null)
  const scanner = useRef(null)
  // occupe : délai après un refus, pour ne pas relire en boucle le même QR code avec la caméra ;
  // enCours : une validation est partie, on attend sa réponse
  const occupe = useRef(false)
  const enCours = useRef(false)
  const [camera, setCamera] = useState('demarrage') // demarrage | active | indisponible
  const [code, setCode] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [resultat, setResultat] = useState(null)

  // La saisie manuelle n'est pas freinée par le délai de la caméra : le commerçant qui corrige son code
  // obtient toujours une réponse
  const valider = useCallback(async (valeur, manuel = false) => {
    if (enCours.current || (!manuel && occupe.current)) return
    enCours.current = true
    occupe.current = true
    setEnvoi(true)
    setErreur('')
    const { data, error } = await supabase.rpc('valider_qr', { valeur })
    enCours.current = false
    setEnvoi(false)
    if (error) {
      setErreur(messageQr(error))
      // Laisse le temps de lire le message avant de relire un QR code
      setTimeout(() => {
        occupe.current = false
      }, 2500)
      return
    }
    scanner.current?.stop()
    setResultat(data)
  }, [])

  // Appareil photo : démarre à l'affichage, s'arrête en quittant la page
  useEffect(() => {
    if (resultat || !video.current) return
    const lecteur = new QrScanner(video.current, (r) => valider(r.data), {
      returnDetailedScanResult: true,
      highlightScanRegion: true,
      preferredCamera: 'environment',
    })
    scanner.current = lecteur
    lecteur
      .start()
      .then(() => setCamera('active'))
      .catch(() => setCamera('indisponible'))
    return () => {
      lecteur.destroy()
      scanner.current = null
    }
  }, [resultat, valider])

  function recommencer() {
    occupe.current = false
    enCours.current = false
    setCode('')
    setErreur('')
    setResultat(null)
    setCamera('demarrage')
  }

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
          <p className="mt-1 text-creme/85">{resultat.titre}</p>
          <p className="mt-6 text-sm font-semibold tracking-wide text-creme/75 uppercase">
            Numéro de validation
          </p>
          <p className="font-titre text-[44px] leading-none font-black text-or tabular-nums">
            {formaterNumero(resultat.numero)}
          </p>
          <p className="mt-4 text-creme/85">
            {formaterHeure(resultat.created_at)} · article offert {formaterEuros(resultat.economie)}
          </p>
          <button type="button" onClick={recommencer} className={`mt-7 w-full ${BOUTON_PRINCIPAL}`}>
            Scanner un autre QR code
          </button>
        </Verre>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md px-4 pt-2 pb-6">
      <Link
        to="/commercant"
        className="inline-flex min-h-11 items-center gap-1 font-semibold text-abricot hover:text-creme"
      >
        <Icon name="chevron" className="size-5 rotate-90" />
        Mon espace
      </Link>

      <Verre className={`mt-2 ${VERRE_FUME} rounded-[28px] px-5 py-6`}>
        <h1 className="text-center font-titre text-[28px] leading-tight font-black">Scanner</h1>
        <p className="mt-1 text-center text-creme/85">
          Visez le QR code affiché sur le téléphone du membre.
        </p>

        <div className="relative mt-4 aspect-square overflow-hidden rounded-[22px] bg-nuit/70">
          <video ref={video} className="size-full object-cover" muted playsInline />
          {camera !== 'active' && (
            <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-creme/85">
              {camera === 'demarrage'
                ? "Ouverture de l'appareil photo…"
                : "Appareil photo indisponible ou refusé : tapez le code court ci-dessous."}
            </p>
          )}
        </div>

        <p role="alert" className="mt-4 min-h-6 text-center font-bold text-creme">
          {erreur}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (code.length === 6) valider(code, true)
          }}
          className="mt-2"
        >
          <label htmlFor="code-court" className="block text-center font-semibold">
            Ou tapez le code court
          </label>
          <input
            id="code-court"
            value={code}
            onChange={(e) => {
              setCode(nettoyerCodeCourt(e.target.value))
              setErreur('')
            }}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="ABC·DEF"
            className={`mt-2 ${CHAMP}`}
          />
          <button
            type="submit"
            disabled={code.length !== 6 || envoi}
            className={`mt-3 w-full ${BOUTON_PRINCIPAL} disabled:opacity-40 disabled:shadow-none`}
          >
            {envoi ? 'Validation…' : 'Valider le code'}
          </button>
        </form>
      </Verre>
    </section>
  )
}
