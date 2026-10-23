import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import Verre from '../components/Verre.jsx'
import { useAuth } from '../lib/auth.js'
import { jourParis } from '../lib/categories.js'
import { chargerOffre, libelleJours, libelleProchainJour, raisonIndisponible } from '../lib/offres.js'
import { BOUTON_PRINCIPAL, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { supabase } from '../lib/supabase.js'
import { useAbonnement } from '../lib/useAbonnement.js'

const BOUTON_SECONDAIRE =
  'flex min-h-12 items-center justify-center rounded-[18px] border border-creme/30 bg-creme/10 px-4 py-3 text-center font-semibold text-creme hover:bg-creme/20'

// Utilisations restantes de l'offre pour un membre connecté (RG06 : max_par_membre), null sinon
function useUtilisationsRestantes(offreId, actif) {
  const [restantes, setRestantes] = useState(null)

  useEffect(() => {
    if (!actif || !supabase) return
    let encore = true
    supabase.rpc('utilisations_restantes', { offre: offreId }).then(({ data, error }) => {
      if (encore) setRestantes(error ? null : data)
    })
    return () => {
      encore = false
    }
  }, [offreId, actif])

  return actif ? restantes : null
}

// Page d'une offre et de son commerce (US09)
export default function Offre() {
  const { id } = useParams()
  const { session, profil, chargement: chargementAuth } = useAuth()
  const { actif: abonne, chargement: chargementAbonnement } = useAbonnement()
  const [offre, setOffre] = useState(undefined)
  const navigate = useNavigate()
  const [etape, setEtape] = useState(null)
  const aujourdhui = jourParis()

  const connecte = Boolean(session)
  const membre = connecte && profil?.role === 'membre'
  const restantes = useUtilisationsRestantes(id, membre)

  useEffect(() => {
    let encore = true
    chargerOffre(id)
      .then((o) => encore && setOffre(o))
      .catch(() => encore && setOffre(null))
    return () => {
      encore = false
    }
  }, [id])

  if (offre === undefined || chargementAuth || (connecte && chargementAbonnement)) return null

  if (offre === null) {
    return (
      <section className="mx-auto max-w-md px-4 pt-2">
        <Verre className={`mt-6 ${VERRE_FUME} rounded-[28px] px-6 py-10 text-center`}>
          <p className="font-titre text-[24px] font-black">Offre introuvable</p>
          <p className="mt-1.5 text-creme/75">Cette offre n'existe pas ou n'est plus proposée.</p>
          <Link to="/catalogue" className={`mt-6 ${BOUTON_PRINCIPAL}`}>
            Retour au catalogue
          </Link>
        </Verre>
      </section>
    )
  }

  const { commerce } = offre
  const valableAujourdhui = offre.jours.includes(aujourdhui)
  const prochain = libelleProchainJour(offre.jours, aujourdhui)
  const raison = raisonIndisponible({
    connecte,
    role: profil?.role,
    abonne,
    valableAujourdhui,
    // Tant que le nombre n'est pas lu, on ne bloque pas sur la limite
    restantes: restantes ?? offre.max_par_membre,
    prochain,
  })

  return (
    <section className="mx-auto max-w-md px-4 pt-2 pb-6">
      <Link to="/catalogue" className="inline-flex min-h-11 items-center gap-1 font-semibold text-abricot hover:text-creme">
        <Icon name="chevron" className="size-5 rotate-90" />
        Catalogue
      </Link>

      {/* Fiche du commerce */}
      <Verre className={`mt-2 overflow-hidden ${VERRE_FUME} rounded-[28px]`}>
        <Photo
          id={commerce.photo}
          nomCategorie={commerce.categorie}
          largeur={720}
          hauteur={360}
          className="h-44 w-full"
        />
        <div className="p-5">
          <p className="text-sm font-semibold text-creme/75">{commerce.categorie}</p>
          <h1 className={TITRE_PAGE}>{commerce.nom}</h1>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-creme/80">
            <Icon name="pin" className="mt-0.5 size-4 shrink-0" />
            <span>
              {commerce.adresse ? `${commerce.adresse}, ` : ''}
              {commerce.ville}
            </span>
          </p>
          {commerce.description && (
            <p className="mt-3 text-[15px] leading-relaxed text-creme/90">{commerce.description}</p>
          )}
        </div>
      </Verre>

      {/* L'offre */}
      <Verre className={`mt-5 ${VERRE_FUME} rounded-[28px] p-5`}>
        <h2 className="font-titre text-[22px] leading-tight font-black">{offre.titre}</h2>
        {offre.description && (
          <p className="mt-2 text-[15px] leading-relaxed text-creme/85">
            <span className="font-semibold text-creme">Conditions : </span>
            {offre.description}
          </p>
        )}

        <dl className="mt-4 grid gap-3 text-[15px]">
          <div className="flex items-start justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-creme/75">
              <Icon name="calendar" className="size-4 shrink-0" />
              Jours de validité
            </dt>
            <dd className="text-right font-semibold">{libelleJours(offre.jours)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-creme/75">
              <Icon name="tag" className="size-4 shrink-0" />
              Valeur de l'article offert
            </dt>
            <dd className="font-titre text-lg font-black text-or">{offre.economie} €</dd>
          </div>
          {membre && restantes !== null && (
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-creme/75">
                <Icon name="check" className="size-4 shrink-0" />
                Utilisations restantes
              </dt>
              <dd className="font-semibold">
                {restantes} / {offre.max_par_membre}
              </dd>
            </div>
          )}
        </dl>

        <p
          className={`mt-4 text-sm font-semibold ${valableAujourdhui ? 'text-emerald-300' : 'text-creme/75'}`}
        >
          {valableAujourdhui ? "Valable aujourd'hui" : `Prochain jour valable : ${prochain}`}
        </p>

        <button
          type="button"
          // Membre : écran de validation en caisse (US10) ; visiteur : invitation à créer un compte
          onClick={() => (connecte ? navigate(`/offres/${id}/valider`) : setEtape('compte'))}
          disabled={Boolean(raison)}
          aria-describedby={raison ? 'raison-indisponible' : undefined}
          className={`mt-5 w-full ${BOUTON_PRINCIPAL} disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none`}
        >
          Utiliser
        </button>

        {raison && (
          <p id="raison-indisponible" className="mt-3 text-center text-sm font-medium text-creme/85">
            {raison.texte}{' '}
            {raison.code === 'abonnement' && (
              <Link to="/abonnement" className="font-semibold text-abricot underline hover:text-creme">
                Je m'abonne
              </Link>
            )}
          </p>
        )}

        {/* Visiteur : invitation à créer un compte (RG03) */}
        {etape === 'compte' && (
          <div role="dialog" aria-labelledby="titre-compte" className="mt-4 rounded-[20px] border border-creme/15 bg-creme/5 p-4">
            <p id="titre-compte" className="font-bold">
              Créez un compte pour utiliser cette offre
            </p>
            <p className="mt-1 text-sm text-creme/80">
              Les offres Twins sont réservées aux membres abonnés.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/connexion" className={BOUTON_SECONDAIRE}>
                Se connecter
              </Link>
              <Link to="/inscription" className={BOUTON_PRINCIPAL}>
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </Verre>
    </section>
  )
}
