// Classes Tailwind partagées par les écrans crépuscule.
// Elles sont écrites en entier ici : Tailwind ne détecte pas une classe construite morceau par morceau.

// Bouton principal : dégradé chaud abricot, corail puis rose, texte prune, au moins 48 px de haut
export const BOUTON_PRINCIPAL =
  'flex min-h-12 items-center justify-center rounded-[18px] bg-linear-to-r from-[#ffd9a0] via-corail to-duo-500 px-4 py-3.5 text-center text-[15px] font-extrabold text-prune shadow-[0_12px_30px_rgba(255,120,100,0.4)]'

// Teinte du verre « fumé » des panneaux de contenu, à poser à côté du verre :
// le texte creme reste lisible (AA) sur le halo abricot du haut de page
export const VERRE_FUME = 'bg-nuit/55'

// Titre de page en Fraunces. L'ombre portée ne fait que du relief : le contraste AA (au moins 3:1)
// vient du réglage du halo dans index.css et des teintes claires de TEXTE_CHAUD
export const TITRE_PAGE =
  'font-titre text-[30px] leading-[0.98] font-black tracking-[-1.2px] drop-shadow-[0_2px_14px_rgba(22,10,20,0.6)] sm:text-[44px]'

// Texte en dégradé chaud (pêche, abricot, corail clair) : toutes ses teintes restent assez claires
// pour un contraste AA sur le halo. À poser sur un élément en ligne (span) et non en bloc :
// le fond découpé couvre alors toute la hauteur des lettres (accents, jambages)
export const TEXTE_CHAUD =
  'bg-linear-to-r from-[#ffe2b4] via-abricot via-45% to-[#ffa096] bg-clip-text text-transparent'
