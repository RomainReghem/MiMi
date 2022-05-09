import { Link } from "react-router-dom";
import styledComponents from "styled-components";
import useAuth from "../hooks/useAuth";
import Avatar, { AvatarFullConfig, genConfig } from 'react-nice-avatar'


const Nav = () => {
    const { auth } = useAuth();
    console.log(auth.avatarconfig);

    return (
        <>
            {!auth?.user ? (
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
                    </ul>
                </nav>
            ) : (
                <nav className="navNav">
                    <ul>
                        <li>
                            <Link to="/Profile" className="navNavProfile"><Avatar style={{ width: '3rem', height: '3rem', marginRight:"1rem" }} {...auth?.avatarconfig} /><p>Profil</p></Link>
                        </li>
                        <li>|</li>
                        <li>
                            <Link to="/Documents" >Documents</Link>
                        </li>
                        <li>|</li>
                        <li>
                            Visio
                        </li>
                        <li>|</li>
                        <li>
                            Jeux
                        </li>
                    </ul>
                </nav>)}
        </>
    );
}

export default Nav;
