import { positionHalo } from '../lib/halo.js'
import Verre from './Verre.jsx'

// Panneau en verre qui s'allume au toucher (ou au survol) : tout le panneau s'éclaire
// et un halo suit le doigt (utilitaire `lumineux` de index.css). Le défilement n'est pas bloqué.
export default function PanneauLumineux({ className = '', ...props }) {
  function allumer(e) {
    const p = positionHalo(e, e.currentTarget.getBoundingClientRect())
    e.currentTarget.style.setProperty('--x', `${p.x}%`)
    e.currentTarget.style.setProperty('--y', `${p.y}%`)
    e.currentTarget.dataset.allume = ''
  }
  function eteindre(e) {
    delete e.currentTarget.dataset.allume
  }

  return (
    <Verre
      className={`lumineux ${className}`}
      onPointerEnter={allumer}
      onPointerMove={allumer}
      onPointerDown={allumer}
      onPointerLeave={eteindre}
      onPointerUp={(e) => e.pointerType !== 'mouse' && eteindre(e)}
      onPointerCancel={eteindre}
      {...props}
    />
  )
}
