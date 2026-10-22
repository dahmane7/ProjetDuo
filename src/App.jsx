import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import RouteProtegee from './components/RouteProtegee.jsx'
import Abonnement from './pages/Abonnement.jsx'
import Accueil from './pages/Accueil.jsx'
import AccueilCommercant from './pages/AccueilCommercant.jsx'
import AccueilMembre from './pages/AccueilMembre.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
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
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route element={<RouteProtegee role="membre" />}>
          <Route path="membre" element={<AccueilMembre />} />
          <Route path="abonnement" element={<Abonnement />} />
        </Route>

        {/* Parcours commerçant (Dev B) : fiche, offres, tableau de bord */}
        <Route element={<RouteProtegee role="commercant" />}>
          <Route path="commercant" element={<AccueilCommercant />} />
        </Route>

        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  )
}
