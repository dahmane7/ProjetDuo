import { CATEGORIES } from '../lib/categories.js'
import { VERRE_FUME } from '../lib/styles.js'
import Icon from './Icon.jsx'

// Verre des puces, sans la grande ombre portée du verre des panneaux :
// la rangée défilante la couperait net sous les puces
const PUCE_VERRE = `border border-creme/20 bg-linear-to-b from-creme/15 to-creme/5 ${VERRE_FUME} text-creme shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md hover:from-creme/25`
const PUCE_ACTIVE =
  'border border-transparent bg-linear-to-r from-[#ffd9a0] to-corail font-semibold text-prune'

// Puces de catégorie (RG11) ; value = null pour « toutes »
export default function CategoryChips({ value, onChange }) {
  const choix = [null, ...CATEGORIES.map((c) => c.nom)]
  return (
    <div className="defile flex gap-2 px-4 py-3">
      {choix.map((nom) => {
        const actif = nom === value
        const cat = CATEGORIES.find((c) => c.nom === nom)
        return (
          <button
            key={nom ?? 'toutes'}
            type="button"
            onClick={() => onChange(nom)}
            aria-pressed={actif}
            className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-[15px] whitespace-nowrap ${
              actif ? PUCE_ACTIVE : PUCE_VERRE
            }`}
          >
            {cat && <Icon name={cat.icone} className="size-[18px]" />}
            {nom ?? 'Toutes'}
          </button>
        )
      })}
    </div>
  )
}
