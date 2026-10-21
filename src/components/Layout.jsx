import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { accueilDuRole, useAuth } from '../lib/auth.js'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

const LIENS = [
  { to: '/catalogue', label: 'Les offres' },
  { to: '/#abonnement', label: 'Abonnement' },
  { to: '/#commercants', label: 'Pour les commerçants' },
]

const PIED = [
  {
    titre: 'Duo',
    liens: [
      { to: '/#abonnement', label: 'Abonnement' },
      { to: '/catalogue', label: 'Toutes les offres' },
      { to: '/#comment', label: 'Comment ça marche' },
    ],
  },
  {
    titre: 'Commerçants',
    liens: [
      { to: '/#commercants', label: 'Devenir partenaire' },
      { to: '/connexion', label: 'Espace commerçant' },
    ],
  },
]

const ANNEE = new Date().getFullYear()

export default function Layout() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { session, profil, deconnexion } = useAuth()
  const connecte = Boolean(session)

  // Déconnexion : retour au catalogue public
  async function seDeconnecter() {
    await deconnexion()
    navigate('/catalogue', { replace: true })
  }

  // Descend jusqu'à l'ancre (#abonnement…) ou remonte en haut à chaque navigation
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-ligne bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="Duo, accueil" className="text-[28px]">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {LIENS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="text-[15px] font-semibold text-encre hover:text-duo-600"
              >
                {l.label}
              </NavLink>
            ))}
            {connecte && (
              <button
                type="button"
                onClick={seDeconnecter}
                className="text-[15px] font-semibold text-encre hover:text-duo-600"
              >
                Se déconnecter
              </button>
            )}
            <Link
              to={connecte ? accueilDuRole(profil?.role) : '/connexion'}
              className="rounded-lg bg-duo-600 px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-duo-700"
            >
              {connecte ? 'Mon espace' : 'Se connecter'}
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/catalogue"
              className="grid size-11 place-items-center"
              aria-label="Chercher une offre"
            >
              <Icon name="search" className="size-6" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOuvert((o) => !o)}
              className="grid size-11 place-items-center"
              aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOuvert}
            >
              <Icon name={menuOuvert ? 'close' : 'menu'} className="size-6" />
            </button>
          </div>
        </div>

        {menuOuvert && (
          <nav
            onClick={() => setMenuOuvert(false)}
            className="absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-white px-5 pt-2 md:hidden">
            {LIENS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block border-b border-ligne py-4 text-lg font-semibold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={connecte ? accueilDuRole(profil?.role) : '/connexion'}
              className="mt-6 block rounded-lg bg-duo-600 py-3.5 text-center font-semibold text-white"
            >
              {connecte ? 'Mon espace' : 'Se connecter'}
            </Link>
            {connecte && (
              <button
                type="button"
                onClick={seDeconnecter}
                className="mt-3 block w-full rounded-lg border border-ligne py-3.5 text-center font-semibold"
              >
                Se déconnecter
              </button>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-fond">
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-8">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link to="/" aria-label="Duo, accueil" className="text-[28px]">
                <Logo />
              </Link>
              <p className="mt-3 max-w-xs text-sm text-encre-doux">
                L'abonnement 1 acheté = 1 offert chez les commerçants de votre quartier.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:contents">
              {PIED.map((col) => (
                <div key={col.titre}>
                  <h2 className="text-[15px] font-bold">{col.titre}</h2>
                  <ul className="mt-3 grid gap-2.5">
                    {col.liens.map((l) => (
                      <li key={l.label}>
                        <Link to={l.to} className="text-sm text-encre-doux hover:text-duo-600">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 border-t border-ligne pt-6 text-xs text-encre-pale">
            © {ANNEE} Duo. Projet réalisé pendant le hackathon.
          </p>
        </div>
      </footer>
    </div>
  )
}
