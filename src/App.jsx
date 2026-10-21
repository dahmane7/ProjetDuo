import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import PageIntrouvable from './pages/PageIntrouvable.jsx'

// Une route par page. Chaque story ajoute ses routes ici :
// parcours membre (Dev A) et parcours commerçant (Dev B) dans deux blocs séparés
// pour éviter les conflits de fusion.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />

        {/* Parcours membre (Dev A) : connexion, abonnement, catalogue, offre, économies */}

        {/* Parcours commerçant (Dev B) : fiche, offres, tableau de bord */}

        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  )
}
