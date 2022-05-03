import { Link } from "react-router-dom";
import styledComponents from "styled-components";

const Nav = () => {
    return (
        <nav className="navNav">
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>|</li>
                <li>
                    <Link to="/login">Connexion</Link>
                </li>
                <li>|</li>
                <li>
                    <Link to="/Tests">tests</Link>
                </li>
                <li>|</li>
                <li>
                    <Link to="/Dashboard">Dashboard</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;
