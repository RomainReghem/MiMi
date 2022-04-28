import { Link } from 'react-router-dom'
import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthProvider';
import axios from '../api/axios'

const LOGIN_URL = '/login';

const Connexion = () => {

    const { setAuth } = useContext(AuthContext);
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState('');

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
            const accessToken = response?.data?.accessToken;

            setAuth({user, pwd, accessToken})
            setPwd('');
            setUser('');
            setSuccess(true);

        } catch (err) { 
            if(!err?.response){
                setErrMsg('No Server Response')
            } else if (err.response?.status === 400){
                setErrMsg('Wrong Password');
            } else if (err.response?.status === 401){
                setErrMsg('User not found');
            } 
            else if (err.response?.status === 402){
                setErrMsg('Missing Username or Password');
            } else {
                setErrMsg('Login Failed');
            }

            errRef.current.focus();
        }
    }



    return (
        <>
            {success ? (
                <div>
                    <h2>You're logged in !</h2>
                    <p><Link to="/protected" style={{ color: '#ab9471' }}>Accéder à votre dashboard.</Link></p>
                </div>

            ) : (
                <div className="formBody">

                    <div className="formContainer">


                        <h2>Connectez-vous</h2>
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
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

                    <p>Pas encore de compte ? <Link to="/inscription" style={{ color: '#ab9471' }}>Inscrivez-vous.</Link></p>
                </div>
            )}
        </>
    )
}

export default Connexion;