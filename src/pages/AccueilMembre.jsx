import { Link } from 'react-router'
import EnTeteEspace from '../components/EnTeteEspace.jsx'
import Icon from '../components/Icon.jsx'
import Verre from '../components/Verre.jsx'
import { formaterDate } from '../lib/abonnement.js'
import { BOUTON_PRINCIPAL, VERRE_FUME } from '../lib/styles.js'
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
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <EnTeteEspace sousTitre="Votre espace membre Twins." />

        {!chargement &&
          (actif ? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3.5 py-2 text-sm font-bold text-emerald-200">
              <Icon name="check" className="size-4" />
              Abonné jusqu'au {formaterDate(abonnement.fin)}
            </p>
          ) : (
            <div className="mt-6 rounded-[20px] border border-or/40 bg-or/10 p-4">
              <p className="font-bold text-creme">Vous n'êtes pas encore abonné</p>
              <p className="mt-1 text-sm text-creme/80">
                Abonnez-vous pour profiter des offres 1 acheté = 1 offert pendant 12 mois.
              </p>
              <Link to="/abonnement" className={`mt-4 ${BOUTON_PRINCIPAL}`}>
                Je m'abonne
              </Link>
            </div>
          ))}

        <ul className="mt-7 grid gap-3">
          {raccourcis.map((r) => (
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
