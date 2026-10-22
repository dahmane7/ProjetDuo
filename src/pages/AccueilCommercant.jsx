import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { VERRE_FUME } from '../lib/styles.js'

// Accueil du commerçant connecté (RG01). Fiche, offres et tableau de bord arrivent
// avec les stories du parcours commerçant.
export default function AccueilCommercant() {
  return (
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <EnTeteEspace sousTitre="Votre espace commerçant Duo." />
        <div className="mt-7 flex items-center gap-3 rounded-[20px] border border-creme/15 bg-creme/5 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-creme/25 bg-creme/10 text-abricot">
            <Icon name="calendar" className="size-5" />
          </span>
          <p className="text-sm text-creme/80">
            Bientôt ici : votre fiche, vos offres et leurs jours, et le suivi de leur utilisation.
          </p>
        </div>
      </Verre>
    </section>
  )
}
