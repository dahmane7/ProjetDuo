import { Link } from 'react-router'
import { JOURS } from '../lib/categories.js'
import { initiales } from '../lib/exemples.js'
import Icon from './Icon.jsx'
import Photo from './Photo.jsx'

// Carte d'un établissement : visuel + badge, pastille logo, nom, lieu et jours de l'offre
export default function OutletCard({ to, offre, aujourdhui }) {
  const valable = offre.jours.includes(aujourdhui)
  const joursValables = new Intl.ListFormat('fr').format(
    JOURS.filter((j) => offre.jours.includes(j.iso)).map((j) => j.long),
  )

  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(28,29,38,0.08),0_6px_20px_rgba(28,29,38,0.06)] ring-1 ring-ligne"
    >
      <div className="relative h-40">
        <Photo
          id={offre.photo}
          nomCategorie={offre.categorie}
          largeur={720}
          hauteur={400}
          className="size-full transition-transform duration-300 group-hover:scale-[1.03]"
          iconeClassName="size-14"
        />
        <span className="absolute top-3 left-3 rounded-md bg-duo-600 px-2 py-1 text-xs font-bold text-white">
          1 acheté = 1 offert
        </span>
        {!valable && (
          <span className="absolute top-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-encre-doux">
            Pas aujourd'hui
          </span>
        )}
      </div>
      <div className="relative px-4 pt-8 pb-4">
        <span className="absolute -top-6 left-4 grid size-12 place-items-center rounded-full bg-white text-sm font-extrabold text-duo-600 shadow-md ring-2 ring-white">
          {initiales(offre.commerce)}
        </span>
        <h3 className="text-base font-bold group-hover:text-duo-600">{offre.commerce}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-encre-doux">
          <Icon name="pin" className="size-4 shrink-0" />
          {offre.categorie} · {offre.ville}
        </p>
        <p className="mt-3 text-sm">{offre.titre}</p>
        <div className="mt-3 flex items-center justify-between border-t border-ligne pt-3">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              valable ? 'text-valide' : 'text-encre-doux'
            }`}
          >
            <Icon name="calendar" className="size-4" />
            {valable ? "Valable aujourd'hui" : `Le ${joursValables}`}
          </span>
          <span className="text-xs font-bold text-duo-600">≈ {offre.economie} € économisés</span>
        </div>
      </div>
    </Link>
  )
}
