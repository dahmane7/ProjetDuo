import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { formaterDate } from '../lib/abonnement.js'
import { useAuth } from '../lib/auth.js'
import { chargerEconomies, libelleNombre } from '../lib/economies.js'
import { BOUTON_PRINCIPAL, TEXTE_CHAUD, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { formaterEuros, formaterHeure, formaterNumero } from '../lib/validation.js'

const BOUTON_SECONDAIRE =
  'flex min-h-12 items-center justify-center rounded-[18px] border border-creme/30 bg-creme/10 px-4 py-3 text-center font-semibold text-creme hover:bg-creme/20'

// Données du membre, relues à chaque affichage de la page et quand l'onglet redevient visible :
// après une validation, le total est à jour sans recharger le site
function useEconomies(actif) {
  const [etat, setEtat] = useState({ donnees: null, erreur: false })

  useEffect(() => {
    if (!actif) return
    let encore = true
    const lire = () =>
      chargerEconomies()
        .then((donnees) => encore && setEtat({ donnees, erreur: false }))
        .catch(() => encore && setEtat((e) => ({ ...e, erreur: true })))
    const auRetour = () => document.visibilityState === 'visible' && lire()

    lire()
    document.addEventListener('visibilitychange', auRetour)
    return () => {
      encore = false
      document.removeEventListener('visibilitychange', auRetour)
    }
  }, [actif])

  return etat
}

function Encadre({ titre, texte, children }) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-md items-center px-4">
      <Verre className={`w-full ${VERRE_FUME} rounded-[28px] px-6 py-10 text-center`}>
        <h1 className="font-titre text-[30px] leading-[1.02] font-black tracking-[-1.2px]">{titre}</h1>
        <p className="mt-3 text-[14.5px] leading-[1.45] text-creme/85">{texte}</p>
        {children}
      </Verre>
    </section>
  )
}

// « Mes économies » (US11) : total sur l'abonnement en cours (RG12), nombre d'offres, historique
export default function Economies() {
  const { session, profil, chargement } = useAuth()
  const membre = Boolean(session) && profil?.role === 'membre'
  const { donnees, erreur } = useEconomies(membre)

  if (chargement) return null

  if (!session) {
    return (
      <Encadre
        titre="Tes économies"
        texte="Connecte-toi pour suivre tout ce que tu économises avec Duo."
      >
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/connexion" className={BOUTON_SECONDAIRE}>
            Se connecter
          </Link>
          <Link to="/inscription" className={BOUTON_PRINCIPAL}>
            Créer un compte
          </Link>
        </div>
      </Encadre>
    )
  }

  if (!membre) {
    return (
      <Encadre
        titre="Réservé aux membres"
        texte="Le suivi des économies concerne les comptes membres. Votre tableau de bord commerçant suit les utilisations de vos offres."
      >
        <Link to="/commercant/tableau-de-bord" className={`mt-6 ${BOUTON_PRINCIPAL}`}>
          Mon tableau de bord
        </Link>
      </Encadre>
    )
  }

  if (erreur && !donnees) {
    return (
      <Encadre titre="Tes économies" texte="Tes économies n'ont pas pu être chargées. Réessaie dans un instant." />
    )
  }

  if (!donnees) return null

  const { abonnement, total, nombre, historique } = donnees

  return (
    <section className="mx-auto max-w-md px-4 pt-2 pb-6">
      <h1 className={`px-1 ${TITRE_PAGE}`}>
        Mes <span className={TEXTE_CHAUD}>économies</span>
      </h1>

      <Verre className={`mt-5 ${VERRE_FUME} rounded-[28px] px-5 py-6 text-center`}>
        <p className="text-sm font-semibold text-creme/80">Tu as économisé</p>
        <p className="mt-1 font-titre text-[52px] leading-none font-black text-or text-shadow-[0_0_18px_rgba(255,190,90,0.5)]">
          {formaterEuros(total)}
        </p>
        <p className="mt-3 font-semibold">{libelleNombre(nombre)}</p>
        {abonnement ? (
          <p className="mt-1 text-sm text-creme/75">
            depuis le début de ton abonnement, le {formaterDate(abonnement.debut)}
          </p>
        ) : (
          <p className="mt-2 text-sm text-creme/85">
            Tu n'as pas d'abonnement en cours.{' '}
            <Link to="/abonnement" className="font-semibold text-abricot underline hover:text-creme">
              Je m'abonne
            </Link>
          </p>
        )}
      </Verre>

      <h2 className="mt-8 px-1 font-titre text-[22px] font-black">Historique</h2>

      {historique.length === 0 ? (
        <Verre className={`mt-3 ${VERRE_FUME} rounded-[24px] px-5 py-6 text-center`}>
          <p className="text-creme/85">Aucune offre utilisée pour l'instant.</p>
          <Link to="/catalogue" className={`mt-4 ${BOUTON_PRINCIPAL}`}>
            Voir les offres
          </Link>
        </Verre>
      ) : (
        <ul className="mt-3 grid gap-3">
          {historique.map((u) => (
            <li key={u.numero}>
              <Verre className={`${VERRE_FUME} flex items-start gap-3 rounded-[22px] px-4 py-3.5`}>
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-or/50 bg-or/10 text-or">
                  <Icon name="check" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold break-words">{u.commerce}</p>
                  <p className="text-[13.5px] leading-snug break-words text-creme/85">{u.titre}</p>
                  <p className="mt-1 text-xs text-creme/70">
                    {formaterDate(u.created_at)} à {formaterHeure(u.created_at)} ·{' '}
                    <span className="tabular-nums">{formaterNumero(u.numero)}</span>
                  </p>
                </div>
                <span className="shrink-0 font-titre text-lg font-black text-or">
                  <span className="sr-only">Économie : </span>−{formaterEuros(u.economie)}
                </span>
              </Verre>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
