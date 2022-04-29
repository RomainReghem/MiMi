import { Link } from "react-router-dom";
import styledComponents from "styled-components";

const Nav = () => {
    return (
        <nav>
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
                    <Link to="/dashboard">Page réservée aux connectés</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;
