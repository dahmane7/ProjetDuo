// Les 6 menus du carrousel d'accueil, dans l'ordre d'affichage.
// titre + titreOr : le titre, dont la seconde partie s'affiche en or ;
// court : accroche courte ; dest : destinataire du « offert » (clé de la scène 3D) ;
// disponible : seul le menu 1 (1 acheté, 1 offert) est ouvert aux abonnés ;
// etapes : les 4 écrans de l'histoire du menu.
export const MENUS = [
  {
    id: 'duo',
    titre: '1 acheté,',
    titreOr: '1 offert',
    court: 'Pour toi et ton duo',
    texte: 'Le classique : le deuxième, tu le partages avec qui tu veux.',
    dest: 'ami',
    disponible: true,
    etapes: [
      { titre: 'Tu entres', texte: 'Un cappuccino au Café des Pentes. Rien de spécial…' },
      { titre: 'Il se dédouble', texte: 'Tu montres Duo, le commerçant tape son code : ton achat se dédouble en or.' },
      { titre: 'Pour ton duo', texte: 'Le deuxième est pour ton ami. Même prix, deux sourires.' },
      { titre: 'À deux, c\'est mieux', texte: 'Café, brunch, massage, bowling : partout, le deuxième est offert.' },
    ],
  },
  {
    id: 'voisine',
    titre: '1 pour vous,',
    titreOr: '1 pour la voisine',
    court: 'Le geste de palier',
    texte: 'Le deuxième part chez ta voisine : un croissant, un bouquet, un café.',
    dest: 'voisine',
    disponible: false,
    etapes: [
      { titre: 'Le matin', texte: 'Tu passes à la boulangerie avant le travail.' },
      { titre: 'Il se dédouble', texte: 'Ton croissant se dédouble…' },
      { titre: 'Pour la voisine', texte: 'Le deuxième, tu le déposes chez Madame Martin, au 3ᵉ. Elle ne sort plus beaucoup.' },
      { titre: 'Un quartier qui se parle', texte: 'Un petit geste, et l\'immeuble devient un village.' },
    ],
  },
  {
    id: 'solidaire',
    titre: '1 pour vous,',
    titreOr: '1 pour un sans-abri',
    court: 'Duo solidaire',
    texte: 'Le deuxième est mis en attente chez le commerçant, pour qui en a besoin.',
    dest: 'sdf',
    disponible: false,
    etapes: [
      { titre: 'Tu commandes', texte: 'Un plat du jour au Bistrot du coin.' },
      { titre: 'Il se dédouble', texte: 'Ton plat se dédouble en or…' },
      { titre: 'Mis en attente', texte: 'Tu choisis « solidaire » : le deuxième rejoint l\'étagère des duos en attente.' },
      { titre: 'Pour qui en a besoin', texte: 'Plus tard, quelqu\'un le demande au comptoir. Sans app, sans justificatif, avec dignité.' },
    ],
  },
  {
    id: 'jour',
    titre: 'Le duo',
    titreOr: 'du jour',
    court: 'Même gamme, aujourd\'hui seulement',
    texte: 'Chaque jour, un commerce à l\'honneur : le second de la même gamme est offert.',
    dest: 'jour',
    disponible: false,
    etapes: [
      { titre: 'Ce matin', texte: 'L\'app t\'annonce le duo du jour : Pizza Mamma.' },
      { titre: 'Il se dédouble', texte: 'Une pizza achetée…' },
      { titre: 'Même gamme', texte: '…une pizza de la même gamme offerte. Aujourd\'hui seulement.' },
      { titre: 'Ne le rate pas', texte: 'Demain, un autre commerce. Chaque jour, une raison de sortir.' },
    ],
  },
  {
    id: 'etudiant',
    titre: '1 pour vous,',
    titreOr: '1 pour un étudiant',
    court: 'Le coup de pouce',
    texte: 'Le deuxième finance le repas d\'un étudiant du quartier.',
    dest: 'etudiant',
    disponible: false,
    etapes: [
      { titre: 'Ta pause', texte: 'Un bol au Bol Vert, près de la fac.' },
      { titre: 'Il se dédouble', texte: 'Ton bol se dédouble…' },
      { titre: 'Pour un étudiant', texte: 'Le deuxième va à un étudiant qui finit le mois sur la corde raide.' },
      { titre: 'Bon appétit, Léo', texte: 'Il mange chaud ce midi. Toi, tu as payé un seul repas.' },
    ],
  },
  {
    id: 'suivant',
    titre: '1 pour vous,',
    titreOr: '1 pour le suivant',
    court: 'La chaîne Duo',
    texte: 'Le deuxième va au client suivant, qui peut à son tour l\'offrir au suivant.',
    dest: 'suivant',
    disponible: false,
    etapes: [
      { titre: 'Au comptoir', texte: 'Tu prends ton café, il y a du monde derrière toi.' },
      { titre: 'Il se dédouble', texte: 'Ton café se dédouble…' },
      { titre: 'Au suivant !', texte: 'Le deuxième est offert à la personne derrière toi.' },
      { titre: 'La chaîne continue', texte: 'Elle l\'offre à son tour au suivant. Combien de maillons aujourd\'hui ?' },
    ],
  },
]

// Clés des scènes 3D, dans le même ordre que MENUS.
export const DESTINATIONS = ['ami', 'voisine', 'sdf', 'jour', 'etudiant', 'suivant']

// Indice du menu voisin (delta = +1 suivant, -1 précédent), avec retour en boucle.
export const menuVoisin = (i, delta, n = MENUS.length) => (((i + delta) % n) + n) % n
