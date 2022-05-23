import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import Tooltip from "@mui/material/Tooltip";
import Notifs from "./Notifs";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Users = () => {
    const [users, setUsers] = useState();
    const [usersUpdated, setUsersUpdated] = useState();
    const { auth } = useAuth();
    const [newEleve, setNewEleve] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getUsers = async () => {
            try {
                const response = await axiosPrivate.get('/eleves', {
                    params: { mail: auth?.user },
                    signal: controller.signal
                });                
                isMounted && setUsers(response.data.eleves);

                // On met ça dans le local storage pour la partie shared documents
                // a changer et faire par rapport à l'id de la classe + récupération de(s) eleve par l'api
                localStorage.setItem("mailEleve", response.data.eleves[0].courriel)
            } catch (err) {
                console.error(err);
                {/*navigate('/login', { state: { from: location }, replace: true });*/ }
            }
        }

        getUsers();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [usersUpdated])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/inviteEleve", JSON.stringify({ classe:auth?.user, eleve:newEleve }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            Notifs("Eleve invité", "", "success");
        }
        catch (err) {
            if (!err?.response) {
                Notifs("Erreur", "Pas de réponse du serveur", "danger");
            } else if (err.response?.status === 404) {
                Notifs("Erreur", "Eleve introuvable, vérifiez l'adresse mail", "danger");
            } else if (err.response?.status === 403) {
                Notifs("Erreur", "L'élève est déjà dans une classe ou a déjà une invitation en attente", "danger");
            } else {
                Notifs("Erreur", "Erreur", "danger");
            }
        }
    }

    const deleteEleve = async (eleveToDelete) => {
        try {
            await axios.post("/deleteEleve", JSON.stringify({ classe:auth?.user, eleve:eleveToDelete }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            Notifs("Eleve supprimé", "", "success");
        }
        catch (err) {
            if (!err?.response) {
                Notifs("Erreur", "Pas de réponse du serveur", "danger");
            }            
            else {
                Notifs("Erreur", "Erreur", "danger");
            }
        }

    }

    return (
        <section className="usersMain">
            <h2>Inviter un élève</h2>
            <p>l'élève aura accès aux documents partagés de la classe </p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="newEleve"
                    autoComplete="off"
                    onChange={(e) => setNewEleve(e.target.value)}
                    required
                    placeholder="Adresse mail de l'élève"
                />
                <button className="eleveSubmit"><FontAwesomeIcon icon={faCheck} /></button>
            </form><br />
            <h2>Eleve(s) de la classe :</h2>
            {users?.length
                ? (
                    <div className="usersList">
                        {users.map((user, i) => <div key={i}>{user?.courriel}
                            <Popup trigger={<button><FontAwesomeIcon icon={faXmark} /></button>} modal>
                                {close => (<div className="popupMsg">
                                    <h2>Supprimer cet élève ?</h2>
                                    <p>Il n'aura plus accès aux documents partagés</p>
                                    <div><button onClick={() => {deleteEleve(user?.courriel);close();setUsersUpdated(!usersUpdated)}}>Oui</button><button onClick={close}>Non</button></div>
                                </div>)}
                            </Popup>
                        </div>)}

                    </div>
                ) : <p>Invitez un élève pour le voir apparaître ici lorsqu'il acceptera</p>
            }
        </section>
    );
};

export default Users;