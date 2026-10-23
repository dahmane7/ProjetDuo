import { NavLink } from 'react-router'
import { onglets } from '../lib/navigation.js'
import { VERRE_FUME } from '../lib/styles.js'
import Icon from './Icon.jsx'
import Verre from './Verre.jsx'

// Barre d'onglets flottante en bas de l'écran : l'onglet actif porte une pastille dorée à halo.
// La marge basse suit la zone sûre de l'écran : la barre reste au-dessus de l'indicateur d'accueil des iPhone.
// Le verre est fumé : une photo claire qui passe dessous ne fait pas tomber les libellés sous le contraste AA.
// Sur PC (lg), la navigation passe dans l'en-tête : la barre est masquée.
export default function TabBar({ compte = '/connexion' }) {
  return (
    <Verre
      as="nav"
      aria-label="Navigation principale"
      className={`${VERRE_FUME} fixed inset-x-3 bottom-3 z-40 mx-auto mb-[env(safe-area-inset-bottom)] max-w-md rounded-[26px] p-1.5 lg:hidden`}
    >
      <ul className="grid grid-cols-4 gap-1">
        {onglets(compte).map((o) => (
          <li key={o.label} className="min-w-0">
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
