import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from '../api/axios';
import { Store } from 'react-notifications-component';

const CHANGEMAIL_URL = '/changeMail';
const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const LOGIN_URL = '/login';


const ChangeMail = () => {

    const { auth } = useAuth();
    const { setAuth } = useAuth();   
    console.log(auth) 
    

    const [mail, setMail] = useState(auth?.user);

    const newMailRef = useRef();
    const [newMail, setnewMail] = useState('');
    const [validnewMail, setValidnewMail] = useState(false);

    const [pwd, setPwd] = useState('');
    const [pwdFocus, setPwdFocus] = useState(false);

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setValidnewMail(MAIL_REGEX.test(newMail));
    }, [newMail])

    useEffect(() => {
        setErrMsg('');
    }, [newMail, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();        
        setMail(auth?.user);
        
        if (!MAIL_REGEX.test(newMail)) {
            setErrMsg("Invalid Entry");
            return;
        }
        
        try {
            console.log(JSON.stringify({ mail, newMail, pwd }))
            const response = await axios.post(CHANGEMAIL_URL,
                JSON.stringify({ mail, newMail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            
            console.log(response?.data);
            setMail(newMail);

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 406 || err.response?.status === 407 ) {
                setErrMsg('Mauvais format de mail, réessayez.');
            } 
            else if (err.response?.status === 400) {
                setErrMsg("Mauvais mot de passe");
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
            return;
        }
    }

    return (
        <div className="profileMail">
            <h3>Changer d'adresse mail</h3>
            <p ref={errRef} className={errMsg ? "errmsg" : "hide"} aria-live="assertive">{errMsg}</p>
            <form onSubmit={handleSubmit}>
                    <input
                            type="text"
                            id="newMail"
                            ref={newMailRef}
                            autoComplete="off"
                            onChange={(e) => setnewMail(e.target.value)}
                            required
                            placeholder="Nouveau mail"
                            style={validnewMail ? {
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
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                        placeholder="Mot de passe"                        
                    />
                <button disabled={!validnewMail ? true : false} style={validnewMail ? {
                    boxShadow: "5px 5px #4cf579", transitionDuration: "300ms",
                    transitionProperty: "box-shadow"
                } : {
                    boxShadow: "5px 5px #ffc3ae", transitionDuration: "300ms",
                    transitionProperty: "box-shadow"
                }}>→</button>
            </form>
        </div>


    );

}

export default ChangeMail;