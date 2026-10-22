// États 3D des histoires : positions [x, y, z, échelle] de chaque acteur, par étape (0 à 3).
// Données et calculs purs : aucun import Three.js, aucun DOM.

export const ACTEURS = ['A', 'B', 'toi', 'ami', 'voisine', 'sdf', 'etudiant', 'suivant', 'com', 'maison', 'coeur', 'chaine']

// Tout est caché (échelle 0) : chaque étape ne déclare que ce qui apparaît ou bouge.
const CACHE = { A: [0, .25, 0, 0], B: [0, .25, 0, 0], toi: [-4, 0, 0, 0], ami: [4, 0, 0, 0], voisine: [4, 0, 0, 0], sdf: [4, 0, 1, 0], etudiant: [4, 0, 0, 0], suivant: [4, 0, 0, 0], com: [0, 0, -3, 0], maison: [3, 0, -2, 0], coeur: [0, 1, 0, 0], chaine: [0, .3, 0, 0], an: 0, mini: 0, glow: 0, cam: [0, .6, 6.6, 0, .1, 0] }
// Étape 1 commune : on entre chez le commerçant, une tasse achetée.
const ent = { toi: [-.7, 0, 0, 1], A: [.55, .05, .6, 1], com: [.3, 0, -1.6, 1], cam: [0, .7, 6.6, 0, 0, 0] }
// Étape 2 commune : la seconde tasse est offerte.
const dbl = { toi: [-1.2, 0, 0, 1], A: [-.05, .05, .6, 1], B: [1.25, .15, .6, 1], com: [.3, 0, -1.6, 1], glow: 1, cam: [.2, .6, 6.4, .2, 0, 0] }
const S = (o) => ({ ...CACHE, ...o })

export const HISTOIRES = {
  ami: [S(ent), S(dbl), S({ toi: [-1.6, 0, 0, 1], A: [-.6, .05, .7, 1], B: [1.35, .05, .7, 1], ami: [2.3, 0, 0, 1], com: [.3, 0, -1.8, 1], glow: 1, cam: [.3, .7, 7.8, .3, 0, 0] }), S({ toi: [-.9, 0, .3, 1], ami: [.9, 0, .3, 1], A: [-.5, .05, 1.1, .8], B: [.5, .05, 1.1, .8], coeur: [0, 1.25, .3, .6], glow: 1, cam: [0, .6, 6, 0, .1, 0] })],
  voisine: [S(ent), S(dbl), S({ toi: [-1.8, 0, .2, 1], A: [-1, .05, .8, .9], B: [1.5, .3, .9, .8], maison: [2.4, 0, -1, 1], voisine: [1.9, 0, .5, 1], glow: 1, cam: [.5, .8, 8, .5, 0, 0] }), S({ maison: [0, 0, -1.6, 1.2], voisine: [.6, 0, .6, 1], toi: [-.7, 0, .6, 1], B: [.05, -.05, 1.2, .7], coeur: [0, 1.6, -.4, .5], glow: 1, cam: [0, .8, 6.6, 0, .1, 0] })],
  sdf: [S(ent), S(dbl), S({ toi: [-2.1, 0, .4, 1], A: [-1.2, .05, .9, .9], B: [1.45, .48, -.25, .42], com: [1.6, 0, -.6, 1], mini: 5, glow: 1, cam: [.4, .9, 8, .6, 0, 0] }), S({ com: [.6, 0, -.8, 1], mini: 6, sdf: [-1.3, 0, .9, 1], B: [-.6, .05, 1.3, .7], coeur: [-1.3, 1.2, .9, .45], glow: 1, cam: [-.2, .8, 7, -.2, .1, 0] })],
  jour: [S({ ...ent, com: [.3, 0, -1.6, 0] }), S({ ...dbl, com: [.3, 0, -1.6, 0] }), S({ toi: [-2.2, 0, -.4, 1], ami: [2.2, 0, -.4, 1], A: [-.6, .35, .5, 1.2], B: [.6, .35, .5, 1.2], an: 1, glow: 1, cam: [0, .7, 6.6, 0, .2, 0] }), S({ A: [-.65, .3, 0, 1.3], B: [.65, .3, 0, 1.3], an: 1.15, glow: 1, cam: [0, .5, 5.4, 0, .2, 0] })],
  etudiant: [S(ent), S(dbl), S({ toi: [-1.7, 0, 0, 1], A: [-.7, .05, .7, 1], B: [1.4, .05, .7, 1], etudiant: [2.3, 0, .1, 1], com: [.3, 0, -1.8, 1], glow: 1, cam: [.3, .7, 7.8, .3, 0, 0] }), S({ etudiant: [0, 0, .2, 1.1], B: [.75, .05, 1, .8], coeur: [0, 1.55, .2, .5], com: [.3, 0, -1.8, 1], glow: 1, cam: [0, .6, 5.6, 0, .2, 0] })],
  suivant: [S(ent), S(dbl), S({ toi: [-1.8, 0, .2, 1], A: [-1, .05, .8, .9], B: [.9, .05, .8, 1], suivant: [1.8, 0, .1, 1], com: [.3, 0, -1.8, 1], glow: 1, cam: [.2, .7, 7.6, .2, 0, 0] }), S({ chaine: [-.8, .4, .8, 1], suivant: [-2, 0, 0, 1], toi: [-3, 0, .3, 1], com: [.3, 0, -1.8, 1], glow: 1, cam: [0, .8, 7, 0, .2, 0] })],
}

// Smoothstep : 0 en 0, 0.5 en 0.5, 1 en 1, avec des départs et arrivées en douceur.
export const lisse = (x) => x * x * (3 - 2 * x)

const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)

// État interpolé de l'histoire `dest` à l'avancement `p` (borné à [0, 3]) ; objet neuf à chaque appel.
export function etatHistoire(dest, p) {
  const H = HISTOIRES[dest]
  const q = Math.min(Math.max(p, 0), 3)
  const i = Math.floor(q)
  const k = lisse(q - i)
  const a = H[i], b = H[Math.min(i + 1, 3)]
  const etat = { an: a.an + (b.an - a.an) * k, mini: a.mini + (b.mini - a.mini) * k, glow: a.glow + (b.glow - a.glow) * k, cam: mix(a.cam, b.cam, k) }
  ACTEURS.forEach((c) => { etat[c] = mix(a[c], b[c], k) })
  return etat
}
