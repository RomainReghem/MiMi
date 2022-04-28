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
import Home from "./home"
import '../styles/App.css'
import '../styles/connexion.css'


/*const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { state } = useLocation();

  const handleLogin = () => {
    login().then(() => {
      navigate(state?.path || "/");
    });
  };

  return (
    <Connexion log = {() => handleLogin()} />
  );
};*/

function Nav() {
  /*
  const { authed, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  */

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

/*function RequireAuth({ children }) {
  const { authed } = useAuth();
  const location = useLocation();

  return authed === true ? (
    children
  ) : (
    <Navigate to="/connexion" replace state={{ path: location.pathname }} />
  );
}*/

export default function App() {
  return (
    <div style={{height: "100%"}}>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />

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