import "../styles/profile.css"
import useAuth from "../hooks/useAuth";
import ChangePwd from "../components/ChangePwd"
import ChangeMail from "../components/ChangeMail"
import axios from '../api/axios'
import AvatarComponent from "../components/AvatarComponent"
import { useState } from "react";

const PSEUDO_URL = '/pseudo';

const Profile = () => {

    const { auth } = useAuth();
    // Remettre ça 
    const role = auth?.role;
    const mail = auth?.user;
    const pseudo = "";


    const findPseudo = async (e) => {
        try {
            const response = await axios.get(PSEUDO_URL, JSON.stringify({ mail }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            pseudo = response?.data?.pseudo;

        } catch (err) { console.log("erreur pseudo"); }
    }

    findPseudo();

    return (
        <>
            {role == "eleve" ? (
                <div className="profileMain">
                    <section className="profileSettings">
                        <ChangePwd /><br />
                        <ChangeMail />
                    </section>
                    <AvatarComponent/>
                </div>) : (
                <div className="pcMain">
                    <h2>Tableau de bord classe #4234</h2>
                    <p>(rajouter la liste des élèves de la classe ?)</p>
                    <div className="pcChild">
                        <ChangePwd /><br />
                        <ChangeMail />
                    </div>
                </div>)}
        </>
    )
}

export default Profile;