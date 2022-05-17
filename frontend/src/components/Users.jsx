import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Users = () => {
    const [users, setUsers] = useState();
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
                    params: { mail: "test@classe.fr" },
                    signal: controller.signal
                });
                console.log(response.data.eleves);
                isMounted && setUsers(response.data.eleves);
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
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(newEleve);
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
                                    <div><button onClick={close}>Oui</button><button onClick={close}>Non</button></div>
                                </div>)}
                            </Popup>
                        </div>)}

                    </div>
                ) : <p>No users to display</p>
            }
        </section>
    );
};

export default Users;