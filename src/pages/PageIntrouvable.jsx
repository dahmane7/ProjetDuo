import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'

export default function PageIntrouvable() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-duo-50 text-duo-600">
        <Icon name="search" className="size-9" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">Oups ! Page introuvable</h1>
      <p className="mt-2 text-encre-doux">
        Cette page n'existe pas encore ou le lien est incomplet.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-duo-600 px-5 py-3 font-semibold text-white hover:bg-duo-700"
      >
        Revenir à l'accueil
      </Link>
    </section>
  )
}
