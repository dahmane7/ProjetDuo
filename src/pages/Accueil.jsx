import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import { AVANTAGES, PRIX } from '../lib/abonnement.js'
import { CATEGORIES } from '../lib/categories.js'
import { OFFRES_EXEMPLE, initiales } from '../lib/exemples.js'

// Chiffres de la maquette : à brancher sur les vraies données
const CHIFFRES = [
  { valeur: '180 €', label: 'économisés en moyenne par an' },
  { valeur: '40+', label: 'commerçants partenaires' },
  { valeur: '5', label: 'catégories' },
  { valeur: '7 j / 7', label: 'des offres chaque jour' },
]

const ETAPES = [
  { icone: 'tag', titre: 'Abonnez-vous', texte: 'Un seul paiement donne accès à toutes les offres pendant 12 mois.' },
  { icone: 'calendar', titre: "Choisissez l'offre du jour", texte: 'Chaque commerçant choisit les jours où son offre est valable.' },
  { icone: 'key', titre: 'Validez en caisse', texte: 'Saisissez le code à 4 chiffres du commerçant : le deuxième est offert.' },
]


// Petites cartes inclinées du haut de page, comme des offres posées sur la table
function CarteCollage({ offre, className }) {
  return (
    <div
      className={`absolute w-44 overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(28,29,38,0.18)] ${className}`}
    >
      <div className="relative h-24">
        <Photo
          id={offre.photo}
          nomCategorie={offre.categorie}
          largeur={360}
          hauteur={200}
          className="size-full"
          iconeClassName="size-8"
        />
        <span className="absolute top-2 left-2 rounded bg-duo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          1 acheté = 1 offert
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-encre-doux">{offre.categorie}</p>
        <p className="truncate text-xs font-bold">{offre.commerce}</p>
        <p className="mt-1 inline-block rounded bg-duo-50 px-1.5 py-0.5 text-[10px] font-semibold text-duo-700">
          ≈ {offre.economie} € économisés
        </p>
      </div>
    </div>
  )
}

export default function Accueil() {
  const [o1, o2, o3] = [OFFRES_EXEMPLE[4], OFFRES_EXEMPLE[0], OFFRES_EXEMPLE[7]]

  return (
    <>
      {/* Haut de page */}
      <section className="bg-[radial-gradient(120%_70%_at_100%_0%,var(--color-duo-100),transparent_60%),radial-gradient(90%_60%_at_0%_100%,#fff7e6,transparent_60%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pt-12 pb-10 md:grid-cols-2 md:pt-20">
          <div className="text-center md:text-left">
            <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight md:text-6xl">
              <span className="block whitespace-nowrap">1 acheté = 1 offert</span>
              chez les commerçants que vous aimez
            </h1>
            <p className="mx-auto mt-5 max-w-md text-encre-doux md:mx-0 md:text-lg">
              Restaurants, cafés, beauté, loisirs : profitez d'offres « 1 + 1 » près de chez
              vous, toute l'année.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:flex">
              <Link
                to="/catalogue"
                className="rounded-lg border border-encre/15 bg-white px-5 py-3.5 text-center font-semibold hover:border-encre/30"
              >
                Voir les offres
              </Link>
              <Link
                to="/#abonnement"
                className="rounded-lg bg-duo-600 px-5 py-3.5 text-center font-semibold text-white hover:bg-duo-700"
              >
                S'abonner
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-96 w-full max-w-sm" aria-hidden="true">
            <CarteCollage offre={o1} className="top-2 left-0 -rotate-6" />
            <CarteCollage offre={o2} className="top-12 right-0 rotate-3" />
            <CarteCollage offre={o3} className="bottom-0 left-10 -rotate-2" />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-12">
          <dl className="grid grid-cols-2 gap-y-6 rounded-2xl bg-white px-4 py-6 text-center shadow-[0_4px_24px_rgba(28,29,38,0.07)] md:grid-cols-4">
            {CHIFFRES.map((c) => (
              <div key={c.label}>
                <dt className="sr-only">{c.label}</dt>
                <dd className="text-[28px] font-extrabold tracking-tight">{c.valeur}</dd>
                <dd className="mx-auto max-w-[14ch] text-sm text-encre-doux">{c.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Commerçants partenaires */}
      <section className="mx-auto max-w-6xl px-5 py-14 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Vos adresses préférées sont déjà là
        </h2>
        <p className="mt-3 text-encre-doux">1 acheté = 1 offert chez des commerces comme ceux-ci.</p>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {OFFRES_EXEMPLE.map((o) => (
            <li
              key={o.id}
              className="flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-sm font-semibold ring-1 ring-ligne"
            >
              <span className="grid size-8 place-items-center rounded-full bg-duo-50 text-xs font-extrabold text-duo-600">
                {initiales(o.commerce)}
              </span>
              {o.commerce}
            </li>
          ))}
        </ul>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="scroll-mt-16 bg-fond">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Comment ça marche ?</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="flex flex-col items-center">
                <span className="grid size-12 place-items-center rounded-full bg-duo-600 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-bold">{e.titre}</h3>
                <p className="mt-2 max-w-xs text-encre-doux">{e.texte}</p>
              </li>
            ))}
          </ol>
          <Link
            to="/catalogue"
            className="mt-10 inline-block rounded-lg border border-encre/15 bg-white px-6 py-3 font-semibold hover:border-encre/30"
          >
            Voir les offres
          </Link>
        </div>
      </section>

      {/* Abonnement */}
      <section id="abonnement" className="scroll-mt-16 mx-auto max-w-6xl px-5 py-14">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Votre abonnement</h2>
          <p className="mx-auto mt-3 max-w-md text-encre-doux">
            Un seul paiement vous donne accès à toutes les offres pendant 12 mois.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(28,29,38,0.10)] ring-1 ring-ligne">
          <div className="bg-linear-to-br from-duo-600 to-duo-500 px-5 py-6 text-white">
            <p className="text-sm font-semibold text-duo-100">Duo · 12 mois</p>
            <p className="mt-1 text-lg font-bold">Économisez jusqu'à 180 € par an</p>
          </div>
          <ul className="grid gap-4 px-5 py-6">
            {AVANTAGES.map((a) => (
              <li key={a} className="flex gap-3 text-[15px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-duo-50 text-duo-600">
                  <Icon name="check" className="size-4" />
                </span>
                {a}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-4 border-t border-ligne px-5 py-5">
            <p>
              <span className="text-3xl font-extrabold">{PRIX}</span>
              <span className="text-sm text-encre-doux"> / an</span>
            </p>
            <Link
              to="/abonnement"
              className="flex-1 rounded-lg bg-duo-600 py-3.5 text-center font-semibold text-white hover:bg-duo-700"
            >
              S'abonner
            </Link>
          </div>
        </div>
      </section>

      {/* Ce que couvre l'abonnement */}
      <section className="bg-fond">
        <div className="mx-auto max-w-6xl py-14">
          <div className="px-5 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Ce que couvre votre abonnement
            </h2>
            <p className="mt-3 text-encre-doux">Cinq univers, toujours en 1 acheté = 1 offert.</p>
          </div>
          <ul className="defile mt-8 flex gap-4 px-5 pb-2 md:grid md:grid-cols-5">
            {CATEGORIES.map((c) => (
              <li
                key={c.nom}
                className="w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-white ring-1 ring-ligne md:w-auto"
              >
                <div className="p-4">
                  <h3 className="font-bold">{c.nom}</h3>
                  <p className="mt-1 text-sm text-encre-doux">{c.accroche}</p>
                </div>
                <Photo
                  id={c.photo}
                  nomCategorie={c.nom}
                  largeur={560}
                  hauteur={320}
                  className="h-40 w-full"
                />
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link
              to="/catalogue"
              className="inline-block rounded-lg border border-encre/15 bg-white px-6 py-3 font-semibold hover:border-encre/30"
            >
              Voir toutes les offres
            </Link>
          </div>
        </div>
      </section>

      {/* Commerçants */}
      <section id="commercants" className="scroll-mt-16 mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-2xl bg-encre px-6 py-10 text-white md:flex md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Vous êtes commerçant ?
            </h2>
            <p className="mt-2 max-w-md text-white/70">
              Créez vos offres, choisissez leurs jours et suivez leur utilisation depuis votre
              tableau de bord.
            </p>
          </div>
          <Link
            to="/connexion"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-encre hover:bg-duo-50 md:mt-0"
          >
            Devenir partenaire
          </Link>
        </div>
      </section>
    </>
  )
}
