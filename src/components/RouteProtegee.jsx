import { Navigate, Outlet } from 'react-router'
import { accueilDuRole, useAuth } from '../lib/auth.js'

// Réserve des pages aux utilisateurs connectés d'un rôle donné (RG01)
export default function RouteProtegee({ role }) {
  const { session, profil, chargement } = useAuth()

  // Rien tant que la session n'est pas relue, pour éviter un aller-retour vers /connexion
  if (chargement) return null
  if (!session) return <Navigate to="/connexion" replace />
  if (profil && profil.role !== role) return <Navigate to={accueilDuRole(profil.role)} replace />
  return <Outlet />
}
