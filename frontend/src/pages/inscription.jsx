import { Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react';

const USER_REGEX = /^[A-z0-9-_]{3,24}$/;
const NAME_REGEX = /^[A-z-]{2,24}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const REGISTER_URL = '/register';

const Inscription = () => {

    const userRef = useRef();
    const errRef = useRef();
    const nameRef = useRef();
    const firstNameRef = useRef();
    const mailRef = useRef();

    const [user, setUser] = useState('');
    const [validUser, setvalidUser] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [name, setName] = useState('');
    const [validName, setValidName] = useState(false);

    const [mail, setMail] = useState('');
    const [validMail, setValidMail] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [validFirstName, setValidFirstName] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setvalidUser(USER_REGEX.test(user));
    }, [user])


    useEffect(() => {
        setValidName(NAME_REGEX.test(name));
    }, [name])

    useEffect(() => {
        setValidFirstName(NAME_REGEX.test(firstName));
    }, [firstName])

    useEffect(() => {
        setValidMail(MAIL_REGEX.test(mail));
    }, [mail])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    return (
        <div className="formBody">
            <div className="formContainer">
                <h2>Inscrivez-vous</h2>
                <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
                <form>
                    <div className="formNames">
                        <input
                            type="text"
                            id="firstName"
                            ref={firstNameRef}
                            autoComplete="off"
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Prénom"
                            style={validFirstName ? {
                                boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            } : {
                                boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            }}
                        />
                        <input
                            type="text"
                            id="name"
                            ref={nameRef}
                            autoComplete="off"
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Nom"
                            style={validName ? {
                                boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            } : {
                                boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            }}
                        />
                    </div>
                    <input
                        type="text"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setUser(e.target.value)}
                        required
                        aria-invalid={validUser ? "false" : "true"}
                        aria-describedby="uidnote"
                        onFocus={() => setUserFocus(true)}
                        onBlur={() => setUserFocus(false)}
                        placeholder="Pseudo"
                        style={validUser ? {
                            boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        } : {
                            boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        }}
                    />
                    <p id="uidnote" className={userFocus && user && !validUser ? "instructions" : "hide"}>entre 4 et 24 caractères (A-Z, 0-9, _ et - )</p>

                    <input
                            type="text"
                            id="mail"
                            ref={mailRef}
                            autoComplete="off"
                            onChange={(e) => setMail(e.target.value)}
                            required
                            placeholder="Adresse e-mail"
                            style={validMail ? {
                                boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            } : {
                                boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                                transitionProperty: "box-shadow"
                            }}
                        />
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        required
                        aria-invalid={validPwd ? "false" : "true"}
                        aria-describedby="pwdnote"
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                        placeholder="Mot de passe"
                        style={validPwd ? {
                            boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        } : {
                            boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        }}
                    />
                    <p id="pwdnote" className={pwdFocus && pwd && !validPwd ? "instructions" : "hide"}>entre 8 et 24 caractères (A-Z, 0-9, _ et - )</p>
                    
                    <input
                        type="password"
                        id="confirm_pwd"
                        onChange={(e) => setMatchPwd(e.target.value)}
                        required
                        aria-invalid={validMatch ? "false" : "true"}
                        aria-describedby="confirmnote"
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                        placeholder="Confirmer mot de passe"
                        style={validMatch && pwd ? {
                            boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        } : {
                            boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        }}
                    />
                    <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "hide"}>Les mots de passe ne correspondent pas !</p>
                    <button>→</button>
                </form>
            </div>


            <p>Déjà un compte ? <Link to="/connexion" style={{ color: '#ab9471' }}>Connectez-vous.</Link></p>
        </div>
    )
}

export default Inscription;