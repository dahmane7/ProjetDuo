import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import MenusCarrousel from '../components/MenusCarrousel.jsx'
import PanneauLumineux from '../components/PanneauLumineux.jsx'
import { AVANTAGES, PRIX } from '../lib/abonnement.js'
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
      {/* Téléphone : titre puis carrousel. PC : premier écran sur toute la largeur,
          titre et appel à gauche, carrousel 3D en grand à droite */}
      <div className="lg:mx-auto lg:grid lg:min-h-[calc(100dvh-5rem)] lg:max-w-[1400px] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-8 lg:px-10">
        <div className="lg:pb-16">
          <h1 className={`px-5 pt-1 text-center lg:px-0 lg:text-left lg:text-[76px] lg:tracking-[-3px] ${TITRE_PAGE}`}>
            Un achat.
            <br />
            <span className={TEXTE_CHAUD}>À qui le deuxième ?</span>
          </h1>
          <p className="hidden max-w-[460px] text-[18px] leading-[1.5] text-creme/85 lg:mt-6 lg:block">
            Avec Twins, chaque achat se dédouble : le deuxième est{' '}
            <span className="font-semibold text-or">offert</span>, pour toi ou pour qui tu veux.
          </p>
          <div className="hidden gap-3 lg:mt-8 lg:flex">
            <Link to="/abonnement" className={`${BOUTON_PRINCIPAL} px-7`}>
              Je m'abonne
            </Link>
            <Link
              to="/catalogue"
              className="flex min-h-12 items-center justify-center rounded-[18px] border border-creme/30 bg-creme/10 px-7 text-[15px] font-extrabold text-creme hover:bg-creme/20"
            >
              Voir les offres
            </Link>
          </div>
        </div>

        <MenusCarrousel />
      </div>

      <div className="mx-auto mt-2 grid w-[min(420px,calc(100%-32px))] gap-4 lg:mt-0 lg:w-[min(1200px,calc(100%-80px))] lg:grid-cols-3 lg:items-start">
        <PanneauLumineux as="section" id="comment" aria-labelledby="titre-comment" className={PANNEAU}>
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
        </PanneauLumineux>

        <PanneauLumineux as="section" id="abonnement" aria-labelledby="titre-abonnement" className={PANNEAU}>
          <h2 id="titre-abonnement" className={TITRE_PANNEAU}>
            Ton abonnement
          </h2>
          <p className={TEXTE_PANNEAU}>
            Un seul paiement, et toutes les offres sont à toi pendant 12 mois. Nos membres
            économisent en moyenne <span className="font-semibold text-or">180 € par an</span>.
          </p>
          <ul className="mt-4 grid gap-2.5">
            {AVANTAGES.map((a) => (
              <li key={a} className="flex gap-2.5 text-[14.5px] leading-snug">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-or/50 bg-or/10 text-or">
                  <Icon name="check" className="size-3.5" />
                </span>
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <span className="font-titre text-[32px] font-black">{PRIX}</span>
            <span className="text-sm text-creme/80"> / an</span>
          </p>
          <Link to="/abonnement" className={`mt-3 ${BOUTON_PRINCIPAL}`}>
            Je m'abonne
          </Link>
        </PanneauLumineux>

        <PanneauLumineux as="section" id="commercants" aria-labelledby="titre-commercants" className={PANNEAU}>
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
        </PanneauLumineux>
      </div>
    </>
  )
}
