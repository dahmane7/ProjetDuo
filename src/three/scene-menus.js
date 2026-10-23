// Scène 3D de l'accueil : carrousel des 6 menus (un médaillon par menu) et histoires animées.
// Chargée uniquement par import() dynamique depuis MenusCarrousel : Three.js reste dans son propre fichier.
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { MENUS } from '../lib/menus.js'
import { DUREE_ECLAT, GRAVITE, eclatement, goutte } from './eclat.js'
import policeTwins from './police-twins.json'
import { ACTEURS, etatHistoire } from './histoires.js'

const RAYON = 2.7
const NB_ETINCELLES = 70
const NB_ONDES = 3 // ondes d'eau simultanées au toucher
const DUREE_ONDE = 1.4 // secondes
const COULEE = 0.7 // secondes : le médaillon touché coule puis reprend sa forme
const NB_GOUTTES = 34 // gouttes de chaque sauce (mayonnaise, ketchup) quand la boule Twins éclate

// Police des lettres 3D « twins » : Gentilis Bold (SIL OFL), réduite aux cinq lettres utiles
const POLICE_TWINS = new FontLoader().parse(policeTwins)

// Lumière futuriste derrière le médaillon de devant : deux anneaux de LED où la lumière court et les couleurs défilent
const LUMIERE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const LUMIERE_FRAGMENT = /* glsl */ `
  uniform float uT;
  uniform float uForce;
  uniform float uRatio;
  varying vec2 vUv;
  // Couleur d'une LED : corail → or → violet, qui défile le long de l'anneau
  vec3 teinte(float x) {
    vec3 corail = vec3(1.0, 0.42, 0.40);
    vec3 orc = vec3(1.0, 0.80, 0.42);
    vec3 violet = vec3(0.60, 0.42, 1.0);
    float k = fract(x) * 3.0;
    if (k < 1.0) return mix(corail, orc, k);
    if (k < 2.0) return mix(orc, violet, k - 1.0);
    return mix(violet, corail, k - 2.0);
  }

  // Anneau de n LED de rayon R ; une vague de lumière court le long de l'anneau (sens et vitesse v)
  vec3 anneauLed(vec2 p, float R, float n, float taille, float v, float decalage) {
    float r = length(p);
    float u = atan(p.y, p.x) / 6.2831853 + 0.5;
    float id = floor(u * n);
    float arc = (fract(u * n) - 0.5) / n * 6.2831853 * R;
    float d = length(vec2(arc, r - R));
    float vague = pow(0.5 + 0.5 * sin((id / n) * 6.2831853 * 2.0 - uT * v), 4.0);
    float eclat = 0.18 + 0.82 * vague;
    float led = smoothstep(taille, taille * 0.35, d);
    float aura = exp(-d * d / (taille * taille * 6.0)) * 0.55;
    return teinte(id / n + uT * 0.05 + decalage) * (led + aura) * eclat;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uRatio;
    float r = length(p);
    vec3 col = anneauLed(p, 0.212, 48.0, 0.0085, 3.0, 0.0)
      + anneauLed(p, 0.243, 64.0, 0.006, -2.2, 0.33);
    // Léger rétroéclairage diffus entre les deux anneaux
    col += teinte(uT * 0.05) * exp(-pow(r - 0.228, 2.0) * 900.0) * 0.12;
    vec3 c = col * uForce;
    gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
  }
`

// Mélange « lumière ajoutée » : couleur et opacité s'additionnent, le canvas reste transparent hors lumière
const LUMIERE_AJOUTEE = {
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
}

// Onde d'eau au toucher : cercles concentriques qui s'élargissent puis s'évanouissent
const ONDE_FRAGMENT = /* glsl */ `
  uniform float uK;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float front = uK * 1.05;
    float vagues = sin((d - front) * 38.0) * 0.5 + 0.5;
    float bande = smoothstep(0.35, 0.0, front - d) * step(d, front);
    float bord = 1.0 - smoothstep(0.85, 1.0, d);
    float fondu = pow(1.0 - uK, 1.6);
    vec3 eau = mix(vec3(0.75, 0.95, 1.0), vec3(1.0, 0.85, 0.55), d);
    float i = vagues * bande * bord * fondu;
    vec3 c = eau * i * 1.4;
    gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
  }
`
const PERSONNES = ['toi', 'ami', 'voisine', 'sdf', 'etudiant', 'suivant']
const LISSAGE = 0.07 // part de l'écart rattrapée à chaque image (menu, mode, étape)

const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)

// Place un acteur : position [x, y, z], échelle s[3] × f (f = avancement du mode histoire)
function poser(o, s, f) {
  o.position.set(s[0], s[1], s[2])
  const sc = Math.max(s[3] * f, 0.0001)
  o.scale.setScalar(sc)
  o.visible = sc > 0.01
}

// Texture de texte dessinée sur un canvas 2D (contour : couleur d'un liseré qui détache le texte du fond)
function texte(t, w, h, taille, couleur, contour) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.fillStyle = couleur
  x.font = `900 ${taille}px Fraunces, serif`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  if (contour) {
    x.lineJoin = 'round'
    x.lineWidth = taille * 0.14
    x.strokeStyle = contour
    x.strokeText(t, w / 2, h / 2)
  }
  x.fillText(t, w / 2, h / 2)
  const tx = new THREE.CanvasTexture(c)
  tx.colorSpace = THREE.SRGBColorSpace
  return tx
}

// Si la construction échoue une fois le renderer créé, on libère son contexte GL avant de relancer l'erreur
export function creerSceneMenus(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  try {
    return construire(canvas, renderer)
  } catch (err) {
    renderer.dispose()
    renderer.forceContextLoss()
    throw err
  }
}

function construire(canvas, renderer) {
  // ---------------------------------------------------------------- Moteur
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
  // Le menu 1 porte le logo Twins : une boule laquée prune cerclée d'or, avec « twins » en lettres 3D
  // (crème, le « s » en or comme le logo de l'en-tête). Au toucher, elle éclate en gouttes de
  // mayonnaise et de ketchup qui retombent, puis se reforme (rythme : eclat.js).
  function bouleTwins(g) {
    const corps = new THREE.Group()
    g.add(corps)
    const matBoule = new THREE.MeshPhysicalMaterial({ color: 0x5a1f45, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: 0xffb37a, emissiveIntensity: 0 })
    corps.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 48), matBoule))
    corps.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 12, 96), or))

    // Lettres 3D posées côte à côte (« twin » puis « s »), puis centrées devant la boule
    const lettres = new THREE.Group()
    const creme = new THREE.MeshPhysicalMaterial({ color: 0xfff4ea, roughness: 0.3, clearcoat: 1, envMapIntensity: 1.1 })
    let x = 0
    for (const [mot, mat] of [['twin', creme], ['s', or]]) {
      const geo = new TextGeometry(mot, { font: POLICE_TWINS, size: 0.32, height: 0.14, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.015, bevelSegments: 3 })
      geo.computeBoundingBox()
      const l = new THREE.Mesh(geo, mat)
      l.position.x = x
      x += geo.boundingBox.max.x + 0.01
      lettres.add(l)
    }
    const b = new THREE.Box3().setFromObject(lettres)
    lettres.position.set(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, 0.8)
    corps.add(lettres)

    // Gouttes de mayonnaise et de ketchup, lancées depuis la surface, surtout vers l'avant et le haut
    const geoGoutte = new THREE.SphereGeometry(0.055, 14, 10)
    const sauces = [0xf6e7b4, 0xc8261b].map((couleur) => {
      const inst = new THREE.InstancedMesh(
        geoGoutte,
        new THREE.MeshPhysicalMaterial({ color: couleur, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 }),
        NB_GOUTTES,
      )
      inst.raycast = () => {} // le toucher vise la boule, pas les gouttes
      inst.visible = false
      g.add(inst)
      const gouttes = Array.from({ length: NB_GOUTTES }, () => {
        const d = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 1.6 - 0.4, Math.random() * 0.9 + 0.2).normalize()
        return {
          depart: d.clone().multiplyScalar(0.85).toArray(),
          v: d.multiplyScalar(1.6 + Math.random() * 1.8).add(new THREE.Vector3(0, 1.2, 0)).toArray(),
          taille: 0.5 + Math.random() * 1,
        }
      })
      return { inst, gouttes }
    })
    return { g, sym: new THREE.Group(), touche: -10, twins: { corps, matBoule, sauces } }
  }

  // Place chaque goutte de sauce k secondes après le toucher, étirée dans le sens de sa course
  const matrice = new THREE.Matrix4()
  const sens = new THREE.Quaternion()
  const vecteur = new THREE.Vector3()
  const echelle = new THREE.Vector3()
  const HAUT = new THREE.Vector3(0, 1, 0)
  function animerSauces(sauces, k) {
    sauces.forEach(({ inst, gouttes }) => {
      inst.visible = k >= 0 && k < DUREE_ECLAT
      if (!inst.visible) return
      gouttes.forEach((gt, n) => {
        const p = goutte(gt, k)
        vecteur.set(gt.v[0], gt.v[1] - GRAVITE * k, gt.v[2])
        const vitesse = vecteur.length()
        sens.setFromUnitVectors(HAUT, vecteur.normalize())
        echelle.set(p.taille, p.taille * (1 + vitesse * 0.35), p.taille)
        matrice.compose(vecteur.set(p.x, p.y, p.z), sens, echelle)
        inst.setMatrixAt(n, matrice)
      })
      inst.instanceMatrix.needsUpdate = true
    })
  }

  function medaillon(i) {
    const g = new THREE.Group()
    g.userData.index = i
    if (i === 0) return bouleTwins(g)
    const matDisque = new THREE.MeshPhysicalMaterial({ color: 0xffe9dc, roughness: 0.08, transmission: 0.7, thickness: 0.4, clearcoat: 1, iridescence: 0.5, envMapIntensity: 1.2, emissive: 0x9fe8ff, emissiveIntensity: 0 })
    const disque = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 64), matDisque)
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
    return { g, sym, matDisque, touche: -10 }
  }
  const carrousel = new THREE.Group()
  scene.add(carrousel)
  // Chaque médaillon a ses anneaux de LED derrière lui (même lumière que celle de devant, en petit).
  // Plan carré : les anneaux du shader (rayons 0,212 et 0,243) entourent le médaillon de rayon 0,95.
  const geoLed = new THREE.PlaneGeometry(5, 5)
  const meds = MENUS.map((_, i) => {
    const m = medaillon(i)
    const led = new THREE.Mesh(
      geoLed,
      new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uForce: { value: 0 }, uRatio: { value: 1 } },
        vertexShader: LUMIERE_VERTEX,
        fragmentShader: LUMIERE_FRAGMENT,
        transparent: true,
        ...LUMIERE_AJOUTEE,
        depthWrite: false,
      }),
    )
    led.position.z = -0.3
    led.renderOrder = -1
    led.raycast = () => {} // le toucher vise le médaillon, pas sa lumière
    m.g.add(led)
    m.led = led
    carrousel.add(m.g)
    return m
  })

  // ---------------------------------------------------------------- Lumière futuriste derrière le médaillon de devant
  const lumiere = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 7),
    new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uForce: { value: 1 }, uRatio: { value: 10 / 7 } },
      vertexShader: LUMIERE_VERTEX,
      fragmentShader: LUMIERE_FRAGMENT,
      transparent: true,
      ...LUMIERE_AJOUTEE,
      depthWrite: false,
    }),
  )
  lumiere.position.set(0, 0.5, -1.4)
  lumiere.renderOrder = -1
  scene.add(lumiere)

  // ---------------------------------------------------------------- Ondes d'eau (réutilisées à tour de rôle)
  const geoOnde = new THREE.PlaneGeometry(4.4, 4.4)
  const ondes = Array.from({ length: NB_ONDES }, () => {
    const m = new THREE.Mesh(
      geoOnde,
      new THREE.ShaderMaterial({
        uniforms: { uK: { value: 1 } },
        vertexShader: LUMIERE_VERTEX,
        fragmentShader: ONDE_FRAGMENT,
        transparent: true,
        ...LUMIERE_AJOUTEE,
        depthWrite: false,
      }),
    )
    m.visible = false
    m.userData.debut = -10
    scene.add(m)
    return m
  })
  let prochaineOnde = 0
  const lanceur = new THREE.Raycaster()

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
    t += dt
    modeV += (mode - modeV) * LISSAGE
    p += (etape - p) * LISSAGE

    // Carrousel : le menu choisi vient devant
    rot += ((-menu * Math.PI * 2) / MENUS.length - rot) * LISSAGE
    carrousel.position.set(0, 0.45, -RAYON + 0.6)
    carrousel.scale.setScalar(Math.max(1 - modeV, 0.0001))
    carrousel.visible = modeV < 0.99
    meds.forEach((m, i) => {
      const { g, sym, matDisque } = m
      const a = (i * Math.PI * 2) / MENUS.length + rot
      g.position.set(Math.sin(a) * RAYON, Math.sin(t * 1.2 + i) * 0.06, Math.cos(a) * RAYON)
      const devant = (Math.cos(a) + 1) / 2
      const s = 0.55 + 0.55 * Math.pow(devant, 3)
      // Touché : le médaillon coule comme une goutte (s'étire vers le bas en s'affinant),
      // puis reprend sa forme en ondulant comme de l'eau qui se calme.
      // La boule Twins, elle, ne coule pas : elle éclate en mayonnaise et ketchup puis se reforme (eclat.js)
      const k = t - m.touche
      let etire = 0
      if (m.twins) {
        const { f, flash } = eclatement(k)
        m.twins.corps.scale.setScalar(Math.max(1 - f, 0.001))
        m.twins.matBoule.emissiveIntensity = 0.8 * flash
        animerSauces(m.twins.sauces, k)
      } else if (k >= 0 && k < COULEE) {
        const e = Math.sin((k / COULEE) * Math.PI) // 0 → 1 → 0
        etire = 0.75 * e * e
      } else if (k >= COULEE && k < COULEE + 1) {
        const k2 = k - COULEE
        etire = -0.12 * Math.sin(k2 * 16) * Math.exp(-k2 * 5)
      }
      g.scale.set(s * (1 - etire * 0.4), s * (1 + etire), s)
      g.position.y -= etire * 0.95 * s // l'étirement part du haut : la goutte tombe
      if (matDisque) matDisque.emissiveIntensity = k >= 0 && k < COULEE + 1 ? 1.4 * Math.exp(-k * 3) : 0
      // LED du médaillon : allumées sur les côtés, elles s'effacent devant où la grande lumière prend le relais
      m.led.material.uniforms.uT.value = t + i * 0.7
      m.led.material.uniforms.uForce.value = (1 - modeV) * 0.85 * (1 - Math.pow(devant, 6))
      g.rotation.y = Math.sin(t * 0.7 + i) * 0.25
      sym.rotation.y = t * 0.8
    })

    // Lumière : respire en mode menus, s'efface pendant une histoire
    lumiere.material.uniforms.uT.value = t
    lumiere.material.uniforms.uForce.value = (1 - modeV) * (0.9 + 0.1 * Math.sin(t * 1.3))
    lumiere.visible = modeV < 0.99

    ondes.forEach((o) => {
      const k = (t - o.userData.debut) / DUREE_ONDE
      o.visible = k >= 0 && k < 1
      if (o.visible) {
        o.material.uniforms.uK.value = k
        o.quaternion.copy(camera.quaternion)
      }
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
  // Les deux sont créés avant d'observer : si l'un manque, rien n'est resté branché sur le canvas
  const ro = new ResizeObserver(redimensionner)
  const io = new IntersectionObserver((entrees) => {
    visible = entrees[entrees.length - 1].isIntersecting
    relancer()
  })
  ro.observe(canvas)
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
    // Toucher en coordonnées normalisées du canvas (-1 à 1) : lance l'onde d'eau sur le médaillon touché
    // et renvoie son index, ou -1 si le toucher tombe à côté
    toucher(x, y) {
      if (mode !== 0 || detruit) return -1
      lanceur.setFromCamera(new THREE.Vector2(x, y), camera)
      const hit = lanceur.intersectObjects(meds.map((m) => m.g), true)[0]
      if (!hit) return -1
      let o = hit.object
      while (o && o.userData.index === undefined) o = o.parent
      if (!o) return -1
      const m = meds[o.userData.index]
      m.touche = t
      const onde = ondes[prochaineOnde]
      prochaineOnde = (prochaineOnde + 1) % NB_ONDES
      onde.position.copy(hit.point).addScaledVector(lanceur.ray.direction, -0.05)
      onde.userData.debut = t
      relancer()
      return o.userData.index
    },
    detruire,
  }
}
