// Champ de formulaire avec son libellé et, si besoin, un message d'erreur dessous
export default function Champ({ id, label, erreur, aide, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur || aide ? `${id}-message` : undefined}
        className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-3 text-base outline-none focus:border-duo-600 focus:ring-2 focus:ring-duo-100 ${
          erreur ? 'border-duo-600' : 'border-ligne'
        }`}
        {...props}
      />
      {(erreur || aide) && (
        <p
          id={`${id}-message`}
          className={`mt-1.5 text-sm ${erreur ? 'font-medium text-duo-700' : 'text-encre-doux'}`}
        >
          {erreur || aide}
        </p>
      )}
    </div>
  )
}
