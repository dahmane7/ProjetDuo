import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { VERRE_FUME } from '../lib/styles.js'

// Accueil du membre connecté (RG01). Abonnement et économies arrivent avec leurs stories.
const RACCOURCIS = [
  { to: '/catalogue', icone: 'search', titre: 'Trouver une offre', texte: 'Les offres valables près de chez vous.' },
  { to: '/#abonnement', icone: 'tag', titre: "M'abonner", texte: 'Accès à toutes les offres pendant 12 mois.' },
]

export default function AccueilMembre() {
  return (
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <EnTeteEspace sousTitre="Votre espace membre Duo." />
        <ul className="mt-7 grid gap-3">
          {RACCOURCIS.map((r) => (
            <li key={r.to}>
              <Link
                to={r.to}
                className="flex items-center gap-3 rounded-[20px] border border-creme/15 bg-creme/5 p-4 hover:border-or/60 hover:bg-creme/10"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-creme/25 bg-creme/10 text-abricot">
                  <Icon name={r.icone} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-creme">{r.titre}</span>
                  <span className="block text-sm text-creme/80">{r.texte}</span>
                </span>
                <Icon name="chevron" className="ml-auto size-5 shrink-0 -rotate-90 text-creme/60" />
              </Link>
            </li>
          ))}
        </ul>
      </Verre>
    </section>
  )
}
