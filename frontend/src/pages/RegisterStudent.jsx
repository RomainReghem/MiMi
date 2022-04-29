import { Link, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react';
import axios from '../api/axios'

const USER_REGEX = /^[A-z0-9-_]{3,24}$/;
const NAME_REGEX = /^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const REGISTER_URL = '/registerStudent';

const Inscription = () => {

    const navigate = useNavigate();

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
    const [errUser, setErrUser] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // recheck les pwd et user in case of JS hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        const v3 = MAIL_REGEX.test(mail);
        const v4 = NAME_REGEX.test(name)
        const v5 = NAME_REGEX.test(firstName)
        if (!v1 || !v2 || !v3 || !v4 || !v5) {
            setErrMsg("Invalid Entry");
            return;
        }

        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, firstName, name, mail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(response?.data);
            console.log(response?.accessToken);
            console.log(JSON.stringify(response))
            setUser('');
            setPwd('');
            setMatchPwd('');
            navigate({
                pathname: "success",
                search: createSearchParams({
                    from: 2
                }).toString()
            });

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Un compte est déjà associé à cette adresse mail');
            }
            else if (err.response?.status === 408) {
                setErrMsg('Le pseudo est déjà pris');
            }
            else if (err.response?.status === 410) {
                setErrMsg('Ce mail est utilisé par un compte de classe');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            {success ? (
                <div>
                    <h1>Inscription élève réussie !</h1>
                    <p>
                        <Link to="/login" style={{ color: '#ab9471' }}>Connectez-vous.</Link>
                    </p>
                </div>
            ) : (
        <div className="formBody">
            <div className="formContainer">
                <h2>Inscription élève</h2><p className="infoProfs">Etablissements, enregistrez vos classes <Link to="/register-class" style={{ color: '#ab9471', display:"inline"}}><b>ici</b>.</Link></p>
                <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
                <form onSubmit={handleSubmit}>
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
                    <p id="uidnote" className={userFocus && user && !validUser ? "instructions" : "hide"}>Entre 4 et 24 caractères alphanumériques</p>

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
                    <p id="pwdnote" className={pwdFocus && pwd && !validPwd ? "instructions" : "hide"}>Entre 8 et 24 caractères, majuscule et caractère spécial (!@#$%) obligatoires</p>
                    
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
                    <p id="confirmnote" className={!matchFocus && matchPwd && !validMatch ? "instructions" : "hide"}>Les mots de passe ne correspondent pas !</p>
                    <button disabled = {!validMatch || !validName || !validPwd ? true : false} style={validMatch && validName && validPwd ? {
                            boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        } : {
                            boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        }}>→</button>
                </form>
            </div>


            <p>Déjà un compte ? <Link to="/login" style={{ color: '#ab9471' }}>Connectez-vous.</Link></p>
        </div>
            )}</>
    )
}

export default Inscription;