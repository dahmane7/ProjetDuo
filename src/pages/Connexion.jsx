import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Champ from '../components/Champ.jsx'
import { accueilDuRole, useAuth } from '../lib/auth.js'
import { supabase } from '../lib/supabase.js'

export default function Connexion() {
  const navigate = useNavigate()
  const { session, profil } = useAuth()
  const [valeurs, setValeurs] = useState({ email: '', motDePasse: '' })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  // Une fois connecté : accueil du rôle (RG01)
  useEffect(() => {
    if (session && profil) navigate(accueilDuRole(profil.role), { replace: true })
  }, [session, profil, navigate])

  function changer(e) {
    setValeurs((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErreur('')
  }

  async function envoyer(e) {
    e.preventDefault()
    if (!valeurs.email.trim() || !valeurs.motDePasse)
      return setErreur('Indiquez votre e-mail et votre mot de passe.')
    if (!supabase) return setErreur("Le service de connexion n'est pas configuré.")

    setEnvoi(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: valeurs.email.trim(),
      password: valeurs.motDePasse,
    })
    setEnvoi(false)

    if (error)
      setErreur(
        error.code === 'email_not_confirmed'
          ? 'Confirmez votre adresse e-mail avant de vous connecter.'
          : 'E-mail ou mot de passe incorrect.',
      )
  }

  return (
    <section className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-extrabold">Se connecter</h1>
      <p className="mt-1.5 text-encre-doux">Retrouvez vos offres ou votre espace commerçant.</p>

      <form onSubmit={envoyer} noValidate className="mt-7 grid gap-5">
        <Champ
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={valeurs.email}
          onChange={changer}
        />
        <Champ
          id="motDePasse"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={valeurs.motDePasse}
          onChange={changer}
        />

        {erreur && (
          <p role="alert" className="rounded-lg bg-duo-50 px-3.5 py-3 text-sm font-medium text-duo-700">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="rounded-lg bg-duo-600 py-3.5 font-semibold text-white hover:bg-duo-700 disabled:opacity-60"
        >
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-encre-doux">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-semibold text-duo-600 hover:text-duo-700">
          Créer un compte
        </Link>
      </p>
    </section>
  )
}
