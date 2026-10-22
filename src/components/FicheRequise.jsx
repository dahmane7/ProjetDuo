import { Navigate, Outlet } from 'react-router'
import { useCommerce } from '../lib/useCommerce.js'

// Un commerçant sans fiche ou sans code est d'abord envoyé sur la création de sa fiche (US05)
export default function FicheRequise() {
  const { commerce, codeDefini, chargement } = useCommerce()

  if (chargement) return null
  if (!commerce || !codeDefini) return <Navigate to="/commercant/fiche" replace />
  return <Outlet />
}
