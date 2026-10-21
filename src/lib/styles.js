// Classes Tailwind partagées par les écrans crépuscule.
// Elles sont écrites en entier ici : Tailwind ne détecte pas une classe construite morceau par morceau.

// Bouton principal : dégradé chaud abricot, corail puis rose, texte prune, au moins 48 px de haut
export const BOUTON_PRINCIPAL =
  'flex min-h-12 items-center justify-center rounded-[18px] bg-linear-to-r from-[#ffd9a0] via-corail to-duo-500 px-4 py-3.5 text-center text-[15px] font-extrabold text-prune shadow-[0_12px_30px_rgba(255,120,100,0.4)]'

// Teinte du verre « fumé » des panneaux de contenu, à poser à côté du verre :
// le texte creme reste lisible (AA) quand le panneau passe sous le halo abricot du haut de l'écran
export const VERRE_FUME = 'bg-nuit/55'

// Titre de page en Fraunces ; l'ombre portée sombre le détache du halo abricot
export const TITRE_PAGE =
  'font-titre text-[30px] leading-[0.98] font-black tracking-[-1.2px] drop-shadow-[0_2px_14px_rgba(22,10,20,0.6)] sm:text-[44px]'

// Texte en dégradé chaud. À poser sur un élément en ligne (span) et non en bloc :
// le fond découpé couvre alors toute la hauteur des lettres (accents, jambages)
export const TEXTE_CHAUD =
  'bg-linear-to-r from-[#ffd9a0] via-abricot via-40% to-duo-500 bg-clip-text text-transparent'
