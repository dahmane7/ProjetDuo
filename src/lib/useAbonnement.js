import { useCallback, useEffect, useState } from 'react'
import { estActif } from './abonnement.js'
import { useAuth } from './auth.js'
import { supabase } from './supabase.js'

async function lireAbonnement(userId) {
  if (!supabase || !userId) return null
  const { data } = await supabase
    .from('subscriptions')
    .select('statut, debut, fin')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

// Abonnement du membre connecté (une ligne au plus dans subscriptions)
export function useAbonnement() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [abonnement, setAbonnement] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let actif = true
    lireAbonnement(userId).then((data) => {
      if (!actif) return
      setAbonnement(data)
      setChargement(false)
    })
    return () => {
      actif = false
    }
  }, [userId])

  const recharger = useCallback(async () => {
    setAbonnement(await lireAbonnement(userId))
  }, [userId])

  return { abonnement, actif: estActif(abonnement), chargement, recharger }
}
