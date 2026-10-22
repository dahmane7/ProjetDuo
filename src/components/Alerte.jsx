// Message d'erreur (role="alert") ou de réussite (role="status") d'un formulaire, thème crépuscule
export default function Alerte({ children, succes }) {
  return (
    <p
      role={succes ? 'status' : 'alert'}
      className={`rounded-[14px] border px-3.5 py-3 text-sm font-medium ${
        succes ? 'border-valide/50 bg-valide/15 text-creme' : 'border-duo-500/50 bg-duo-600/20 text-duo-100'
      }`}
    >
      {children}
    </p>
  )
}
