import { Route, Routes } from 'react-router'
import FicheRequise from './components/FicheRequise.jsx'
import Layout from './components/Layout.jsx'
import RouteProtegee from './components/RouteProtegee.jsx'
import Abonnement from './pages/Abonnement.jsx'
import Accueil from './pages/Accueil.jsx'
import AccueilCommercant from './pages/AccueilCommercant.jsx'
import AccueilMembre from './pages/AccueilMembre.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Connexion from './pages/Connexion.jsx'
import Economies from './pages/Economies.jsx'
import FicheCommerce from './pages/FicheCommerce.jsx'
import FormulaireOffre from './pages/FormulaireOffre.jsx'
import Inscription from './pages/Inscription.jsx'
import MesOffres from './pages/MesOffres.jsx'
import PageIntrouvable from './pages/PageIntrouvable.jsx'
import TableauDeBord from './pages/TableauDeBord.jsx'

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
        <Route path="economies" element={<Economies />} />
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route element={<RouteProtegee role="membre" />}>
          <Route path="membre" element={<AccueilMembre />} />
          <Route path="abonnement" element={<Abonnement />} />
        </Route>

        {/* Parcours commerçant (Dev B) : fiche, offres, tableau de bord */}
        <Route element={<RouteProtegee role="commercant" />}>
          <Route path="commercant/fiche" element={<FicheCommerce />} />
          <Route element={<FicheRequise />}>
            <Route path="commercant" element={<AccueilCommercant />} />
            <Route path="commercant/offres" element={<MesOffres />} />
            <Route path="commercant/offres/nouvelle" element={<FormulaireOffre />} />
            <Route path="commercant/offres/:id/modifier" element={<FormulaireOffre />} />
            <Route path="commercant/tableau-de-bord" element={<TableauDeBord />} />
          </Route>
        </Route>

        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  )
}
