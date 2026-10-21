import { CATEGORIES } from '../lib/categories.js'
import Icon from './Icon.jsx'

// Onglets de catégorie ; value = null pour « toutes »
export default function CategoryChips({ value, onChange }) {
  const choix = [null, ...CATEGORIES.map((c) => c.nom)]
  return (
    <div className="defile flex gap-2 px-5 py-3">
      {choix.map((nom) => {
        const actif = nom === value
        const cat = CATEGORIES.find((c) => c.nom === nom)
        return (
          <button
            key={nom ?? 'toutes'}
            type="button"
            onClick={() => onChange(nom)}
            aria-pressed={actif}
            className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 text-[15px] whitespace-nowrap ${
              actif
                ? 'border-duo-600 bg-white font-semibold text-duo-600'
                : 'border-transparent bg-fond text-encre hover:bg-ligne'
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
