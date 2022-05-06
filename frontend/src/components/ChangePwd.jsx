import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from '../api/axios';

const CHANGEPWD_URL = '/changePwd';
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;


const ChangePwd = () => {

    const { auth } = useAuth();

    const [mail, setMail] = useState('');

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [newPwd, setNewPwd] = useState('');
    const [validNewPwd, setValidNewPwd] = useState(false);
    const [newPwdFocus, setNewPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setValidNewPwd(PWD_REGEX.test(newPwd));
        console.log(validMatch);
        setValidMatch(newPwd === matchPwd);
    }, [newPwd, matchPwd]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
    }, [pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);
        
        
        if (!PWD_REGEX.test(newPwd)) {
            setErrMsg("Invalid Entry");
            return;
        }
        
        try {
            console.log("Voici le mail :" + auth?.user)
            const response = await axios.post(CHANGEPWD_URL,
                JSON.stringify({ mail, pwd, newPwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(response?.data);
            setPwd('');
            setNewPwd('');
            setMatchPwd('');
            console.log("mot de passe changé !");           

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Mot de passe actuel erroné');
            } 
            else if (err.response?.status === 404) {
                setErrMsg("Erreur d'authentification, reconnectez vous");
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <div className="profilePwd">
            <h3>Changer de mot de passe</h3>
            <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    onChange={(e) => setPwd(e.target.value)}
                    required
                    aria-invalid={validPwd ? "false" : "true"}
                    aria-describedby="pwdnote"
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                    placeholder="Mot de passe actuel"
                    style={validPwd ? {
                        boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    } : {
                        boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    }}
                />
                <input
                    type="password"
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                    aria-invalid={validNewPwd ? "false" : "true"}
                    aria-describedby="pwdnote"
                    onFocus={() => setNewPwdFocus(true)}
                    onBlur={() => setNewPwdFocus(false)}
                    placeholder="Nouveau mot de passe"
                    style={validNewPwd ? {
                        boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    } : {
                        boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    }}
                />

                <input
                    type="password"
                    onChange={(e) => setMatchPwd(e.target.value)}
                    required
                    aria-invalid={validMatch ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                    placeholder="Confirmer mot de passe"
                    style={validMatch && newPwd ? {
                        boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    } : {
                        boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                        transitionProperty: "box-shadow"
                    }}
                />
                <div className="btn-ins"><button disabled={!validMatch || !validNewPwd ? true : false} style={validMatch && validNewPwd ? {
                    boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                    transitionProperty: "box-shadow"
                } : {
                    boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                    transitionProperty: "box-shadow"
                }}>→</button>
                <p id="pwdnote" className={newPwdFocus && newPwd && !validNewPwd ? "instructions" : "hide"}>Entre 8 et 24 caractères, majuscule et caractère spécial (!@#$%) obligatoires</p>
                <p id="confirmnote" className={!matchFocus && !newPwdFocus && matchPwd && !validMatch ? "instructions" : "hide"}>Les mots de passe ne correspondent pas !</p></div>
            </form>
        </div>


    );

}

export default ChangePwd;