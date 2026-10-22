import QRCode from 'qrcode'
import { useCallback, useEffect, useState } from 'react'
import { formaterCodeCourt, formaterCompteARebours, secondesRestantes } from '../lib/qr.js'
import { BOUTON_PRINCIPAL } from '../lib/styles.js'
import { supabase } from '../lib/supabase.js'
import { messageValidation } from '../lib/validation.js'

// Image du QR code : l'identifiant du jeton, lisible de près comme de loin
function dessiner(jeton) {
  return QRCode.toDataURL(jeton, { width: 560, margin: 1, errorCorrectionLevel: 'M' })
}

// QR code à présenter au commerçant (US14) : une offre, 5 minutes, une seule fois (RG13).
// L'écran interroge l'état du jeton et passe seul à « Offre validée » quand le commerçant scanne.
export default function QrCodeMembre({ offreId, onValide }) {
  const [jeton, setJeton] = useState(null)
  const [image, setImage] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  const demander = useCallback(async () => {
    setErreur(null)
    const { data, error } = await supabase.rpc('creer_jeton_qr', { offre: offreId })
    if (error) {
      setJeton(null)
      setErreur(messageValidation(error))
      return
    }
    setImage(await dessiner(data.jeton))
    setMaintenant(Date.now())
    setJeton(data)
  }, [offreId])

  // Premier QR code à l'ouverture de l'onglet
  useEffect(() => {
    let encore = true
    supabase.rpc('creer_jeton_qr', { offre: offreId }).then(async ({ data, error }) => {
      if (!encore) return
      if (error) return setErreur(messageValidation(error))
      const dessin = await dessiner(data.jeton)
      if (!encore) return
      setImage(dessin)
      setJeton(data)
    })
    return () => {
      encore = false
    }
  }, [offreId])

  const restantes = jeton ? secondesRestantes(jeton.expire_le, maintenant) : 0
  const expire = jeton && restantes === 0

  // Compte à rebours, et toutes les 2 s : le commerçant a-t-il scanné ?
  useEffect(() => {
    if (!jeton || expire) return
    let encore = true
    const minuteur = setInterval(() => setMaintenant(Date.now()), 1000)
    const sondage = setInterval(async () => {
      const { data } = await supabase.rpc('etat_jeton', { jeton: jeton.jeton })
      if (encore && data?.statut === 'utilise') onValide(data.resultat)
    }, 2000)
    return () => {
      encore = false
      clearInterval(minuteur)
      clearInterval(sondage)
    }
  }, [jeton, expire, onValide])

  if (erreur) {
    return (
      <p role="alert" className="mt-6 text-center font-bold text-creme">
        {erreur}
      </p>
    )
  }

  if (!jeton) return <p className="mt-6 text-center text-creme/80">Préparation du QR code…</p>

  return (
    <div className="mt-5 flex flex-col items-center text-center">
      <p className="font-semibold">Le commerçant le scanne depuis son espace</p>
      <div className={`mt-3 rounded-[22px] bg-white p-3 ${expire ? 'opacity-25' : ''}`}>
        <img src={image} alt="QR code de validation" className="size-56" />
      </div>

      <p className="mt-4 text-sm text-creme/80">Ou il tape ce code court :</p>
      <p className="font-titre text-[36px] leading-none font-black tracking-[4px] text-or tabular-nums">
        {formaterCodeCourt(jeton.code)}
      </p>

      {expire ? (
        <>
          <p role="alert" className="mt-4 font-bold">
            QR code expiré
          </p>
          <button type="button" onClick={demander} className={`mt-3 w-full ${BOUTON_PRINCIPAL}`}>
            Nouveau QR code
          </button>
        </>
      ) : (
        <p className="mt-4 text-sm text-creme/80" aria-live="off">
          Valable encore <span className="font-bold text-creme tabular-nums">{formaterCompteARebours(restantes)}</span>,
          une seule fois
        </p>
      )}
    </div>
  )
}
