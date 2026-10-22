import { useNavigate } from 'react-router'
import { useAuth } from '../lib/auth.js'

// Bandeau « Bonjour prénom » des accueils membre et commerçant, avec la déconnexion.
// Sur mobile le bouton passe sous le message : à côté, le titre n'aurait qu'environ 150 px
// et serait coupé (« Bonjour Amélie ! » en demande 222). À partir de sm, il repasse à droite.
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
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-titre text-[28px] leading-tight font-black tracking-[-1px] break-words text-creme">
          Bonjour {profil?.prenom ?? ''} !
        </h1>
        <p className="mt-1 text-creme/80">{sousTitre}</p>
      </div>
      <button
        type="button"
        onClick={seDeconnecter}
        className="min-h-11 shrink-0 rounded-full border border-creme/40 px-3.5 text-sm font-semibold text-creme hover:border-or hover:text-or"
      >
        Se déconnecter
      </button>
    </div>
  )
}
