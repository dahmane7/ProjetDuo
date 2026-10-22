import { Link } from 'react-router'
import { JOURS } from '../lib/categories.js'
import { VERRE_FUME } from '../lib/styles.js'
import Icon from './Icon.jsx'
import Photo from './Photo.jsx'

// Carte d'une offre et son jumeau doré : derrière la carte flotte son double en pointillés,
// le deuxième, celui qui est offert. Sur la carte : photo, commerce, lieu, offre, jours, économie.
// La marge droite laisse la place au jumeau, décalé vers la droite et le bas.
export default function OutletCard({ to, offre, aujourdhui }) {
  const valable = offre.jours.includes(aujourdhui)
  const joursValables = new Intl.ListFormat('fr').format(
    JOURS.filter((j) => offre.jours.includes(j.iso)).map((j) => j.long),
  )

  return (
    <div className="relative mr-3">
      {/* Jumeau décoratif ; délai négatif : les jumeaux ne flottent pas tous en même temps */}
      <div
        aria-hidden="true"
        style={{ animationDelay: `-${(offre.id % 4) * 0.8}s` }}
        className="absolute inset-0 translate-x-[10px] translate-y-[10px] rotate-[2.5deg] animate-flotte rounded-[22px] border-[1.5px] border-dashed border-or/90 bg-linear-to-br from-or/25 to-corail/15 shadow-[0_0_22px_rgba(255,190,90,0.4)] motion-reduce:animate-none"
      >
        <span className="absolute right-2.5 -bottom-[9px] rounded-full bg-linear-to-r from-[#ffe2a6] to-[#ffb35c] px-2 py-[3px] text-[9.5px] font-black tracking-[1px] text-prune">
          OFFERT
        </span>
      </div>

      <Link
        to={to}
        className={`verre ${VERRE_FUME} group relative flex min-h-32 overflow-hidden rounded-[22px]`}
      >
        <div className="relative w-28 shrink-0 overflow-hidden">
          <Photo
            id={offre.photo}
            nomCategorie={offre.categorie}
            largeur={240}
            hauteur={300}
            className="absolute inset-0 size-full transition-transform duration-300 group-hover:scale-[1.04]"
            iconeClassName="size-10"
          />
          {!valable && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-nuit/80 px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-creme">
              Pas aujourd'hui
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col px-3.5 py-3">
          <h3 className="font-titre text-[17px] leading-tight font-bold">{offre.commerce}</h3>
          <p className="mt-0.5 flex items-start gap-1 text-[12.5px] leading-snug text-creme/75">
            <Icon name="pin" className="mt-px size-3.5 shrink-0" />
            <span className="min-w-0 break-words">
              {offre.categorie} · {offre.ville}
            </span>
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug text-creme/90">{offre.titre}</p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                valable ? 'text-emerald-300' : 'text-creme/75'
              }`}
            >
              <Icon name="calendar" className="size-3.5 shrink-0" />
              {valable ? "Valable aujourd'hui" : `Le ${joursValables}`}
            </span>
            <span className="shrink-0 font-titre text-lg leading-none font-black text-or text-shadow-[0_0_14px_rgba(255,190,90,0.55)]">
              <span className="sr-only">Économie : </span>−{offre.economie} €
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
