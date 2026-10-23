import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { MENUS, menuVoisin } from '../lib/menus.js'
import { BOUTON_PRINCIPAL } from '../lib/styles.js'
import { webglDisponible } from '../lib/webgl.js'
import { DUREE_ECLAT } from '../three/eclat.js'
import PanneauLumineux from './PanneauLumineux.jsx'

const deuxChiffres = (n) => String(n).padStart(2, '0')

// Les touches et le glisser ne doivent pas détourner la saisie dans un champ
function estUnChamp(cible) {
  return (
    cible instanceof HTMLElement &&
    (['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName) || cible.isContentEditable)
  )
}

// 3D seulement si WebGL fonctionne et que l'utilisateur n'a pas demandé moins d'animations
function avecTroisD() {
  return webglDisponible() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const BOUTON_ROND =
  'grid size-[46px] shrink-0 place-items-center rounded-2xl border border-creme/30 bg-creme/10 text-lg text-creme hover:bg-creme/20'
const BOUTON_CHAUD = `flex-1 ${BOUTON_PRINCIPAL} disabled:cursor-not-allowed disabled:opacity-60`

// Carrousel d'accueil : 6 menus en médaillons 3D, chacun raconte son histoire en 4 étapes
export default function MenusCarrousel() {
  const navigate = useNavigate()
  const [troisD, setTroisD] = useState(avecTroisD)
  const [scene, setScene] = useState(null)
  const [menu, setMenu] = useState(0)
  const [mode, setMode] = useState('menus')
  const [etape, setEtape] = useState(0)
  const canvasRef = useRef(null)
  const departGlisser = useRef(null)
  const premierRendu = useRef(true)
  const voirRef = useRef(null)
  const suivantRef = useRef(null)

  const m = MENUS[menu]
  const e = m.etapes[etape]
  const derniere = etape === m.etapes.length - 1
  // Texte lu par les lecteurs d'écran à chaque changement de menu ou d'étape
  const annonce =
    mode === 'menus'
      ? `Menu ${menu + 1} sur ${MENUS.length} : ${m.titre} ${m.titreOr}`
      : `Étape ${etape + 1} sur ${m.etapes.length} : ${e.titre}. ${e.texte}`

  // Scène 3D chargée à la demande : Three.js n'est téléchargé que si le canvas existe.
  // `annule` évite de créer une scène si le composant est démonté avant la fin de l'import
  // (dont le double montage de StrictMode) : chaque montage crée au plus une scène.
  // Si le chargement du fichier 3D ou la création de la scène échoue, on repasse en texte seul.
  useEffect(() => {
    if (!troisD) return
    let annule = false
    let creee = null
    import('../three/scene-menus.js')
      .then(({ creerSceneMenus }) => {
        if (annule || !canvasRef.current) return
        creee = creerSceneMenus(canvasRef.current)
        setScene(creee)
      })
      .catch((err) => {
        if (annule) return
        console.warn('3D indisponible, affichage en texte seul', err)
        setTroisD(false)
      })
    return () => {
      annule = true
      creee?.detruire()
      setScene(null)
    }
  }, [troisD])

  // La scène suit l'état de l'interface
  useEffect(() => {
    scene?.choisirMenu(menu)
  }, [scene, menu])

  useEffect(() => {
    if (!scene) return
    if (mode === 'histoire') scene.ouvrirHistoire(MENUS[menu].dest)
    else scene.fermerHistoire()
  }, [scene, mode, menu])

  useEffect(() => {
    if (scene && mode === 'histoire') scene.etape(etape)
  }, [scene, mode, etape])

  // Le focus suit le panneau affiché (le bouton cliqué vient de disparaître)
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }
    ;(mode === 'histoire' ? suivantRef : voirRef).current?.focus()
  }, [mode])

  function changer(delta) {
    setMenu((i) => menuVoisin(i, delta))
  }

  // Flèches ← → : seulement en mode menus, et jamais pendant la saisie dans un champ
  useEffect(() => {
    if (mode !== 'menus') return
    function surTouche(ev) {
      if (estUnChamp(ev.target)) return
      if (ev.key === 'ArrowRight') setMenu((i) => menuVoisin(i, 1))
      if (ev.key === 'ArrowLeft') setMenu((i) => menuVoisin(i, -1))
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [mode])

  // Changement de menu différé après un toucher (le temps de voir l'onde) ; annulé au démontage
  const minuterie = useRef(0)
  useEffect(() => () => clearTimeout(minuterie.current), [])

  // Glisser de plus de 40 px : menu voisin (mode menus uniquement)
  function debutGlisser(ev) {
    departGlisser.current = mode === 'menus' && !estUnChamp(ev.target) ? { x: ev.clientX, y: ev.clientY } : null
  }
  function finGlisser(ev) {
    const depart = departGlisser.current
    departGlisser.current = null
    if (depart === null || mode !== 'menus') return
    const dx = ev.clientX - depart.x
    if (Math.abs(dx) > 40) return changer(dx < 0 ? 1 : -1)
    // Toucher bref sur un médaillon : onde d'eau, puis le médaillon part et le carrousel tourne
    if (Math.abs(dx) < 10 && Math.abs(ev.clientY - depart.y) < 10 && ev.target === canvasRef.current && scene) {
      const r = canvasRef.current.getBoundingClientRect()
      const i = scene.toucher(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      if (i < 0) return
      clearTimeout(minuterie.current)
      // La boule touchée explose : on la laisse se reformer avant de passer au menu suivant
      const attente = i !== menu ? 450 : DUREE_ECLAT * 1000 - 200
      minuterie.current = setTimeout(() => (i === menu ? changer(1) : setMenu(i)), attente)
    }
  }

  function voirHistoire() {
    setEtape(0)
    setMode('histoire')
  }
  function retourMenus() {
    setMode('menus')
  }

  return (
    <section
      aria-label="Les menus Twins"
      className="relative touch-pan-y overflow-hidden pb-4 select-none"
      onPointerDown={debutGlisser}
      onPointerUp={finGlisser}
      onPointerCancel={() => (departGlisser.current = null)}
    >
      {troisD && <canvas ref={canvasRef} aria-hidden="true" className="block h-[420px] w-full lg:h-[min(640px,68dvh)] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]" />}

      <div className={`relative z-10 mx-auto w-[min(420px,calc(100%-32px))] ${troisD ? '-mt-20' : 'mt-4'}`}>
        {mode === 'menus' ? (
          <PanneauLumineux className="rounded-[28px] px-[18px] pt-[18px] pb-4">
            <p className="text-[11px] font-extrabold tracking-[2px] text-or uppercase">
              <span className="font-titre text-[13px] tracking-normal">
                {deuxChiffres(menu + 1)} / {deuxChiffres(MENUS.length)}
              </span>{' '}
              · Menu
            </p>
            <h2 className="mt-1.5 font-titre text-[30px] leading-[0.98] font-black tracking-[-1.2px]">
              {m.titre}
              <br />
              <span className="text-or">{m.titreOr}</span>
            </h2>
            <p className="mt-2 min-h-[42px] text-[14.5px] leading-[1.45] text-creme/85">{m.texte}</p>
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                aria-label="Menu précédent"
                onClick={() => changer(-1)}
                className={BOUTON_ROND}
              >
                ‹
              </button>
              <button ref={voirRef} type="button" onClick={voirHistoire} className={BOUTON_CHAUD}>
                Voir l'histoire
              </button>
              <button
                type="button"
                aria-label="Menu suivant"
                onClick={() => changer(1)}
                className={BOUTON_ROND}
              >
                ›
              </button>
            </div>
          </PanneauLumineux>
        ) : (
          <PanneauLumineux className="rounded-[28px] px-[18px] pt-[18px] pb-4">
            <p className="text-[11px] font-extrabold tracking-[2px] text-or uppercase">
              {m.court} · {etape + 1}/{m.etapes.length}
            </p>
            <h2 className="mt-1.5 font-titre text-[30px] leading-[0.98] font-black tracking-[-1.2px]">
              {e.titre}
            </h2>
            <p className="mt-2 min-h-[42px] text-[14.5px] leading-[1.45] text-creme/85">{e.texte}</p>
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                aria-label="Retour aux menus"
                onClick={retourMenus}
                className={BOUTON_ROND}
              >
                ⌂
              </button>
              {!derniere ? (
                <button
                  ref={suivantRef}
                  type="button"
                  onClick={() => setEtape((n) => n + 1)}
                  className={BOUTON_CHAUD}
                >
                  Suivant
                </button>
              ) : m.disponible ? (
                <button type="button" onClick={() => navigate('/catalogue')} className={BOUTON_CHAUD}>
                  Voir les offres ✦
                </button>
              ) : (
                <button type="button" disabled className={BOUTON_CHAUD}>
                  Bientôt
                </button>
              )}
            </div>
            {derniere && !m.disponible && (
              <p className="mt-2 text-center text-sm text-creme/75">Ce menu arrive bientôt</p>
            )}
            <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
              {m.etapes.map((x, i) => (
                <i
                  key={x.titre}
                  className={`h-1.5 rounded-full transition-all ${
                    i === etape ? 'w-[18px] bg-linear-to-r from-or to-corail' : 'w-1.5 bg-creme/30'
                  }`}
                />
              ))}
            </div>
          </PanneauLumineux>
        )}
      </div>

      {/* Zone d'annonce toujours présente : une zone qui apparaît avec son texte n'est pas lue.
          Seul ce texte est annoncé ; l'affichage visible n'a pas d'aria-live, pour éviter le double. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {annonce}
      </p>
    </section>
  )
}
