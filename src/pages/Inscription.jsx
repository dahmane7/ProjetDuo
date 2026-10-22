import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Champ from '../components/Champ.jsx'
import Icon from '../components/Icon.jsx'
import { accueilDuRole, useAuth } from '../lib/auth.js'
import { supabase } from '../lib/supabase.js'

// Même minimum que le réglage Supabase (Auth > Providers > Email)
const MOT_DE_PASSE_MIN = 6

const ROLES = [
  { valeur: 'membre', titre: 'Je suis membre', texte: 'Je profite des offres 1 acheté = 1 offert.', icone: 'tag' },
  { valeur: 'commercant', titre: 'Je suis commerçant', texte: 'Je propose mes offres aux membres Duo.', icone: 'key' },
]

function verifier({ prenom, email, motDePasse, role }) {
  const erreurs = {}
  if (!prenom.trim()) erreurs.prenom = 'Indiquez votre prénom.'
  if (!email.trim()) erreurs.email = 'Indiquez votre adresse e-mail.'
  if (motDePasse.length < MOT_DE_PASSE_MIN)
    erreurs.motDePasse = `Mot de passe trop court : ${MOT_DE_PASSE_MIN} caractères minimum.`
  if (!role) erreurs.role = 'Choisissez si vous êtes membre ou commerçant.'
  return erreurs
}

// Traduit les refus de Supabase en message qui dit quoi corriger
function messageErreur(error) {
  const texte = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  if (texte.includes('user_already_exists') || texte.includes('already registered'))
    return { email: 'Cet e-mail est déjà utilisé. Connectez-vous ou choisissez une autre adresse.' }
  if (texte.includes('weak_password') || texte.includes('at least'))
    return { motDePasse: `Mot de passe trop court : ${MOT_DE_PASSE_MIN} caractères minimum.` }
  if (texte.includes('email_address_invalid') || texte.includes('invalid format'))
    return { email: "Cette adresse e-mail n'est pas valide." }
  return { general: "L'inscription n'a pas abouti. Réessayez dans un instant." }
}

export default function Inscription() {
  const navigate = useNavigate()
  const { session, profil } = useAuth()
  const [valeurs, setValeurs] = useState({ prenom: '', email: '', motDePasse: '', role: '' })
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)

  // Une fois connecté (inscription réussie ou déjà connecté) : accueil du rôle
  useEffect(() => {
    if (session && profil) navigate(accueilDuRole(profil.role), { replace: true })
  }, [session, profil, navigate])

  function changer(e) {
    setValeurs((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErreurs((er) => ({ ...er, [e.target.name]: undefined, general: undefined }))
  }

  async function envoyer(e) {
    e.preventDefault()
    const nouvellesErreurs = verifier(valeurs)
    if (Object.keys(nouvellesErreurs).length) return setErreurs(nouvellesErreurs)
    if (!supabase) return setErreurs({ general: "Le service d'inscription n'est pas configuré." })

    setEnvoi(true)
    const { data, error } = await supabase.auth.signUp({
      email: valeurs.email.trim(),
      password: valeurs.motDePasse,
      options: { data: { prenom: valeurs.prenom.trim(), role: valeurs.role } },
    })
    setEnvoi(false)

    if (error) return setErreurs(messageErreur(error))
    // Confirmation d'e-mail activée : Supabase ne renvoie pas d'erreur pour un e-mail
    // déjà utilisé, mais un utilisateur sans identité
    if (data.user && data.user.identities?.length === 0)
      return setErreurs(messageErreur({ code: 'user_already_exists' }))
    if (!data.session)
      setErreurs({ general: 'Compte créé : confirmez votre adresse e-mail avant de vous connecter.' })
  }

  return (
    <section className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-extrabold">Créer un compte</h1>
      <p className="mt-1.5 text-encre-doux">Quelques secondes suffisent pour rejoindre Duo.</p>

      <form onSubmit={envoyer} noValidate className="mt-7 grid gap-5">
        <fieldset>
          <legend className="text-sm font-semibold">Vous êtes</legend>
          <div className="mt-1.5 grid gap-3">
            {ROLES.map((r) => {
              const choisi = valeurs.role === r.valeur
              return (
                <label
                  key={r.valeur}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 ${
                    choisi ? 'border-duo-600 bg-duo-50' : 'border-ligne'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.valeur}
                    checked={choisi}
                    onChange={changer}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      choisi ? 'bg-duo-600 text-white' : 'bg-fond text-encre-doux'
                    }`}
                  >
                    <Icon name={r.icone} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{r.titre}</span>
                    <span className="block text-sm text-encre-doux">{r.texte}</span>
                  </span>
                  {choisi && <Icon name="check" className="ml-auto size-5 shrink-0 text-duo-600" />}
                </label>
              )
            })}
          </div>
          {erreurs.role && <p className="mt-1.5 text-sm font-medium text-duo-700">{erreurs.role}</p>}
        </fieldset>

        <Champ
          id="prenom"
          label="Prénom"
          autoComplete="given-name"
          value={valeurs.prenom}
          onChange={changer}
          erreur={erreurs.prenom}
        />
        <Champ
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={valeurs.email}
          onChange={changer}
          erreur={erreurs.email}
        />
        <Champ
          id="motDePasse"
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          value={valeurs.motDePasse}
          onChange={changer}
          erreur={erreurs.motDePasse}
          aide={`${MOT_DE_PASSE_MIN} caractères minimum.`}
        />

        {erreurs.general && (
          <p role="alert" className="rounded-lg bg-duo-50 px-3.5 py-3 text-sm font-medium text-duo-700">
            {erreurs.general}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="rounded-lg bg-duo-600 py-3.5 font-semibold text-white hover:bg-duo-700 disabled:opacity-60"
        >
          {envoi ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-encre-doux">
        Déjà un compte ?{' '}
        <Link to="/connexion" className="font-semibold text-duo-600 hover:text-duo-700">
          Se connecter
        </Link>
      </p>
    </section>
  )
}
