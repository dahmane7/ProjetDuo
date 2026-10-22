import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import { formaterDate } from '../lib/abonnement.js'
import { useAbonnement } from '../lib/useAbonnement.js'

// Accueil du membre connecté (RG01) : état de l'abonnement (US04) et raccourcis
const RACCOURCIS = [
  { to: '/catalogue', icone: 'search', titre: 'Trouver une offre', texte: 'Les offres valables près de chez vous.' },
  { to: '/abonnement', icone: 'tag', titre: "M'abonner", texte: 'Accès à toutes les offres pendant 12 mois.', siNonAbonne: true },
]

export default function AccueilMembre() {
  const { abonnement, actif, chargement } = useAbonnement()
  const raccourcis = RACCOURCIS.filter((r) => !(r.siNonAbonne && actif))

  return (
    <section className="mx-auto max-w-2xl px-5 py-10">
      <EnTeteEspace sousTitre="Votre espace membre Duo." />

      {!chargement &&
        (actif ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-valide/10 px-3.5 py-2 text-sm font-bold text-valide">
            <Icon name="check" className="size-4" />
            Abonné jusqu'au {formaterDate(abonnement.fin)}
          </p>
        ) : (
          <div className="mt-6 rounded-xl bg-duo-50 p-4">
            <p className="font-bold text-duo-700">Vous n'êtes pas encore abonné</p>
            <p className="mt-1 text-sm text-encre-doux">
              Abonnez-vous pour profiter des offres 1 acheté = 1 offert pendant 12 mois.
            </p>
            <Link
              to="/abonnement"
              className="mt-3 inline-block rounded-lg bg-duo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-duo-700"
            >
              Je m'abonne
            </Link>
          </div>
        ))}

      <ul className="mt-8 grid gap-3">
        {raccourcis.map((r) => (
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
