import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'

// Accueil du commerçant connecté (RG01). Fiche, offres et tableau de bord arrivent
// avec les stories du parcours commerçant.
export default function AccueilCommercant() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-10">
      <EnTeteEspace sousTitre="Votre espace commerçant Duo." />
      <div className="mt-8 flex items-center gap-3 rounded-lg bg-fond p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-duo-600">
          <Icon name="calendar" className="size-5" />
        </span>
        <p className="text-sm text-encre-doux">
          Bientôt ici : votre fiche, vos offres et leurs jours, et le suivi de leur utilisation.
        </p>
      </div>
    </section>
  )
}
