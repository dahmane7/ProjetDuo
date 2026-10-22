import { VERRE_FUME } from '../lib/styles.js'
import Verre from './Verre.jsx'

// Bandeau d'information : panneau de verre arrondi, dans la marge de la page
export default function InfoBanner({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Verre
        as="p"
        className={`${VERRE_FUME} rounded-[22px] px-4 py-3 text-[14.5px] leading-[1.45] text-creme/90`}
      >
        {children}
      </Verre>
    </div>
  )
}
