import { useNavigate } from 'react-router'
import { useAuth } from '../lib/auth.js'

// Bandeau « Bonjour prénom » des accueils membre et commerçant, avec la déconnexion
export default function EnTeteEspace({ sousTitre }) {
  const navigate = useNavigate()
  const { profil, deconnexion } = useAuth()

  // On quitte la page protégée avant de fermer la session : sinon RouteProtegee
  // redirige d'abord vers /connexion
  async function seDeconnecter() {
    navigate('/catalogue', { replace: true })
    await deconnexion()
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold break-words">Bonjour {profil?.prenom ?? ''} !</h1>
        <p className="mt-1 text-encre-doux">{sousTitre}</p>
      </div>
      <button
        type="button"
        onClick={seDeconnecter}
        className="shrink-0 rounded-lg border border-ligne px-3 py-2 text-sm font-semibold hover:border-duo-600 hover:text-duo-600"
      >
        Se déconnecter
      </button>
    </div>
  )
}
