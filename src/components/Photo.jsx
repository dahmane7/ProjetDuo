import { useState } from 'react'
import { categorie } from '../lib/categories.js'
import { photoUrl } from '../lib/exemples.js'
import Icon from './Icon.jsx'

// Photo d'un commerce ou d'une catégorie ; sans photo (ou si elle ne charge pas),
// on affiche le dégradé et l'icône de la catégorie
export default function Photo({ id, nomCategorie, largeur, hauteur, className = '', iconeClassName = 'size-12' }) {
  const [erreur, setErreur] = useState(false)
  const cat = categorie(nomCategorie)

  if (!id || erreur) {
    return (
      <div className={`grid place-items-center ${cat.visuel} ${className}`}>
        <Icon name={cat.icone} className={`text-white/80 ${iconeClassName}`} />
      </div>
    )
  }

  return (
    <img
      src={photoUrl(id, largeur, hauteur)}
      alt=""
      loading="lazy"
      onError={() => setErreur(true)}
      className={`bg-creme/10 object-cover ${className}`}
    />
  )
}
