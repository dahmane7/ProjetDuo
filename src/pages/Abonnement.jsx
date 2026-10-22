import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { AVANTAGES, PRIX, finSiActiveMaintenant, formaterDate } from '../lib/abonnement.js'
import { BOUTON_PRINCIPAL, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { supabase } from '../lib/supabase.js'
import { useAbonnement } from '../lib/useAbonnement.js'

function messageErreur(error) {
  const texte = error.message ?? ''
  if (texte.includes('deja_abonne')) return 'Vous avez déjà un abonnement actif.'
  if (texte.includes('reserve_aux_membres')) return "L'abonnement est réservé aux comptes membres."
  return "L'activation n'a pas abouti. Réessayez dans un instant."
}

// Page « Abonnement » du membre (RG02) : prix, contenu, activation sans paiement
export default function Abonnement() {
  const navigate = useNavigate()
  const { abonnement, actif, chargement, recharger } = useAbonnement()
  const [confirmation, setConfirmation] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function activer() {
    setEnvoi(true)
    setErreur('')
    const { error } = await supabase.rpc('activer_abonnement')
    setEnvoi(false)
    if (error) {
      setErreur(messageErreur(error))
      setConfirmation(false)
      await recharger()
      return
    }
    navigate('/membre')
  }

  if (chargement) return null

  return (
    <section className="mx-auto max-w-md px-4 pt-2">
      <h1 className={`px-1 ${TITRE_PAGE}`}>Abonnement</h1>

      {actif ? (
        <Verre className={`mt-6 ${VERRE_FUME} rounded-[28px] p-5`}>
          <p className="flex items-center gap-2 font-bold text-emerald-200">
            <Icon name="check" className="size-5" />
            Abonné jusqu'au {formaterDate(abonnement.fin)}
          </p>
          <p className="mt-2 text-sm text-creme/80">
            Toutes les offres 1 acheté = 1 offert vous sont ouvertes.
          </p>
          <Link to="/catalogue" className={`mt-5 ${BOUTON_PRINCIPAL}`}>
            Voir les offres
          </Link>
        </Verre>
      ) : (
        <Verre className={`mt-6 overflow-hidden ${VERRE_FUME} rounded-[28px]`}>
          <div className="border-b border-creme/15 px-5 py-6">
            <p className="text-sm font-semibold text-creme/80">Duo · 12 mois</p>
            <p className="mt-1">
              <span className="font-titre text-[34px] font-black">{PRIX}</span>
              <span className="text-sm text-creme/80"> / an</span>
            </p>
          </div>
          <ul className="grid gap-4 px-5 py-6">
            {AVANTAGES.map((a) => (
              <li key={a} className="flex gap-3 text-[15px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-or/50 bg-or/10 text-or">
                  <Icon name="check" className="size-4" />
                </span>
                {a}
              </li>
            ))}
          </ul>

          <div className="border-t border-creme/15 px-5 py-5">
            {erreur && (
              <p role="alert" className="mb-4 rounded-[14px] border border-duo-500/50 bg-duo-500/15 px-3.5 py-3 text-sm font-medium text-creme">
                {erreur}
              </p>
            )}

            {confirmation ? (
              <div role="dialog" aria-labelledby="titre-confirmation" className="rounded-[20px] border border-creme/15 bg-creme/5 p-4">
                <p id="titre-confirmation" className="font-bold">
                  Activer votre abonnement jusqu'au {formaterDate(finSiActiveMaintenant())} ?
                </p>
                <p className="mt-1 text-sm text-creme/80">
                  Paiement simulé pour la démo : rien ne vous sera demandé.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmation(false)}
                    disabled={envoi}
                    className="min-h-12 rounded-[18px] border border-creme/30 bg-creme/10 py-3 font-semibold text-creme hover:bg-creme/20"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={activer}
                    disabled={envoi}
                    className={`${BOUTON_PRINCIPAL} disabled:opacity-60`}
                  >
                    {envoi ? 'Activation…' : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmation(true)} className={`w-full ${BOUTON_PRINCIPAL}`}>
                Activer mon abonnement
              </button>
            )}
          </div>
        </Verre>
      )}
    </section>
  )
}
