import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { accueilDuRole, useAuth } from '../lib/auth.js'
import { onglets } from '../lib/navigation.js'
import { BOUTON_PRINCIPAL, VERRE_FUME } from '../lib/styles.js'
import TabBar from './TabBar.jsx'
import Verre from './Verre.jsx'

// Accueils connectés : leur bandeau porte déjà « Se déconnecter », on n'en double pas le bouton du haut
const ESPACES = ['/membre', '/commercant']

export default function Layout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { session, profil, deconnexion } = useAuth()
  const connecte = Boolean(session)
  // Un seul bouton « Se déconnecter » par écran ; le « / » final éventuel ne compte pas
  const dansUnEspace = ESPACES.includes(pathname.replace(/\/$/, ''))

  // Déconnexion : retour au catalogue public, avant de fermer la session
  // (sinon une page protégée redirige d'abord vers /connexion)
  async function seDeconnecter() {
    navigate('/catalogue', { replace: true })
    await deconnexion()
  }

  // Descend jusqu'à l'ancre (#abonnement…) ou remonte en haut à chaque navigation
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  // Onglet Compte : la connexion, ou l'espace du rôle une fois connecté (RG01)
  const compte = connecte ? accueilDuRole(profil?.role) : '/connexion'

  return (
    <div className="flex min-h-dvh flex-col">
      {/* PC : trois colonnes, la navigation au centre exact quelle que soit la largeur du logo et du bouton */}
      <header className="flex items-center justify-between gap-3 px-5 pt-3 lg:mx-auto lg:grid lg:w-full lg:max-w-[1400px] lg:grid-cols-[1fr_auto_1fr] lg:px-10 lg:pt-5">
        <Link
          to="/"
          aria-label="Twins, accueil"
          // Au clic, le logo s'allume : on relance l'animation `allumage` (index.css) même sur un deuxième clic
          onClick={(e) => {
            const logo = e.currentTarget
            logo.classList.remove('allume')
            void logo.offsetWidth
            logo.classList.add('allume')
          }}
          onAnimationEnd={(e) => e.currentTarget.classList.remove('allume')}
          className="logo-lumineux inline-flex min-h-11 items-center font-titre text-[30px] leading-none font-black tracking-[-1px] lg:justify-self-start lg:text-[34px]"
        >
          twin<span className="text-or">s</span>
        </Link>

        {/* PC : la navigation passe dans l'en-tête, la barre d'onglets du bas est masquée */}
        <Verre as="nav" aria-label="Navigation principale" className={`${VERRE_FUME} hidden rounded-full p-1 lg:block`}>
          <ul className="flex items-center gap-1">
            {onglets(compte).map((o) => (
              <li key={o.label}>
                <NavLink
                  to={o.to}
                  end={o.end}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center rounded-full px-5 text-[15px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-linear-to-br from-or to-corail text-nuit'
                        : 'text-creme/80 hover:bg-creme/10 hover:text-creme'
                    }`
                  }
                >
                  {o.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </Verre>

        <div className="flex items-center gap-3 lg:justify-self-end">
          {!connecte && (
            <div className="hidden lg:block">
              <Link to="/abonnement" className={`${BOUTON_PRINCIPAL} min-h-11 px-6`}>
                Je m'abonne
              </Link>
            </div>
          )}

          {/* Connecté : la déconnexion reste accessible depuis toutes les pages,
              sauf dans les espaces membre et commerçant, où le bandeau a la sienne */}
          {connecte && !dansUnEspace && (
            <Verre
              as="button"
              type="button"
              onClick={seDeconnecter}
              className={`${VERRE_FUME} min-h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold text-creme hover:bg-nuit/75`}
            >
              Se déconnecter
            </Verre>
          )}
        </div>
      </header>

      {/* pb-28 : la barre d'onglets flotte au-dessus du bas de page (téléphone seulement) */}
      <main className="flex-1 pb-28 lg:pb-16">
        <Outlet />
      </main>

      <TabBar compte={compte} />
    </div>
  )
}
