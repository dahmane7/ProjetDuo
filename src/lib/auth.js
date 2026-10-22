import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Session et profil de l'utilisateur connecté : { session, profil, chargement, deconnexion }
export function useAuth() {
  return useContext(AuthContext)
}

// Accueil de chaque rôle (RG01)
export function accueilDuRole(role) {
  return role === 'commercant' ? '/commercant' : '/membre'
}
