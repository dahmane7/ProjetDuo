import { Link } from 'react-router'

export default function PageIntrouvable() {
  return (
    <section className="pt-10 text-center">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-duo-600 underline">
        Revenir à l'accueil
      </Link>
    </section>
  )
}
