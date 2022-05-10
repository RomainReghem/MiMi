import { Link, useNavigate } from "react-router-dom";
import Notifs from '../components/Notifs';
import { useEffect, useState } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import Avatar, { AvatarFullConfig, genConfig } from 'react-nice-avatar'
import useLogout from "../hooks/useLogout";
import { GrGamepad } from 'react-icons/gr';
import { BiPowerOff } from 'react-icons/bi';
import { AiOutlineVideoCamera } from 'react-icons/ai';
import { HiOutlineDocumentText } from 'react-icons/hi';


const Nav = () => {
    const { auth } = useAuth();
    const [pseudo, setPseudo] = useState("Profil");
    const [avatar, setAvatar] = useState(auth?.avatarconfig);
    const color = "blue";


    const iconSize = 18;

    const navigate = useNavigate();
    const logout = useLogout();
    const signOut = async () => {
        await logout();
        navigate('/')
        Notifs('Déconnexion', '', 'info')
        
    }

    const getPseudo = async (e) => {
        try {
            const response = await axios.get("/pseudo",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            setPseudo(response?.data.pseudo)


        } catch (err) { console.log("Erreur du chargement du pseudo"); }
    }

    const getAvatar = async (e) => {
        try {
            const response = await axios.get("/avatar",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            console.log(JSON.parse(response.data.avatar))
            setAvatar(JSON.parse(response.data.avatar));



        } catch (err) { console.log("Erreur du chargement de l'avatar"); }
    }

    // On ne récupère l'avatar que s'il y a eu un changement, ou une connexion. Pour ne pas spammer les requetes
    useEffect(() => {
        if (auth?.user != undefined)
            getAvatar()
    }, [auth?.user, auth?.avatarconfig])

    // On ne récupère le pseudo qu'a la connexion
    // Changer si on peut changePseudo()
    useEffect(() => {
        if (auth?.user != undefined)
            getPseudo()
    }, [auth?.user])

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
                        <li style={{background:avatar.bgColor, marginRight:"0rem", paddingRight:"1.2rem" }}>
                            <Link to="/Profile" className="navNavProfile"><Avatar style={{ width: '3rem', height: '3rem', marginRight: "1rem" }} {...avatar} />
                                <p className="navText pseudo">{pseudo}</p></Link>
                        </li>
                        <li>|</li>
                        <li>
                            <Link to="/documents" >
                                <p className="navText">Documents</p>
                                <HiOutlineDocumentText size={iconSize} className="navIcon" />
                            </Link>
                        </li>
                        <li>|</li>
                        <li>
                            <Link to="/visio" >
                                <p className="navText">Visio</p>
                                <AiOutlineVideoCamera size={iconSize} className="navIcon" />
                            </Link>
                        </li>
                        <li>|</li>
                        <li>
                            <Link to="/jeux" >
                                <p className="navText">Jeux</p>
                                <GrGamepad size={iconSize} className="navIcon" />
                            </Link>
                        </li>
                        <li className="deconnexion">
                            <button onClick={signOut}>
                                <p className="navText">Déconnexion</p>
                                <BiPowerOff size={iconSize} className="navIcon" /></button>
                        </li>
                    </ul>
                </nav>)}
        </>
    );
}

export default Nav;
