import { NavLink } from 'react-router'
import Icon from './Icon.jsx'
import Verre from './Verre.jsx'

const ONGLETS = [
  { to: '/', label: 'Accueil', icone: 'home', end: true },
  { to: '/catalogue', label: 'Offres', icone: 'tag' },
  { to: '/economies', label: 'Économies', icone: 'piggy' },
  { to: '/connexion', label: 'Compte', icone: 'user' },
]

// Barre d'onglets flottante en bas de l'écran : l'onglet actif porte une pastille dorée à halo.
// La marge basse suit la zone sûre de l'écran : la barre reste au-dessus de l'indicateur d'accueil des iPhone.
export default function TabBar() {
  return (
    <Verre
      as="nav"
      aria-label="Navigation principale"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto mb-[env(safe-area-inset-bottom)] max-w-md rounded-[26px] p-1.5"
    >
      <ul className="grid grid-cols-4 gap-1">
        {ONGLETS.map((o) => (
          <li key={o.to} className="min-w-0">
            <NavLink
              to={o.to}
              end={o.end}
              className={({ isActive }) =>
                `flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-linear-to-br from-or to-corail text-nuit shadow-[0_6px_22px_rgba(255,178,110,0.55)]'
                    : 'text-creme/75 hover:bg-creme/10 hover:text-creme'
                }`
              }
            >
              <Icon name={o.icone} className="size-[22px]" />
              <span className="truncate">{o.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </Verre>
  )
}
