import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Champ from '../components/Champ.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import { useAuth } from '../lib/auth.js'
import { CATEGORIES } from '../lib/categories.js'
import { supabase } from '../lib/supabase.js'
import { useCommerce } from '../lib/useCommerce.js'

const DESCRIPTION_MAX = 300

const classeChamp =
  'mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-3 text-base outline-none focus:border-duo-600 focus:ring-2 focus:ring-duo-100'

function verifierFiche(v) {
  const erreurs = {}
  if (!v.nom.trim()) erreurs.nom = 'Indiquez le nom du commerce.'
  if (!v.categorie) erreurs.categorie = 'Choisissez une catégorie.'
  if (!v.adresse.trim()) erreurs.adresse = "Indiquez l'adresse."
  if (!v.ville.trim()) erreurs.ville = 'Indiquez la ville.'
  if (v.description.length > DESCRIPTION_MAX)
    erreurs.description = `${DESCRIPTION_MAX} caractères au plus.`
  if (v.photo.trim() && !/^https:\/\/\S+$/.test(v.photo.trim()))
    erreurs.photo = 'Adresse de photo invalide : elle doit commencer par https://'
  return erreurs
}

function verifierCode(code, confirmation) {
  if (!/^[0-9]{4}$/.test(code)) return { code: 'Le code doit faire exactement 4 chiffres.' }
  if (code !== confirmation) return { confirmation: 'Les deux codes ne sont pas identiques.' }
  return {}
}

function messageCode(error) {
  if (error.message?.includes('code_invalide')) return { code: 'Le code doit faire exactement 4 chiffres.' }
  if (error.message?.includes('fiche_absente')) return { general: "Enregistrez d'abord la fiche du commerce." }
  return { general: "Le code n'a pas pu être enregistré. Réessayez." }
}

// Deux champs de code, jamais pré-remplis : le code n'est jamais réaffiché (RG09)
function ChampsCode({ valeurs, erreurs, changer }) {
  return (
    <>
      <Champ
        id="code"
        label="Code à 4 chiffres"
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        value={valeurs.code}
        onChange={changer}
        erreur={erreurs.code}
        aide="Vous le saisirez en caisse pour valider les offres."
      />
      <Champ
        id="confirmation"
        label="Saisissez-le à nouveau"
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        value={valeurs.confirmation}
        onChange={changer}
        erreur={erreurs.confirmation}
      />
    </>
  )
}

function Alerte({ children, succes }) {
  return (
    <p
      role={succes ? 'status' : 'alert'}
      className={`rounded-lg px-3.5 py-3 text-sm font-medium ${
        succes ? 'bg-valide/10 text-valide' : 'bg-duo-50 text-duo-700'
      }`}
    >
      {children}
    </p>
  )
}

// Fiche du commerce ; à la création (ou tant qu'aucun code n'existe), le code est demandé aussi
function FormulaireFiche({ commerce, codeDefini, onEnregistre }) {
  const { session } = useAuth()
  const demanderCode = !commerce || !codeDefini
  const [valeurs, setValeurs] = useState({
    nom: commerce?.nom ?? '',
    categorie: commerce?.categorie ?? '',
    adresse: commerce?.adresse ?? '',
    ville: commerce?.ville ?? '',
    description: commerce?.description ?? '',
    photo: commerce?.photo ?? '',
    code: '',
    confirmation: '',
  })
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [succes, setSucces] = useState('')

  function changer(e) {
    const { name, value } = e.target
    setValeurs((v) => ({ ...v, [name]: value }))
    setErreurs((er) => ({ ...er, [name]: undefined, general: undefined }))
    setSucces('')
  }

  async function envoyer(e) {
    e.preventDefault()
    const nouvellesErreurs = {
      ...verifierFiche(valeurs),
      ...(demanderCode ? verifierCode(valeurs.code, valeurs.confirmation) : {}),
    }
    if (Object.keys(nouvellesErreurs).length) return setErreurs(nouvellesErreurs)

    setEnvoi(true)
    const fiche = {
      nom: valeurs.nom.trim(),
      categorie: valeurs.categorie,
      adresse: valeurs.adresse.trim(),
      ville: valeurs.ville.trim(),
      description: valeurs.description.trim() || null,
      photo: valeurs.photo.trim() || null,
    }
    const { error } = commerce
      ? await supabase.from('merchants').update(fiche).eq('id', commerce.id)
      : await supabase.from('merchants').insert({ ...fiche, owner_id: session.user.id })

    if (error) {
      setEnvoi(false)
      return setErreurs({ general: "La fiche n'a pas pu être enregistrée. Réessayez." })
    }

    if (demanderCode) {
      const code = await supabase.rpc('definir_code', { pin: valeurs.code })
      if (code.error) {
        setEnvoi(false)
        await onEnregistre()
        return setErreurs(messageCode(code.error))
      }
    }

    setEnvoi(false)
    setValeurs((v) => ({ ...v, code: '', confirmation: '' }))
    setSucces('Fiche enregistrée.')
    await onEnregistre({ creation: demanderCode })
  }

  return (
    <form onSubmit={envoyer} noValidate className="grid gap-5">
      <Champ id="nom" label="Nom du commerce" value={valeurs.nom} onChange={changer} erreur={erreurs.nom} />

      <div>
        <label htmlFor="categorie" className="block text-sm font-semibold">
          Catégorie
        </label>
        <select
          id="categorie"
          name="categorie"
          value={valeurs.categorie}
          onChange={changer}
          aria-invalid={Boolean(erreurs.categorie)}
          className={`${classeChamp} ${erreurs.categorie ? 'border-duo-600' : 'border-ligne'}`}
        >
          <option value="">Choisir…</option>
          {CATEGORIES.map((c) => (
            <option key={c.nom} value={c.nom}>
              {c.nom}
            </option>
          ))}
        </select>
        {erreurs.categorie && <p className="mt-1.5 text-sm font-medium text-duo-700">{erreurs.categorie}</p>}
      </div>

      <Champ
        id="adresse"
        label="Adresse"
        autoComplete="street-address"
        value={valeurs.adresse}
        onChange={changer}
        erreur={erreurs.adresse}
      />
      <Champ
        id="ville"
        label="Ville"
        autoComplete="address-level2"
        value={valeurs.ville}
        onChange={changer}
        erreur={erreurs.ville}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-semibold">
          Description <span className="font-normal text-encre-doux">(facultatif)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={DESCRIPTION_MAX}
          value={valeurs.description}
          onChange={changer}
          className={`${classeChamp} resize-none ${erreurs.description ? 'border-duo-600' : 'border-ligne'}`}
        />
        <p className="mt-1.5 text-right text-sm text-encre-doux">
          {valeurs.description.length} / {DESCRIPTION_MAX}
        </p>
      </div>

      <div>
        <Champ
          id="photo"
          label="Adresse d'une photo (facultatif)"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={valeurs.photo}
          onChange={changer}
          erreur={erreurs.photo}
        />
        {valeurs.categorie && (
          <Photo
            key={valeurs.photo}
            id={/^https:\/\//.test(valeurs.photo.trim()) ? valeurs.photo.trim() : null}
            nomCategorie={valeurs.categorie}
            largeur={640}
            hauteur={360}
            className="mt-3 h-40 w-full rounded-xl"
          />
        )}
      </div>

      {demanderCode && (
        <fieldset className="grid gap-5 rounded-xl bg-fond p-4">
          <legend className="sr-only">Code de validation</legend>
          <p className="flex items-center gap-2 font-bold">
            <Icon name="key" className="size-5 text-duo-600" />
            Votre code de validation
          </p>
          <ChampsCode valeurs={valeurs} erreurs={erreurs} changer={changer} />
        </fieldset>
      )}

      {erreurs.general && <Alerte>{erreurs.general}</Alerte>}
      {succes && <Alerte succes>{succes}</Alerte>}

      <button
        type="submit"
        disabled={envoi}
        className="rounded-lg bg-duo-600 py-3.5 font-semibold text-white hover:bg-duo-700 disabled:opacity-60"
      >
        {envoi ? 'Enregistrement…' : commerce ? 'Enregistrer les modifications' : 'Créer ma fiche'}
      </button>
    </form>
  )
}

// Changement du code : saisi deux fois, enregistré haché, jamais réaffiché
function FormulaireCode() {
  const [valeurs, setValeurs] = useState({ code: '', confirmation: '' })
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [succes, setSucces] = useState(false)

  function changer(e) {
    setValeurs((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErreurs({})
    setSucces(false)
  }

  async function envoyer(e) {
    e.preventDefault()
    const nouvellesErreurs = verifierCode(valeurs.code, valeurs.confirmation)
    if (Object.keys(nouvellesErreurs).length) return setErreurs(nouvellesErreurs)

    setEnvoi(true)
    const { error } = await supabase.rpc('definir_code', { pin: valeurs.code })
    setEnvoi(false)
    if (error) return setErreurs(messageCode(error))
    setValeurs({ code: '', confirmation: '' })
    setSucces(true)
  }

  return (
    <form onSubmit={envoyer} noValidate className="grid gap-5">
      <ChampsCode valeurs={valeurs} erreurs={erreurs} changer={changer} />
      {erreurs.general && <Alerte>{erreurs.general}</Alerte>}
      {succes && <Alerte succes>Nouveau code enregistré.</Alerte>}
      <button
        type="submit"
        disabled={envoi}
        className="rounded-lg border border-ligne bg-white py-3.5 font-semibold hover:border-duo-600 hover:text-duo-600 disabled:opacity-60"
      >
        {envoi ? 'Enregistrement…' : 'Changer mon code'}
      </button>
    </form>
  )
}

// Page /commercant/fiche : création de la fiche (obligatoire avant le reste), puis modification
export default function FicheCommerce() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { commerce, codeDefini, chargement, recharger } = useCommerce()

  // « Changer mon code » depuis l'accueil : descendre au formulaire une fois la page affichée
  useEffect(() => {
    if (!chargement && hash === '#changer-code') document.getElementById('changer-code')?.scrollIntoView()
  }, [chargement, hash])

  if (chargement) return null

  async function apresEnregistrement({ creation } = {}) {
    await recharger()
    if (creation) navigate('/commercant')
  }

  const complete = commerce && codeDefini

  return (
    <section className="mx-auto max-w-md px-5 py-10">
      {complete && (
        <Link to="/commercant" className="text-sm font-semibold text-duo-600 hover:text-duo-700">
          ← Mon espace
        </Link>
      )}
      <h1 className="mt-2 text-2xl font-extrabold">{commerce ? 'Ma fiche commerce' : 'Créer ma fiche'}</h1>
      {!complete && (
        <p className="mt-3 rounded-xl bg-duo-50 p-4 text-sm text-duo-700">
          <strong>Avant tout, présentez votre commerce</strong> et choisissez le code à 4 chiffres qui
          validera les offres en caisse.
        </p>
      )}

      <div className="mt-7">
        <FormulaireFiche commerce={commerce} codeDefini={codeDefini} onEnregistre={apresEnregistrement} />
      </div>

      {complete && (
        <div id="changer-code" className="mt-10 scroll-mt-20 border-t border-ligne pt-8">
          <h2 className="text-lg font-extrabold">Changer mon code</h2>
          <p className="mt-1 text-sm text-encre-doux">
            Votre code actuel est enregistré chiffré : il ne s'affiche jamais.
          </p>
          <div className="mt-5">
            <FormulaireCode />
          </div>
        </div>
      )}
    </section>
  )
}
