import { Link } from 'react-router'
import Verre from '../components/Verre.jsx'
import { BOUTON_PRINCIPAL, TEXTE_CHAUD, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'

// Page affichée pour toute adresse inconnue (route « * » de App.jsx)
export default function PageIntrouvable() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-md items-center px-4">
      <Verre className={`w-full rounded-[28px] px-6 py-10 text-center ${VERRE_FUME}`}>
        <h1 className={TITRE_PAGE}>
          Cette tasse cherche <span className={TEXTE_CHAUD}>son double</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-[1.45] text-creme/85">
          Cette page n'existe pas encore ou le lien est incomplet.
        </p>
        <Link to="/" className={`mt-6 ${BOUTON_PRINCIPAL}`}>
          Revenir à l'accueil
        </Link>
      </Verre>
    </section>
  )
}
