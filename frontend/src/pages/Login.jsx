import { Link, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react';
import Notifs from '../components/Notifs';
import axios from '../api/axios'
import useAuth from '../hooks/useAuth'

const LOGIN_URL = '/login';

const Connexion = () => {

    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    //const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            //const accessToken = response?.data?.accessToken;
            const accessToken = response?.data?.accessToken;
            const role = response?.data?.role;

            // Au login, si rien ne correspond dans le local storage, on attribue "avatar" à "préférence"
            // On ajoute aussi la variable au localstorage, default "avatar"
            let preference = JSON.parse(localStorage.getItem("preference"+user)) || "avatar";
            if(!localStorage.getItem("preference"+user)){
                localStorage.setItem("preference"+user, "avatar");
            }

            setAuth({ user, accessToken, role, preference });
            setPwd('');
            setUser('');
            Notifs("Bienvenue !", "Vous êtes connecté", "success");
            navigate({
                pathname: "/success",
                search: createSearchParams({
                    from: 1
                }).toString()
            });


        } catch (err) {
            if (!err?.response) {
                Notifs("Erreur", "Pas de réponse du serveur", "danger");
            } else if (err.response?.status === 400) {
                Notifs("Erreur", "Mauvais mot de passe", "danger");
            } else if (err.response?.status === 401) {
                Notifs("Erreur", "Adresse mail inconnue", "danger");
            }
            else if (err.response?.status === 402) {
                Notifs("Erreur", "Nom d'utilisateur ou mot de passe manquant", "danger");
            } else {
                Notifs("Erreur", "Erreur", "danger");
            }

            errRef.current.focus();
        }
    }



    return (

        <div className="formBody">
            <div className="formContainer">
                <h2>Connectez-vous</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="mail"
                        ref={userRef}
                        autoComplete="off"
                        placeholder="E-mail élève ou classe"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        required
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Mot de passe"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        required
                    />
                    <button>→</button>
                </form>
            </div>

            <p>Pas encore de compte ? <Link to="/choice" style={{ color: '#ab9471' }}>Inscrivez-vous.</Link></p>
        </div>

    )
}

export default Connexion;