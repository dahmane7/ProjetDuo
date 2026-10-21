import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import TabBar from './TabBar.jsx'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Descend jusqu'à l'ancre (#abonnement…) ou remonte en haut à chaque navigation
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pt-3">
        <Link
          to="/"
          aria-label="Duo, accueil"
          className="inline-flex min-h-11 items-center font-titre text-[30px] leading-none font-black tracking-[-1px]"
        >
          du<span className="text-or">o</span>
        </Link>
      </header>

      {/* pb-28 : la barre d'onglets flotte au-dessus du bas de page */}
      <main className="flex-1 pb-28">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
