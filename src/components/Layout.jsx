import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { accueilDuRole, useAuth } from '../lib/auth.js'
import { VERRE_FUME } from '../lib/styles.js'
import TabBar from './TabBar.jsx'
import Verre from './Verre.jsx'

export default function Layout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { session, profil, deconnexion } = useAuth()
  const connecte = Boolean(session)

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

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 px-5 pt-3">
        <Link
          to="/"
          aria-label="Duo, accueil"
          className="inline-flex min-h-11 items-center font-titre text-[30px] leading-none font-black tracking-[-1px]"
        >
          du<span className="text-or">o</span>
        </Link>

        {/* Connecté : la déconnexion reste accessible depuis toutes les pages */}
        {connecte && (
          <Verre
            as="button"
            type="button"
            onClick={seDeconnecter}
            className={`${VERRE_FUME} min-h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold text-creme hover:bg-nuit/75`}
          >
            Se déconnecter
          </Verre>
        )}
      </header>

      {/* pb-28 : la barre d'onglets flotte au-dessus du bas de page */}
      <main className="flex-1 pb-28">
        <Outlet />
      </main>

      {/* Onglet Compte : la connexion, ou l'espace du rôle une fois connecté (RG01) */}
      <TabBar compte={connecte ? accueilDuRole(profil?.role) : '/connexion'} />
    </div>
  )
}
