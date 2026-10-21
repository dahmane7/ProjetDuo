import { Link } from 'react-router'
import MenusCarrousel from '../components/MenusCarrousel.jsx'
import Verre from '../components/Verre.jsx'
import { BOUTON_PRINCIPAL, TEXTE_CHAUD, TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'

// Les trois pas du parcours ; la partie offerte du dernier pas est en or
const PAS = [
  { texte: 'Tu choisis une offre' },
  { texte: 'Tu la montres en caisse' },
  { texte: 'Le commerçant tape son code : ', offert: 'le deuxième est offert' },
]

// Panneaux sous le carrousel : verre fumé, même largeur que le panneau du carrousel.
// scroll-mt : l'ancre (#comment…) s'arrête un peu sous le haut de l'écran
const PANNEAU = `${VERRE_FUME} scroll-mt-6 rounded-[28px] px-5 pt-5 pb-6`
const TITRE_PANNEAU = 'font-titre text-[26px] leading-[1.02] font-black tracking-[-0.8px]'
const TEXTE_PANNEAU = 'mt-2 text-[14.5px] leading-[1.45] text-creme/85'

export default function Accueil() {
  return (
    <>
      <h1 className={`px-5 pt-1 text-center ${TITRE_PAGE}`}>
        Un achat.
        <br />
        <span className={TEXTE_CHAUD}>À qui le deuxième ?</span>
      </h1>

      <MenusCarrousel />

      <div className="mx-auto mt-2 grid w-[min(420px,calc(100%-32px))] gap-4">
        <Verre as="section" id="comment" aria-labelledby="titre-comment" className={PANNEAU}>
          <h2 id="titre-comment" className={TITRE_PANNEAU}>
            Comment ça marche ?
          </h2>
          <ol className="mt-4 grid gap-3.5">
            {PAS.map((p, i) => (
              <li key={p.texte} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-creme/25 bg-creme/10 font-titre text-[17px] font-black"
                >
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[15px] leading-snug">
                  {p.texte}
                  {p.offert && <span className="font-semibold text-or">{p.offert}</span>}
                </p>
              </li>
            ))}
          </ol>
        </Verre>

        <Verre as="section" id="abonnement" aria-labelledby="titre-abonnement" className={PANNEAU}>
          <h2 id="titre-abonnement" className={TITRE_PANNEAU}>
            Ton abonnement
          </h2>
          <p className={TEXTE_PANNEAU}>
            Un seul paiement, et toutes les offres sont à toi pendant 12 mois. Nos membres
            économisent en moyenne <span className="font-semibold text-or">180 € par an</span>.
          </p>
          <Link to="/connexion" className={`mt-5 ${BOUTON_PRINCIPAL}`}>
            Je m'abonne
          </Link>
        </Verre>

        <Verre as="section" id="commercants" aria-labelledby="titre-commercants" className={PANNEAU}>
          <h2 id="titre-commercants" className={TITRE_PANNEAU}>
            Tu es commerçant ?
          </h2>
          <p className={TEXTE_PANNEAU}>
            Crée tes offres, choisis leurs jours et suis leur utilisation depuis ton tableau de
            bord.
          </p>
          <Link
            to="/connexion"
            className="mt-5 flex min-h-12 items-center justify-center rounded-[18px] border border-creme/30 bg-creme/10 px-4 py-3.5 text-[15px] font-extrabold text-creme hover:bg-creme/20"
          >
            Je suis commerçant
          </Link>
        </Verre>
      </div>
    </>
  )
}
