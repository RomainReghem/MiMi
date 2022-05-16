import { Link, useNavigate } from "react-router-dom";
import Notifs from '../components/Notifs';
import { useEffect, useState } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import Avatar from 'react-nice-avatar'
import useLogout from "../hooks/useLogout";
import { GrGamepad } from 'react-icons/gr';
import { BiPowerOff } from 'react-icons/bi';
import { AiOutlineVideoCamera } from 'react-icons/ai';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import useLocalStorageState from 'use-local-storage-state'


const Nav = () => {
    const { auth } = useAuth();
    const [pseudo, setPseudo] = useState("Profil");
    let avatar_base = {
        bgColor: "#E0DDFF",
        earSize: "small",
        eyeBrowStyle: "up",
        eyeStyle: "oval",
        faceColor: "#AC6651",
        glassesStyle: "none",
        hairColor: "#000",
        hairStyle: "thick",
        hatColor: "#000",
        hatStyle: "none",
        mouthStyle: "laugh",
        noseStyle: "round",
        shirtColor: "#6BD9E9",
        shirtStyle: "polo",
        shape: "square"
    };

    const [avatar, setAvatar] = useState(avatar_base);
    const [imageURL, setImageURL] = useState("https://img-19.commentcamarche.net/cI8qqj-finfDcmx6jMK6Vr-krEw=/1500x/smart/b829396acc244fd484c5ddcdcb2b08f3/ccmcms-commentcamarche/20494859.jpg");

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
            setAvatar(JSON.parse(response.data.avatar));
        } catch (err) { console.log("Erreur du chargement de l'avatar"); }
    }

    const getImage = async (e) => {
        try {
            const response = await axios.get("/image",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            setImageURL(URL.createObjectURL(JSON.parse(response.data.image)));
        } catch (err) { console.log("Erreur du chargement de l'image de profil"); }
    }

    // On ne récupère l'avatar que s'il y a eu un changement, ou une connexion. Pour ne pas spammer les requetes
    useEffect(() => {
        if (auth?.user != undefined)
            getAvatar();
            getImage();
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
                            <Link to="/tests">Tests</Link>
                        </li>
                        <li>|</li>

                        <li className="connexion">
                            <Link to="/login">
                                <button>
                                    <p className="navText">Connexion</p>
                                </button>
                            </Link>
                        </li>

                    </ul>
                </nav>
            ) : (
                <nav className="navNav">
                    <ul>
                        {auth?.role == "eleve" ? (
                            <li style={auth?.preference === "avatar" ? ({background: avatar?.bgColor, marginRight: "0rem", paddingRight: "1.2rem" }) : ({marginRight: "0rem", paddingRight: "1.2rem" })}>
                                <Link to="/Profile" className="navNavProfile">
                                    {auth?.preference === "avatar" ?
                                        (<Avatar style={{ width: '3rem', height: '3rem', marginRight: "1rem" }} {...avatar} />) :
                                        (
                                            <img className="navImage" src={imageURL}></img>
                                        )}
                                    <p className="navText pseudo">{pseudo}</p>
                                </Link>
                            </li>
                        ) : (
                            <li style={{ background: avatar_base?.bgColor, marginRight: "0rem", paddingRight: "1.2rem" }}>
                                <Link to="/Profile" className="navNavProfile">
                                    <Avatar style={{ width: '3rem', height: '3rem', marginRight: "1rem" }} {...avatar_base} />
                                    <p className="navText pseudo">Classe</p>
                                </Link>
                            </li>
                        )}
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
                        <span className="navRightSide">
                            <li className="settings">
                                <Link to="/settings" >
                                    <button><FontAwesomeIcon icon={faGear} className="gearIcon" /></button>
                                </Link>
                            </li>
                            <li className="deconnexion">
                                <button onClick={signOut}>
                                    <p className="navText">Déconnexion</p>
                                    <BiPowerOff size={iconSize} className="navIcon" />
                                </button>
                            </li>
                        </span>
                    </ul>
                </nav>)
            }
        </>
    );
}

export default Nav;
