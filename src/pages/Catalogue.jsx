import { useEffect, useState } from 'react'
import CategoryChips from '../components/CategoryChips.jsx'
import Icon from '../components/Icon.jsx'
import InfoBanner from '../components/InfoBanner.jsx'
import OutletCard from '../components/OutletCard.jsx'
import Verre from '../components/Verre.jsx'
import { jourParis } from '../lib/categories.js'
import { chargerOffres, trierParProchainJour } from '../lib/offres.js'
import { BOUTON_PRINCIPAL, TEXTE_CHAUD, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'

export default function Catalogue() {
  const [categorie, setCategorie] = useState(null)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [aujourdhuiSeulement, setAujourdhuiSeulement] = useState(false)
  // Offres actives lues dans Supabase (US08) : null tant que le chargement n'est pas fini
  const [toutes, setToutes] = useState(null)
  const [erreur, setErreur] = useState(false)
  const aujourdhui = jourParis()

  useEffect(() => {
    let actif = true
    chargerOffres()
      .then((liste) => actif && setToutes(liste))
      .catch(() => actif && setErreur(true))
    return () => {
      actif = false
    }
  }, [])

  // Filtres combinés (RG05) ; valables aujourd'hui d'abord, puis par prochain jour valable
  const offres = trierParProchainJour(
    (toutes ?? []).filter(
      (o) =>
        (!categorie || o.categorie === categorie) &&
        (!aujourdhuiSeulement || o.jours.includes(aujourdhui)),
    ),
    aujourdhui,
  )
  const filtresActifs = Boolean(categorie) || aujourdhuiSeulement

  function reinitialiser() {
    setCategorie(null)
    setAujourdhuiSeulement(false)
  }

  return (
    <>
      <h1 className={`mx-auto max-w-6xl px-5 pt-1 ${TITRE_PAGE}`}>
        Les duos
        <br />
        <span className={TEXTE_CHAUD}>à saisir</span>
      </h1>

      <div className="mx-auto mt-1 max-w-6xl">
        <CategoryChips value={categorie} onChange={setCategorie} />
      </div>

      <InfoBanner>
        Le savais-tu ? Nos membres économisent en moyenne{' '}
        <span className="font-semibold text-or">180 € par an</span>. Rejoins-les et cumule les
        économies.
      </InfoBanner>

      {/* overflow-x-clip : le jumeau doré, décalé et penché, ne crée jamais de défilement horizontal */}
      <section className="mx-auto max-w-6xl overflow-x-clip px-4 pt-5">
        <div className="flex items-center justify-between">
          <p role="status" className="font-semibold text-creme/75">
            {toutes === null && !erreur
              ? 'Chargement des offres…'
              : `${offres.length} résultat${offres.length > 1 ? 's' : ''}`}
          </p>
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
            className="flex min-h-11 items-center gap-1 font-semibold text-abricot hover:text-creme"
          >
            Plus de filtres
            <Icon
              name="chevron"
              className={`size-5 transition-transform ${filtresOuverts ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {filtresOuverts && (
          <Verre
            as="label"
            className={`${VERRE_FUME} mt-3 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3`}
          >
            <span className="font-semibold">Valables aujourd'hui seulement</span>
            <input
              type="checkbox"
              checked={aujourdhuiSeulement}
              onChange={(e) => setAujourdhuiSeulement(e.target.checked)}
              className="size-5 shrink-0 accent-corail"
            />
          </Verre>
        )}

        {erreur ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-corail/40 bg-corail/10 px-4 py-3 font-semibold"
          >
            Le catalogue n'a pas pu être chargé. Réessaie dans un instant.
          </p>
        ) : toutes === null ? null : offres.length > 0 ? (
          // Une colonne sous 640 px ; gap-7 laisse la place au jumeau sous chaque carte.
          // Colonnes explicites (minmax 0) : un texte sur une ligne n'élargit jamais la carte
          <ul className="mt-5 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {offres.map((o) => (
              <li key={o.id} className="min-w-0">
                <OutletCard to={`/offres/${o.id}`} offre={o} aujourdhui={aujourdhui} />
              </li>
            ))}
          </ul>
        ) : (
          <Verre
            className={`${VERRE_FUME} mt-5 flex flex-col items-center rounded-[28px] px-6 py-10 text-center`}
          >
            <span className="grid size-16 place-items-center rounded-full border border-creme/25 bg-creme/10 text-abricot">
              <Icon name="search" className="size-8" />
            </span>
            <p className="mt-4 font-titre text-[24px] leading-tight font-black">Aucun résultat</p>
            <p className="mt-1.5 max-w-xs text-[14.5px] leading-[1.45] text-creme/75">
              {filtresActifs
                ? 'Aucune offre ne correspond à ces filtres. Retire-les pour voir toutes les offres.'
                : "Aucune offre n'est proposée pour le moment. Reviens bientôt !"}
            </p>
            {filtresActifs && (
              <button
                type="button"
                onClick={reinitialiser}
                className={`mt-6 w-full max-w-xs ${BOUTON_PRINCIPAL}`}
              >
                Retirer les filtres
              </button>
            )}
          </Verre>
        )}
      </section>
    </>
  )
}
