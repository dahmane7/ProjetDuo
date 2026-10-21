export default function Accueil() {
  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="rounded-3xl bg-duo-600 px-6 py-10 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-duo-100">
          L'abonnement des bons plans
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight">
          1 acheté =<br />1 offert
        </h1>
        <p className="mt-4 text-duo-50">
          Restaurants, cafés, beauté, loisirs : profitez d'offres « 1 + 1 » chez les
          commerçants près de chez vous.
        </p>
      </div>

      <ul className="grid gap-3 text-sm">
        <li className="rounded-2xl bg-white p-4 shadow-sm">
          <span className="font-semibold">1. Abonnez-vous</span> pour 12 mois.
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-sm">
          <span className="font-semibold">2. Choisissez une offre</span> valable aujourd'hui.
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-sm">
          <span className="font-semibold">3. Faites-la valider en caisse</span> avec le code
          du commerçant.
        </li>
      </ul>
    </section>
  )
}
