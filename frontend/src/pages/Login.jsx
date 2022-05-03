import { Link, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react';
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
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            console.log(JSON.stringify(response?.data));
            //const accessToken = response?.data?.accessToken;
            const accessToken = response?.data?.accessToken;
            console.log(accessToken);

            setAuth({ user, pwd, accessToken });
            setPwd('');
            setUser('');
            navigate({
                pathname: "/success",
                search: createSearchParams({
                    from: 1
                }).toString()
            });

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response')
            } else if (err.response?.status === 400) {
                setErrMsg('Mauvais mot de passe');
            } else if (err.response?.status === 401) {
                setErrMsg("Nom d'utilisateur inconnu");
            }
            else if (err.response?.status === 402) {
                setErrMsg("Nom d'utilisateur ou mot de passe manquant");
            } else {
                setErrMsg('Erreur');
            }

            errRef.current.focus();
        }
    }



    return (

        <div className="formBody">

            <div className="formContainer">


                <h2>Connectez-vous</h2>
                <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
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