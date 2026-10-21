// Scène 3D de l'accueil : carrousel des 6 menus (un médaillon par menu) et histoires animées.
// Chargée uniquement par import() dynamique depuis MenusCarrousel : Three.js reste dans son propre fichier.
import * as THREE from 'three'
import { MENUS } from '../lib/menus.js'
import { ACTEURS, etatHistoire } from './histoires.js'

const RAYON = 2.7
const NB_ETINCELLES = 70
const PERSONNES = ['toi', 'ami', 'voisine', 'sdf', 'etudiant', 'suivant']

const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)

// Place un acteur : position [x, y, z], échelle s[3] × f (f = avancement du mode histoire)
function poser(o, s, f) {
  o.position.set(s[0], s[1], s[2])
  const sc = Math.max(s[3] * f, 0.0001)
  o.scale.setScalar(sc)
  o.visible = sc > 0.01
}

// Texture de texte dessinée sur un canvas 2D
function texte(t, w, h, taille, couleur) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.fillStyle = couleur
  x.font = `900 ${taille}px Fraunces, serif`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(t, w / 2, h / 2)
  const tx = new THREE.CanvasTexture(c)
  tx.colorSpace = THREE.SRGBColorSpace
  return tx
}

export function creerSceneMenus(canvas, { reduit = false } = {}) {
  // ---------------------------------------------------------------- Moteur
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)

  // Taille prise sur le canvas lui-même (et non sur la fenêtre)
  function redimensionner() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w < 700 ? 50 : 34
    camera.updateProjectionMatrix()
  }
  redimensionner()

  // ---------------------------------------------------------------- Environnement crépuscule, lumières, sol
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = new THREE.Scene()
  const sg = new THREE.SphereGeometry(10, 32, 16)
  const cols = []
  const bas = new THREE.Color(0x3a1630)
  const haut = new THREE.Color(0xffb37a)
  for (let i = 0; i < sg.attributes.position.count; i++) {
    const y = sg.attributes.position.getY(i) / 10
    const c = new THREE.Color().lerpColors(bas, haut, (y + 1) / 2)
    cols.push(c.r, c.g, c.b)
  }
  sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
  const ciel = new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })
  env.add(new THREE.Mesh(sg, ciel))
  const cible = pmrem.fromScene(env, 0.03)
  scene.environment = cible.texture

  const soleil = new THREE.DirectionalLight(0xffc89a, 2.2)
  soleil.position.set(3, 6, 4)
  soleil.castShadow = true
  soleil.shadow.mapSize.set(1024, 1024)
  scene.add(soleil)
  const contre = new THREE.PointLight(0xff6b8a, 30)
  contre.position.set(-4, 1, 3)
  scene.add(contre)
  const sol = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.25 }))
  sol.rotation.x = -Math.PI / 2
  sol.position.y = -1.2
  sol.receiveShadow = true
  scene.add(sol)

  // ---------------------------------------------------------------- Matériaux
  const verre = new THREE.MeshPhysicalMaterial({ color: 0xfff1e6, roughness: 0.05, transmission: 0.85, thickness: 0.6, ior: 1.45, clearcoat: 1, iridescence: 0.4, envMapIntensity: 1.3 })
  const or = new THREE.MeshPhysicalMaterial({ color: 0xffc46b, metalness: 0.85, roughness: 0.18, clearcoat: 1, emissive: 0xff9a40, emissiveIntensity: 0.3, envMapIntensity: 1.5 })
  const argile = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.5, clearcoat: 0.3 })

  // ---------------------------------------------------------------- Fabriques
  function tasse(m) {
    const pts = [[0, 0], [0.55, 0], [0.62, 0.05], [0.68, 0.9], [0.72, 1], [0.66, 1], [0.6, 0.12], [0, 0.12]].map(([x, y]) => new THREE.Vector2(x, y))
    const g = new THREE.Group()
    const c = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), m)
    c.castShadow = true
    g.add(c)
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 12, 32, Math.PI * 1.2), m)
    a.position.set(0.7, 0.5, 0)
    a.rotation.z = -Math.PI * 0.6
    g.add(a)
    const cafe = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshStandardMaterial({ color: 0x5a2c18, roughness: 0.3 }))
    cafe.rotation.x = -Math.PI / 2
    cafe.position.y = 0.86
    g.add(cafe)
    const s = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 0.08, 48), m)
    s.position.y = -0.04
    g.add(s)
    g.position.y = -0.5
    const w = new THREE.Group()
    w.add(g)
    w.scale.setScalar(0.6)
    return w
  }

  function enveloppe(o) {
    const g = new THREE.Group()
    g.add(o)
    return g
  }

  function personne(c, opts = {}) {
    const g = new THREE.Group()
    const m = argile(c)
    const h = opts.assise ? 0.35 : 0.75
    const k = opts.petite ? 0.85 : 1
    const corps = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, h, 8, 20), m)
    corps.position.y = opts.assise ? 0.55 : 0.75
    corps.castShadow = true
    g.add(corps)
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.27, 28, 28), m)
    tete.position.y = opts.assise ? 1.3 : 1.62
    tete.castShadow = true
    g.add(tete)
    if (opts.assise) {
      const p = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.14, 14, 40), argile(0xc9a7ff))
      p.rotation.x = Math.PI / 2
      p.position.y = 0.45
      g.add(p)
    }
    if (opts.sac) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), argile(0x5fb3a1))
      s.position.set(0, 0.9, -0.38)
      g.add(s)
    }
    if (opts.canne) {
      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), argile(0x8a5a3a))
      c2.position.set(0.45, 0.55, 0.1)
      g.add(c2)
    }
    if (opts.chale) {
      const ch = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 12, 32), argile(0xff9db5))
      ch.rotation.x = Math.PI / 2
      ch.position.y = 1.3
      g.add(ch)
    }
    g.scale.setScalar(k)
    g.position.y = -1.2
    return enveloppe(g)
  }

  function commerceObj() {
    const g = new THREE.Group()
    const comptoir = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1, 0.8), argile(0x8a3a4e))
    comptoir.position.y = -0.7
    comptoir.castShadow = true
    g.add(comptoir)
    const plateau = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1), argile(0xffe2c4))
    plateau.position.y = -0.17
    g.add(plateau)
    const mur = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 0.12), argile(0x5a2440))
    mur.position.set(0, 0.1, -0.9)
    g.add(mur)
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.1, 0.6), argile(i % 2 ? 0xfff1e6 : 0xff7a6b))
      b.position.set(-1.33 + i * 0.53, 1.45, -0.5)
      b.rotation.x = 0.35
      g.add(b)
    }
    const etagere = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.35), argile(0xffe2c4))
    etagere.position.set(0, 0.35, -0.7)
    g.add(etagere)
    const att = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.22), new THREE.MeshBasicMaterial({ map: texte('EN ATTENTE ♥', 700, 110, 70, '#ffd27a'), transparent: true }))
    att.position.set(0, 0.72, -0.83)
    g.add(att)
    const mini = []
    for (let i = 0; i < 8; i++) {
      const t = tasse(or)
      t.scale.setScalar(0.2)
      t.position.set(-1 + i * 0.29, 0.55, -0.68)
      g.add(t)
      mini.push(t)
    }
    return { o: enveloppe(g), mini }
  }

  function maisonObj() {
    const g = new THREE.Group()
    const corps = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.2), argile(0xffe2c4))
    corps.position.y = -0.4
    corps.castShadow = true
    g.add(corps)
    const toit = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), argile(0xff7a6b))
    toit.position.y = 0.8
    toit.rotation.y = Math.PI / 4
    g.add(toit)
    const porte = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.05), argile(0x8a3a4e))
    porte.position.set(0, -0.85, 0.61)
    g.add(porte)
    const fen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.05), new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffb050, emissiveIntensity: 1.2 }))
    fen.position.set(0.4, -0.15, 0.61)
    g.add(fen)
    return enveloppe(g)
  }

  function coeurObj() {
    const s = new THREE.Shape()
    s.moveTo(0, -0.35)
    s.bezierCurveTo(-0.6, 0.05, -0.35, 0.55, 0, 0.25)
    s.bezierCurveTo(0.35, 0.55, 0.6, 0.05, 0, -0.35)
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4 }), or)
    m.position.z = -0.09
    return enveloppe(m)
  }

  // ---------------------------------------------------------------- Anneau « duo du jour »
  const anneau = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 0.3, 96, 1, true),
    new THREE.MeshBasicMaterial({ map: texte('DUO DU JOUR ✦ AUJOURD’HUI SEULEMENT ✦ DUO DU JOUR ✦ AUJOURD’HUI SEULEMENT ✦', 4096, 128, 64, '#ffd27a'), transparent: true, side: THREE.DoubleSide }),
  )
  scene.add(anneau)

  // ---------------------------------------------------------------- Acteurs des histoires (un objet par nom d'ACTEURS)
  const A = tasse(verre)
  const B = tasse(or)
  const com = commerceObj()
  const chaine = new THREE.Group()
  for (let i = 0; i < 4; i++) {
    const t = tasse(or)
    t.position.x = i * 0.55
    t.scale.setScalar(0.35)
    chaine.add(t)
  }
  const fabriques = {
    A: () => enveloppe(A),
    B: () => enveloppe(B),
    toi: () => personne(0xffb37a),
    ami: () => personne(0xff7a9a),
    voisine: () => personne(0xe7b9ff, { petite: true, canne: true, chale: true }),
    sdf: () => personne(0x9f8cff, { assise: true }),
    etudiant: () => personne(0x7fd6c2, { sac: true }),
    suivant: () => personne(0x8fb7ff),
    com: () => com.o,
    maison: maisonObj,
    coeur: coeurObj,
    chaine: () => enveloppe(chaine),
  }
  const acteurs = Object.fromEntries(ACTEURS.map((nom) => [nom, fabriques[nom]()]))
  ACTEURS.forEach((nom) => scene.add(acteurs[nom]))

  // ---------------------------------------------------------------- Étincelles du double offert
  const sp = new THREE.BufferGeometry()
  const sPos = new Float32Array(NB_ETINCELLES * 3)
  const graines = []
  for (let i = 0; i < NB_ETINCELLES; i++) graines.push([Math.random() * 6.28, 0.5 + Math.random() * 0.6, Math.random() * 1.2 - 0.5, Math.random()])
  sp.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  const etincelles = new THREE.Points(sp, new THREE.PointsMaterial({ color: 0xffe0a0, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  scene.add(etincelles)

  // ---------------------------------------------------------------- Carrousel des menus (un médaillon 3D par menu)
  function medaillon(i) {
    const g = new THREE.Group()
    const disque = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.12, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xffe9dc, roughness: 0.08, transmission: 0.7, thickness: 0.4, clearcoat: 1, iridescence: 0.5, envMapIntensity: 1.2 }),
    )
    disque.rotation.x = Math.PI / 2
    g.add(disque)
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 12, 96), or))
    const sym = new THREE.Group()
    sym.position.z = 0.25
    g.add(sym)
    const t = (m, s, x, y) => {
      const o = tasse(m)
      o.scale.setScalar(s)
      o.position.set(x, y, 0)
      sym.add(o)
      return o
    }
    if (i === 0) {
      t(verre, 0.32, -0.3, -0.1)
      t(or, 0.32, 0.32, -0.1)
    }
    if (i === 1) {
      const m = maisonObj()
      m.scale.setScalar(0.32)
      m.position.set(-0.2, 0.05, 0)
      sym.add(m)
      t(or, 0.22, 0.42, -0.25)
    }
    if (i === 2) {
      const c = coeurObj()
      c.scale.setScalar(0.75)
      c.position.y = 0.02
      sym.add(c)
    }
    if (i === 3) {
      t(or, 0.3, 0, -0.1)
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 64), or)
      r.rotation.x = 1.2
      sym.add(r)
    }
    if (i === 4) {
      for (let k = 0; k < 3; k++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.5), argile([0x7fd6c2, 0xff7a6b, 0xffe2c4][k]))
        b.position.set(-0.1, -0.35 + k * 0.15, 0)
        b.rotation.y = k * 0.3
        sym.add(b)
      }
      t(or, 0.2, 0.35, 0.1)
    }
    if (i === 5) {
      for (let k = 0; k < 3; k++) t(or, 0.18, -0.45 + k * 0.45, -0.1 + (k % 2) * 0.08)
    }
    return { g, sym }
  }
  const carrousel = new THREE.Group()
  scene.add(carrousel)
  const meds = MENUS.map((_, i) => {
    const m = medaillon(i)
    carrousel.add(m.g)
    return m
  })

  // ---------------------------------------------------------------- État piloté par l'interface
  let menu = 0
  let dest = MENUS[0].dest
  let mode = 0 // 0 = menus, 1 = histoire
  let etape = 0
  let modeV = 0
  let p = 0
  let rot = 0
  let t = 0
  let raf = 0
  let visible = true
  let detruit = false
  const horloge = new THREE.Clock()

  // ---------------------------------------------------------------- Boucle
  function boucle() {
    raf = 0
    if (detruit || document.hidden || !visible) return
    raf = requestAnimationFrame(boucle)
    const dt = Math.min(horloge.getDelta(), 0.1)
    if (!reduit) t += dt // réduit : pas d'animation automatique
    const v = reduit ? 1 : 0.07
    modeV += (mode - modeV) * v
    p += (etape - p) * v

    // Carrousel : le menu choisi vient devant
    rot += ((-menu * Math.PI * 2) / MENUS.length - rot) * v
    carrousel.position.set(0, 0.45, -RAYON + 0.6)
    carrousel.scale.setScalar(Math.max(1 - modeV, 0.0001))
    carrousel.visible = modeV < 0.99
    meds.forEach(({ g, sym }, i) => {
      const a = (i * Math.PI * 2) / MENUS.length + rot
      g.position.set(Math.sin(a) * RAYON, Math.sin(t * 1.2 + i) * 0.06, Math.cos(a) * RAYON)
      const devant = (Math.cos(a) + 1) / 2
      g.scale.setScalar(0.55 + 0.55 * Math.pow(devant, 3))
      g.rotation.y = Math.sin(t * 0.7 + i) * 0.25
      sym.rotation.y = t * 0.8
    })

    // Histoire courante
    const e = etatHistoire(dest, p)
    const f = modeV
    ACTEURS.forEach((nom) => poser(acteurs[nom], e[nom], f))
    const an = e.an * f
    anneau.visible = an > 0.01
    anneau.scale.setScalar(Math.max(an, 0.0001))
    anneau.position.y = 0.35
    anneau.rotation.y = -t * 0.4
    com.mini.forEach((m, j) => {
      m.visible = j < Math.round(e.mini)
      m.rotation.y = t + j
    })
    or.emissiveIntensity = 0.25 + 0.35 * e.glow * (0.8 + 0.2 * Math.sin(t * 3))
    A.rotation.y = t * 0.45
    B.rotation.y = -t * 0.45 + 1
    acteurs.coeur.rotation.y = t * 1.2
    chaine.children.forEach((c, j) => {
      c.position.y = Math.sin(t * 2.5 - j * 0.8) * 0.15
    })
    PERSONNES.forEach((nom, j) => {
      acteurs[nom].rotation.y = Math.sin(t * 0.6 + j) * 0.25
    })

    // Caméra : vue menus ↔ vue histoire
    const c = mix([0, 0.7, 6.2, 0, 0.3, -1.2], e.cam, modeV)
    camera.position.set(c[0] + Math.sin(t * 0.2) * 0.12, c[1], c[2])
    camera.lookAt(c[3], c[4], c[5])

    // Étincelles autour de la tasse offerte
    const vis = acteurs.B.visible ? acteurs.B.scale.x : 0
    const bp = acteurs.B.position
    for (let j = 0; j < NB_ETINCELLES; j++) {
      const [ang, r, y, s] = graines[j]
      const a2 = ang + t * (0.4 + s * 0.6)
      sPos[j * 3] = bp.x + Math.cos(a2) * r * vis * 1.6
      sPos[j * 3 + 1] = bp.y + y * vis + Math.sin(t * 2 + j) * 0.05
      sPos[j * 3 + 2] = bp.z + Math.sin(a2) * r * vis
    }
    sp.attributes.position.needsUpdate = true
    etincelles.material.opacity = 0.9 * Math.min(1, vis)

    renderer.render(scene, camera)
  }

  // Relance la boucle si elle est en pause et que le canvas est de nouveau visible
  function relancer() {
    if (raf || detruit || document.hidden || !visible) return
    horloge.getDelta() // ignore le temps passé en pause
    raf = requestAnimationFrame(boucle)
  }

  // ---------------------------------------------------------------- Observateurs
  const ro = new ResizeObserver(redimensionner)
  ro.observe(canvas)
  const io = new IntersectionObserver((entrees) => {
    visible = entrees[entrees.length - 1].isIntersecting
    relancer()
  })
  io.observe(canvas)
  document.addEventListener('visibilitychange', relancer)
  relancer()

  // ---------------------------------------------------------------- Libération de la mémoire GPU
  function detruire() {
    if (detruit) return
    detruit = true
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    ro.disconnect()
    io.disconnect()
    document.removeEventListener('visibilitychange', relancer)

    const geometries = new Set([sg])
    const materiaux = new Set([ciel])
    const textures = new Set()
    scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry)
      if (o.material) [].concat(o.material).forEach((m) => materiaux.add(m))
    })
    materiaux.forEach((m) => {
      Object.values(m).forEach((v) => {
        if (v && v.isTexture) textures.add(v)
      })
    })
    geometries.forEach((g) => g.dispose())
    materiaux.forEach((m) => m.dispose())
    textures.forEach((tx) => tx.dispose())
    soleil.shadow.map?.dispose()
    cible.dispose()
    pmrem.dispose()
    scene.environment = null
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return {
    choisirMenu(i) {
      menu = i
    },
    ouvrirHistoire(d) {
      dest = d
      mode = 1
      etape = 0
      p = 0
    },
    etape(n) {
      etape = n
    },
    fermerHistoire() {
      mode = 0
    },
    detruire,
  }
}
