import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth.js'
import { supabase } from './supabase.js'

// Champs de la fiche lus et écrits par le front
export const CHAMPS_FICHE = 'id, nom, categorie, adresse, ville, description, photo'

async function lireCommerce(userId) {
  if (!supabase || !userId) return { commerce: null, codeDefini: false }
  const [fiche, code] = await Promise.all([
    supabase.from('merchants').select(CHAMPS_FICHE).eq('owner_id', userId).maybeSingle(),
    supabase.rpc('code_defini'),
  ])
  return { commerce: fiche.data, codeDefini: Boolean(code.data) }
}

// Fiche du commerçant connecté (une au plus) et présence de son code, jamais le code lui-même
export function useCommerce() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [etat, setEtat] = useState({ commerce: null, codeDefini: false, chargement: true })

  useEffect(() => {
    let actif = true
    lireCommerce(userId).then((lu) => {
      if (actif) setEtat({ ...lu, chargement: false })
    })
    return () => {
      actif = false
    }
  }, [userId])

  const recharger = useCallback(async () => {
    const lu = await lireCommerce(userId)
    setEtat({ ...lu, chargement: false })
  }, [userId])

  return { ...etat, recharger }
}
