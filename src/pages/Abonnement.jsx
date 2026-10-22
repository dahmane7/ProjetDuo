import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../components/Icon.jsx'
import { AVANTAGES, PRIX, finSiActiveMaintenant, formaterDate } from '../lib/abonnement.js'
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
    <section className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-extrabold">Abonnement</h1>

      {actif ? (
        <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-ligne">
          <p className="flex items-center gap-2 font-bold text-valide">
            <Icon name="check" className="size-5" />
            Abonné jusqu'au {formaterDate(abonnement.fin)}
          </p>
          <p className="mt-2 text-sm text-encre-doux">
            Toutes les offres 1 acheté = 1 offert vous sont ouvertes.
          </p>
          <Link
            to="/catalogue"
            className="mt-5 block rounded-lg bg-duo-600 py-3.5 text-center font-semibold text-white hover:bg-duo-700"
          >
            Voir les offres
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(28,29,38,0.10)] ring-1 ring-ligne">
          <div className="bg-linear-to-br from-duo-600 to-duo-500 px-5 py-6 text-white">
            <p className="text-sm font-semibold text-duo-100">Duo · 12 mois</p>
            <p className="mt-1">
              <span className="text-3xl font-extrabold">{PRIX}</span>
              <span className="text-sm text-duo-100"> / an</span>
            </p>
          </div>
          <ul className="grid gap-4 px-5 py-6">
            {AVANTAGES.map((a) => (
              <li key={a} className="flex gap-3 text-[15px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-duo-50 text-duo-600">
                  <Icon name="check" className="size-4" />
                </span>
                {a}
              </li>
            ))}
          </ul>

          <div className="border-t border-ligne px-5 py-5">
            {erreur && (
              <p role="alert" className="mb-4 rounded-lg bg-duo-50 px-3.5 py-3 text-sm font-medium text-duo-700">
                {erreur}
              </p>
            )}

            {confirmation ? (
              <div role="dialog" aria-labelledby="titre-confirmation" className="rounded-xl bg-fond p-4">
                <p id="titre-confirmation" className="font-bold">
                  Activer votre abonnement jusqu'au {formaterDate(finSiActiveMaintenant())} ?
                </p>
                <p className="mt-1 text-sm text-encre-doux">
                  Paiement simulé pour la démo : rien ne vous sera demandé.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmation(false)}
                    disabled={envoi}
                    className="rounded-lg border border-ligne bg-white py-3 font-semibold hover:border-duo-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={activer}
                    disabled={envoi}
                    className="rounded-lg bg-duo-600 py-3 font-semibold text-white hover:bg-duo-700 disabled:opacity-60"
                  >
                    {envoi ? 'Activation…' : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmation(true)}
                className="w-full rounded-lg bg-duo-600 py-3.5 font-semibold text-white hover:bg-duo-700"
              >
                Activer mon abonnement
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
