import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import Avatar, { AvatarFullConfig, genConfig } from 'react-nice-avatar'
import useLogout from "../hooks/useLogout";


const Nav = () => {
    const { auth } = useAuth();
    const [pseudo, setPseudo] = useState("Profil");

    const navigate = useNavigate();
    const logout = useLogout();
    const signOut = async () => {
        await logout();
        navigate('/')
    }

    const getPseudo = async (e) => {
            try {
                const response = await axios.get("/pseudo",
                    {
                        params:{mail:auth?.user},
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    });
                setPseudo(response?.data.pseudo)
                
    
            } catch (err) { console.log("erreur pseudo"); }
    }

    if(auth?.user){
        getPseudo()
    }

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
                            <Link to="/Profile" className="navNavProfile"><Avatar style={{ width: '3rem', height: '3rem', marginRight:"1rem" }} {...auth?.avatarconfig} /><p>{pseudo}</p></Link>
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
                        <li>|</li>
                        <li>
                            <button onClick={signOut}>Déconnexion</button>
                        </li>
                    </ul>
                </nav>)}
        </>
    );
}

export default Nav;
