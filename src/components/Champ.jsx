// Champ de formulaire avec son libellé et, si besoin, un message d'erreur dessous.
// Thème crépuscule : champ sombre à texte crème, bord crème bien visible, anneau doré au focus ;
// color-scheme dark garde le remplissage automatique du navigateur lisible.
export default function Champ({ id, label, erreur, aide, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-creme">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur || aide ? `${id}-message` : undefined}
        className={`mt-1.5 block min-h-12 w-full rounded-[14px] border bg-nuit/60 px-3.5 py-3 text-base text-creme [color-scheme:dark] outline-none focus:border-or focus:ring-2 focus:ring-or/60 ${
          erreur ? 'border-duo-500' : 'border-creme/40'
        }`}
        {...props}
      />
      {(erreur || aide) && (
        <p
          id={`${id}-message`}
          className={`mt-1.5 text-sm ${erreur ? 'font-medium text-duo-200' : 'text-creme/75'}`}
        >
          {erreur || aide}
        </p>
      )}
    </div>
  )
}
