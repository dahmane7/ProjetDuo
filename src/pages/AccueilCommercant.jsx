import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import { useCommerce } from '../lib/useCommerce.js'

// Accueil du commerçant connecté (RG01). La fiche existe forcément ici (FicheRequise).
// Offres et tableau de bord arrivent avec les stories suivantes du parcours commerçant.
export default function AccueilCommercant() {
  const { commerce } = useCommerce()

  return (
    <section className="mx-auto max-w-2xl px-5 py-10">
      <EnTeteEspace sousTitre="Votre espace commerçant Duo." />

      {commerce && (
        <article className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-ligne">
          <Photo
            id={commerce.photo}
            nomCategorie={commerce.categorie}
            largeur={720}
            hauteur={320}
            className="h-36 w-full"
          />
          <div className="p-4">
            <p className="text-sm text-encre-doux">{commerce.categorie}</p>
            <h2 className="text-lg font-extrabold">{commerce.nom}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-encre-doux">
              <Icon name="pin" className="size-4 shrink-0" />
              {commerce.adresse}, {commerce.ville}
            </p>
            {commerce.description && <p className="mt-3 text-[15px]">{commerce.description}</p>}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/commercant/fiche"
                className="rounded-lg bg-duo-600 py-3 text-center text-sm font-semibold text-white hover:bg-duo-700"
              >
                Modifier ma fiche
              </Link>
              <Link
                to="/commercant/fiche#changer-code"
                className="rounded-lg border border-ligne py-3 text-center text-sm font-semibold hover:border-duo-600 hover:text-duo-600"
              >
                Changer mon code
              </Link>
            </div>
          </div>
        </article>
      )}

      <div className="mt-6 flex items-center gap-3 rounded-lg bg-fond p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-duo-600">
          <Icon name="calendar" className="size-5" />
        </span>
        <p className="text-sm text-encre-doux">
          Bientôt ici : vos offres et leurs jours, et le suivi de leur utilisation.
        </p>
      </div>
    </section>
  )
}
