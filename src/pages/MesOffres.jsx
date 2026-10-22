import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import Alerte from '../components/Alerte.jsx'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { changerEtatOffre, chargerMesOffres, formaterMontant } from '../lib/mesOffres.js'
import { libelleJours } from '../lib/offres.js'
import { BOUTON_PRINCIPAL, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { useCommerce } from '../lib/useCommerce.js'

const boutonSecondaire =
  'flex min-h-11 items-center justify-center rounded-[16px] border border-creme/40 px-3 py-2.5 text-center text-sm font-bold text-creme hover:border-creme disabled:opacity-60'

const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`

function CarteOffre({ offre, enConfirmation, occupee, onDemanderDesactivation, onAnnuler, onChanger }) {
  return (
    <li className="min-w-0">
      <article
        className={`rounded-[20px] border p-4 ${
          offre.active ? 'border-creme/15 bg-creme/5' : 'border-creme/10 bg-nuit/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-[15px] leading-snug font-bold break-words text-creme">{offre.titre}</h2>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              offre.active ? 'border-valide/60 bg-valide/15 text-creme' : 'border-creme/30 text-creme/75'
            }`}
          >
            {offre.active ? 'Active' : 'Désactivée'}
          </span>
        </div>

        {offre.conditions && <p className="mt-2 text-sm break-words text-creme/80">{offre.conditions}</p>}

        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-creme/80">
          <Icon name="calendar" className="size-4 shrink-0" />
          <span className="sr-only">Jours de validité : </span>
          {libelleJours(offre.jours)}
        </p>
        <p className="mt-1 text-[13px] text-creme/80">
          Valeur offerte : {formaterMontant(offre.valeur)} € ·{' '}
          {pluriel(offre.maxParMembre, 'utilisation', 'utilisations')} par membre au plus
        </p>
        <p className="mt-1 text-[13px] text-creme/80">
          {pluriel(offre.utilisations, 'utilisation validée', 'utilisations validées')} en caisse
        </p>

        {enConfirmation ? (
          <div className="mt-4">
            <p className="text-sm text-creme">
              Cette offre disparaîtra du catalogue.
              {offre.utilisations > 0 && ' Ses utilisations passées restent comptées.'} Vous pourrez la réactiver.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={onAnnuler} disabled={occupee} className={boutonSecondaire}>
                Annuler
              </button>
              <button
                type="button"
                onClick={() => onChanger(offre, false)}
                disabled={occupee}
                className={`min-h-11 rounded-[16px] bg-corail px-3 py-2.5 text-sm font-extrabold text-prune disabled:opacity-60`}
              >
                {occupee ? 'Désactivation…' : 'Désactiver'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to={`/commercant/offres/${offre.id}/modifier`} className={boutonSecondaire}>
              Modifier
            </Link>
            {offre.active ? (
              <button
                type="button"
                onClick={() => onDemanderDesactivation(offre.id)}
                disabled={occupee}
                className={boutonSecondaire}
              >
                Désactiver
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChanger(offre, true)}
                disabled={occupee}
                className={boutonSecondaire}
              >
                {occupee ? 'Réactivation…' : 'Réactiver'}
              </button>
            )}
          </div>
        )}
      </article>
    </li>
  )
}

// /commercant/offres : les offres du commerçant, actives ou non (US06)
export default function MesOffres() {
  const { state } = useLocation()
  const { commerce } = useCommerce()
  const [offres, setOffres] = useState(null)
  const [erreurChargement, setErreurChargement] = useState(false)
  const [enConfirmation, setEnConfirmation] = useState(null)
  const [occupee, setOccupee] = useState(null)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState(state?.message ?? '')

  useEffect(() => {
    if (!commerce) return
    let actif = true
    chargerMesOffres(commerce.id)
      .then((liste) => actif && setOffres(liste))
      .catch(() => actif && setErreurChargement(true))
    return () => {
      actif = false
    }
  }, [commerce])

  async function changer(offre, active) {
    setOccupee(offre.id)
    setErreur('')
    setMessage('')
    try {
      await changerEtatOffre(offre.id, active)
      setOffres((liste) => liste.map((o) => (o.id === offre.id ? { ...o, active } : o)))
      setEnConfirmation(null)
      setMessage(active ? 'Offre réactivée : elle est de nouveau dans le catalogue.' : 'Offre désactivée.')
    } catch {
      setErreur("Le changement n'a pas pu être enregistré. Réessayez dans un instant.")
    }
    setOccupee(null)
  }

  return (
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <Link
          to="/commercant"
          className="text-sm font-semibold text-abricot underline decoration-abricot/50 underline-offset-4 hover:text-creme"
        >
          ← Mon espace
        </Link>
        <h1 className={`mt-3 ${TITRE_PAGE}`}>Mes offres</h1>
        <p className="mt-2 text-creme/80">Les offres 1 acheté = 1 offert de votre commerce.</p>

        <Link to="/commercant/offres/nouvelle" className={`mt-6 w-full ${BOUTON_PRINCIPAL}`}>
          Nouvelle offre
        </Link>

        <div className="mt-5 grid gap-3">
          {message && <Alerte succes>{message}</Alerte>}
          {erreur && <Alerte>{erreur}</Alerte>}
          {erreurChargement && <Alerte>Vos offres n'ont pas pu être chargées. Réessayez dans un instant.</Alerte>}
        </div>

        {offres && offres.length === 0 && (
          <div className="mt-5 rounded-[20px] border border-creme/15 bg-creme/5 p-5 text-center">
            <p className="font-titre text-xl font-black text-creme">Aucune offre pour l'instant</p>
            <p className="mt-1.5 text-sm text-creme/80">
              Créez votre première offre : elle apparaît dans le catalogue dès sa publication.
            </p>
          </div>
        )}

        {offres && offres.length > 0 && (
          <ul className="mt-5 grid gap-4">
            {offres.map((o) => (
              <CarteOffre
                key={o.id}
                offre={o}
                enConfirmation={enConfirmation === o.id}
                occupee={occupee === o.id}
                onDemanderDesactivation={setEnConfirmation}
                onAnnuler={() => setEnConfirmation(null)}
                onChanger={changer}
              />
            ))}
          </ul>
        )}
      </Verre>
    </section>
  )
}
