import { hauteurBarre } from '../lib/tableauDeBord.js'

// Graphique en barres des utilisations par jour de la semaine, du lundi au dimanche (US07).
// jours : [{ iso, long, utilisations }] dans l'ordre de la semaine. Sans bibliothèque : des barres en CSS.
// Chaque barre est décrite en texte (« lundi : 3 utilisations ») pour les lecteurs d'écran ;
// le ou les jours les plus utilisés prennent la teinte dorée.
export default function GraphiqueJours({ jours }) {
  const max = Math.max(...jours.map((j) => j.utilisations))

  return (
    <ul className="grid grid-cols-7 gap-1.5">
      {jours.map((j) => {
        const premier = max > 0 && j.utilisations === max
        return (
          <li key={j.iso} className="min-w-0">
            <span className="sr-only">
              {j.long} : {j.utilisations} utilisation{j.utilisations > 1 ? 's' : ''}
            </span>
            <div aria-hidden="true" className="flex flex-col items-center">
              <span className={`text-xs font-bold ${premier ? 'text-or' : 'text-creme/80'}`}>
                {j.utilisations}
              </span>
              <div className="mt-1 flex h-32 w-full items-end rounded-[10px] bg-creme/5">
                <div
                  style={{ height: `${hauteurBarre(j.utilisations, max)}%` }}
                  className={`w-full rounded-[10px] ${
                    premier ? 'bg-linear-to-t from-corail to-or' : 'bg-creme/35'
                  }`}
                />
              </div>
              <span className={`mt-1.5 text-[13px] font-semibold ${premier ? 'text-creme' : 'text-creme/75'}`}>
                {j.long.slice(0, 3)}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
