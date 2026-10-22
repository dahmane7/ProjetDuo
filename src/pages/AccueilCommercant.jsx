import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import Verre from '../components/Verre.jsx'
import { BOUTON_PRINCIPAL, VERRE_FUME } from '../lib/styles.js'
import { useCommerce } from '../lib/useCommerce.js'

// Accueil du commerçant connecté (RG01). La fiche existe forcément ici (FicheRequise).
// Offres et tableau de bord arrivent avec les stories suivantes du parcours commerçant.
export default function AccueilCommercant() {
  const { commerce } = useCommerce()

  return (
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <EnTeteEspace sousTitre="Votre espace commerçant Duo." />

        {commerce && (
          <article className="mt-7 overflow-hidden rounded-[20px] border border-creme/15 bg-creme/5">
            <Photo
              id={commerce.photo}
              nomCategorie={commerce.categorie}
              largeur={720}
              hauteur={320}
              className="h-36 w-full"
            />
            <div className="p-4">
              <p className="text-sm text-creme/80">{commerce.categorie}</p>
              <h2 className="font-titre text-xl font-black text-creme">{commerce.nom}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-creme/80">
                <Icon name="pin" className="size-4 shrink-0" />
                {commerce.adresse}, {commerce.ville}
              </p>
              {commerce.description && <p className="mt-3 text-[15px] text-creme">{commerce.description}</p>}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/commercant/fiche" className={BOUTON_PRINCIPAL}>
                  Modifier ma fiche
                </Link>
                <Link
                  to="/commercant/fiche#changer-code"
                  className="flex min-h-12 items-center justify-center rounded-[18px] border border-creme/40 px-4 py-3.5 text-center text-[15px] font-bold text-creme hover:border-creme"
                >
                  Changer mon code
                </Link>
              </div>
            </div>
          </article>
        )}

        <div className="mt-6 flex items-center gap-3 rounded-[20px] border border-creme/15 bg-creme/5 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-creme/25 bg-creme/10 text-abricot">
            <Icon name="calendar" className="size-5" />
          </span>
          <p className="text-sm text-creme/80">
            Bientôt ici : vos offres et leurs jours, et le suivi de leur utilisation.
          </p>
        </div>
      </Verre>
    </section>
  )
}
