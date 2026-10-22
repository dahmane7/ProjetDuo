import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Alerte from '../components/Alerte.jsx'
import GraphiqueJours from '../components/GraphiqueJours.jsx'
import Verre from '../components/Verre.jsx'
import { TITRE_PAGE, VERRE_FUME } from '../lib/styles.js'
import { chargerTableauDeBord, formaterDateHeure, formaterNumero } from '../lib/tableauDeBord.js'

const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`

function Section({ titre, children }) {
  return (
    <section className="mt-8">
      <h2 className="font-titre text-xl font-black text-creme">{titre}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Vide({ children }) {
  return (
    <p className="rounded-[20px] border border-creme/15 bg-creme/5 p-4 text-sm text-creme/80">{children}</p>
  )
}

// /commercant/tableau-de-bord : quand mes offres sont utilisées, sur les 30 derniers jours (US07)
export default function TableauDeBord() {
  const [tableau, setTableau] = useState(null)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    let actif = true
    chargerTableauDeBord()
      .then((t) => actif && setTableau(t))
      .catch(() => actif && setErreur(true))
    return () => {
      actif = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-2xl px-4 pt-2">
      <Verre className={`${VERRE_FUME} rounded-[28px] px-5 py-7`}>
        <Link
          to="/commercant"
          className="text-sm font-semibold text-abricot underline decoration-abricot/50 underline-offset-4 hover:text-creme"
        >
          ← Mon espace
        </Link>
        <h1 className={`mt-3 ${TITRE_PAGE}`}>Tableau de bord</h1>
        <p className="mt-2 text-creme/80">Quand vos offres sont utilisées, sur les 30 derniers jours.</p>

        {erreur && (
          <div className="mt-6">
            <Alerte>Le tableau de bord n'a pas pu être chargé. Réessayez dans un instant.</Alerte>
          </div>
        )}
        {!tableau && !erreur && <p className="mt-6 text-creme/75">Chargement…</p>}

        {tableau && (
          <>
            <div className="mt-6 rounded-[20px] border border-creme/15 bg-creme/5 p-5">
              <p className="font-titre text-5xl leading-none font-black text-or">{tableau.total}</p>
              <p className="mt-2 text-creme">
                {tableau.total > 1 ? 'utilisations' : 'utilisation'} sur les 30 derniers jours
              </p>
            </div>

            <Section titre="Par offre">
              {tableau.parOffre.length === 0 ? (
                <Vide>
                  Vous n'avez pas encore d'offre. <Link to="/commercant/offres/nouvelle" className="font-semibold text-abricot underline">Créez-en une</Link>.
                </Vide>
              ) : (
                <ul className="grid gap-2.5">
                  {tableau.parOffre.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between gap-3 rounded-[16px] border border-creme/15 bg-creme/5 px-4 py-3"
                    >
                      <span className="min-w-0 text-[15px] font-semibold break-words text-creme">
                        {o.titre}
                        {!o.active && <span className="ml-2 text-xs font-medium text-creme/75">(désactivée)</span>}
                      </span>
                      <span className="shrink-0 font-titre text-xl font-black text-or">
                        <span className="sr-only">{pluriel(o.utilisations, 'utilisation', 'utilisations')}</span>
                        <span aria-hidden="true">{o.utilisations}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section titre="Par jour de la semaine">
              {tableau.total === 0 ? (
                <Vide>Aucune utilisation sur les 30 derniers jours : le graphique apparaît dès la première.</Vide>
              ) : (
                <>
                  <GraphiqueJours jours={tableau.parJour} />
                  <p className="mt-3 text-sm text-creme/75">
                    Les jours les plus utilisés sont en doré : ce sont ceux à garder pour vos offres.
                  </p>
                </>
              )}
            </Section>

            <Section titre="Dernières utilisations">
              {tableau.dernieres.length === 0 ? (
                <Vide>
                  Aucune utilisation pour l'instant. Elles apparaissent ici dès qu'un membre valide une offre en
                  caisse.
                </Vide>
              ) : (
                <ul className="grid gap-2.5">
                  {tableau.dernieres.map((u) => {
                    const { date, heure } = formaterDateHeure(u.quand)
                    return (
                      <li
                        key={u.numero}
                        className="grid grid-cols-[1fr_auto] items-start gap-x-3 rounded-[16px] border border-creme/15 bg-creme/5 px-4 py-3"
                      >
                        <p className="text-[13px] font-semibold text-creme/80">
                          {date} · {heure}
                        </p>
                        <p className="text-[13px] font-bold text-or">{formaterNumero(u.numero)}</p>
                        <p className="col-span-2 mt-0.5 text-[15px] break-words text-creme">{u.titre}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Section>
          </>
        )}
      </Verre>
    </section>
  )
}
