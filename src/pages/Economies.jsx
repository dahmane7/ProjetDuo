import { Link } from 'react-router'
import Verre from '../components/Verre.jsx'

// Écran d'attente : le suivi des économies arrive avec la validation en caisse
export default function Economies() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-md items-center px-4">
      <Verre className="w-full rounded-[28px] px-6 py-10 text-center">
        <h1 className="font-titre text-[32px] leading-[1.02] font-black tracking-[-1.2px]">
          Tes économies
          <span className="block text-or">arrivent bientôt</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-[1.45] text-creme/85">
          Chaque duo validé en caisse s'ajoutera ici.
        </p>
        <Link
          to="/catalogue"
          className="mt-6 flex min-h-12 items-center justify-center rounded-[18px] bg-linear-to-r from-[#ffd9a0] via-corail to-duo-500 px-4 py-3.5 text-[15px] font-extrabold text-prune shadow-[0_12px_30px_rgba(255,120,100,0.4)]"
        >
          Voir les offres
        </Link>
      </Verre>
    </section>
  )
}
