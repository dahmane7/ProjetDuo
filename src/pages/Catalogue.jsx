import { useState } from 'react'
import CategoryChips from '../components/CategoryChips.jsx'
import Icon from '../components/Icon.jsx'
import InfoBanner from '../components/InfoBanner.jsx'
import OutletCard from '../components/OutletCard.jsx'
import { jourParis } from '../lib/categories.js'
import { OFFRES_EXEMPLE } from '../lib/exemples.js'

export default function Catalogue() {
  const [categorie, setCategorie] = useState(null)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [aujourdhuiSeulement, setAujourdhuiSeulement] = useState(false)
  const aujourdhui = jourParis()

  // Offres valables aujourd'hui en premier
  const offres = OFFRES_EXEMPLE.filter(
    (o) =>
      (!categorie || o.categorie === categorie) &&
      (!aujourdhuiSeulement || o.jours.includes(aujourdhui)),
  ).sort((a, b) => Number(b.jours.includes(aujourdhui)) - Number(a.jours.includes(aujourdhui)))

  function reinitialiser() {
    setCategorie(null)
    setAujourdhuiSeulement(false)
  }

  return (
    <>
      <div className="border-b border-ligne">
        <div className="mx-auto max-w-6xl">
          <CategoryChips value={categorie} onChange={setCategorie} />
        </div>
      </div>

      <InfoBanner>
        Le saviez-vous ? Nos membres économisent en moyenne 180 € par an. Rejoignez-les et
        commencez à cumuler les économies.
      </InfoBanner>

      <section className="mx-auto max-w-6xl px-5 pt-6 pb-14">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-encre-doux">
            {offres.length} résultat{offres.length > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
            className="flex items-center gap-1 font-semibold text-duo-600"
          >
            Plus de filtres
            <Icon
              name="chevron"
              className={`size-5 transition-transform ${filtresOuverts ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {filtresOuverts && (
          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-fond px-4 py-3.5">
            <span className="font-semibold">Valables aujourd'hui seulement</span>
            <input
              type="checkbox"
              checked={aujourdhuiSeulement}
              onChange={(e) => setAujourdhuiSeulement(e.target.checked)}
              className="size-5 accent-duo-600"
            />
          </label>
        )}

        {offres.length > 0 ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offres.map((o) => (
              <li key={o.id}>
                <OutletCard to={`/offres/${o.id}`} offre={o} aujourdhui={aujourdhui} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-duo-50 text-duo-600">
              <Icon name="search" className="size-9" />
            </span>
            <p className="mt-5 text-lg font-bold">Aucun résultat</p>
            <p className="mt-1 max-w-xs text-encre-doux">
              Aucune offre ne correspond à ces critères. Essayez une autre catégorie.
            </p>
            <button
              type="button"
              onClick={reinitialiser}
              className="mt-6 rounded-lg bg-duo-600 px-5 py-3 font-semibold text-white hover:bg-duo-700"
            >
              Voir toutes les offres
            </button>
          </div>
        )}
      </section>
    </>
  )
}
