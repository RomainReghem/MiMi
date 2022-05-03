import { Link, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react';
import axios from '../api/axios'

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const REGISTER_URL = '/registerClass';

const InscriptionClasse = () => {

    const navigate = useNavigate();

    const errRef = useRef();
    const mailRef = useRef();

    const [mail, setMail] = useState('');
    const [validMail, setValidMail] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        mailRef.current.focus();
    }, [])

    useEffect(() => {
        setValidMail(MAIL_REGEX.test(mail));
    }, [mail])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [pwd, matchPwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        // recheck les pwd et user in case of JS hack
        const v2 = MAIL_REGEX.test(mail);
        const v1 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ mail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(response?.data);
            console.log(response?.accessToken);
            console.log(JSON.stringify(response))
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
            else if (err.response?.status === 411) {
                setErrMsg("Ce mail est utilisé par un compte d'élève");
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <div className="formBody">
            <div className="formContainer">
                <h2>Enregistrer une classe</h2><p className="infoProfs">Elèves, inscrivez-vous <Link to="/register-student" style={{ color: '#ab9471', display:"inline"}}><b>ici</b>.</Link></p>
                <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
                <form onSubmit={handleSubmit}>
                    <input
                            type="text"
                            id="mail"
                            ref={mailRef}
                            autoComplete="off"
                            onChange={(e) => setMail(e.target.value)}
                            required
                            placeholder="E-mail de la classe"
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
                    <button disabled = {!validMatch || !validMail || !validPwd ? true : false} style={validMatch && validMail && validPwd ? {
                            boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        } : {
                            boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                            transitionProperty: "box-shadow"
                        }}>→</button>
                </form>
            </div>


            <p>Classe déjà enregistrée ? <Link to="/login" style={{ color: '#ab9471' }}>Connectez-vous.</Link></p>
        </div>
    )
}

export default InscriptionClasse;