import * as React from "react";
import {
  Link,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation
} from "react-router-dom";
import useAuth from "../utils/hooks/useAuth";
import Protected from "./protected";
import Connexion from "./connexion";
import Inscription from "./inscription";
import InscriptionClasse from "./inscriptionClasse"
import Choix from "./choix"
import Home from "./home"
import '../styles/App.css'
import '../styles/connexion.css'

function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>|</li>
        <li>
           <Link to="/connexion">Connexion</Link>
        </li>
        <li>|</li>
        <li>
          <Link to="/protected">Page réservée aux connectés</Link>
        </li>
      </ul>
      {/*{authed && <button onClick={handleLogout}>Logout</button>}*/}
    </nav>
  );
}

export default function App() {
  return (
    <div style={{height: "100%", width:"100%", display:"flex", flexDirection:"column"}}>
      <div className="top-border"/>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionClasse" element={<InscriptionClasse/>}/>
        <Route path="/choix" element={<Choix/>}/>

        <Route
          path="/protected"
          element={
              <Protected />
          }
        />
        <Route path="/connexion" element={<Connexion />} />
      </Routes>
    </div>
  );
}