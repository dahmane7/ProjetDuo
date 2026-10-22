import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'

// Accueil du membre connecté (RG01). Abonnement et économies arrivent avec leurs stories.
const RACCOURCIS = [
  { to: '/catalogue', icone: 'search', titre: 'Trouver une offre', texte: 'Les offres valables près de chez vous.' },
  { to: '/#abonnement', icone: 'tag', titre: "M'abonner", texte: 'Accès à toutes les offres pendant 12 mois.' },
]

export default function AccueilMembre() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-10">
      <EnTeteEspace sousTitre="Votre espace membre Duo." />
      <ul className="mt-8 grid gap-3">
        {RACCOURCIS.map((r) => (
          <li key={r.to}>
            <Link
              to={r.to}
              className="flex items-center gap-3 rounded-lg border border-ligne p-4 hover:border-duo-600"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-duo-50 text-duo-600">
                <Icon name={r.icone} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{r.titre}</span>
                <span className="block text-sm text-encre-doux">{r.texte}</span>
              </span>
              <Icon name="chevron" className="ml-auto size-5 shrink-0 -rotate-90 text-encre-pale" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
