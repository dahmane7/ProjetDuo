import { useEffect, useState } from 'react'
import { AuthContext } from '../lib/auth.js'
import { supabase } from '../lib/supabase.js'

async function chargerProfil(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('prenom, role')
    .eq('id', userId)
    .maybeSingle()
  return data
}

// Session Supabase + profil (prénom, rôle). supabase-js garde la session dans le
// navigateur : l'utilisateur reste connecté quand il recharge la page.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)
  const [chargement, setChargement] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    let actif = true

    async function appliquer(nouvelleSession) {
      const nouveauProfil = nouvelleSession ? await chargerProfil(nouvelleSession.user.id) : null
      if (!actif) return
      setSession(nouvelleSession)
      setProfil(nouveauProfil)
      setChargement(false)
    }

    supabase.auth.getSession().then(({ data }) => appliquer(data.session))

    // Pas d'appel Supabase directement dans ce callback (risque de blocage) : on diffère
    const { data } = supabase.auth.onAuthStateChange((_evenement, nouvelleSession) => {
      setTimeout(() => appliquer(nouvelleSession), 0)
    })

    return () => {
      actif = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function deconnexion() {
    await supabase?.auth.signOut()
    setSession(null)
    setProfil(null)
  }

  return (
    <AuthContext.Provider value={{ session, profil, chargement, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}
