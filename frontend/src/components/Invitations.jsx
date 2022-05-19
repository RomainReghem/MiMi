import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import Notifs from "./Notifs"
import axios from "../api/axios";

const Invitations = () => {
    const { auth, setAuth } = useAuth();
    const classe = auth?.idclasse;
    const user = auth?.user;
    console.log(auth);

    const acceptInvite = async () => {
        try {
            await axios.post("/acceptInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            await setAuth({
                ...auth,
                invitation: "acceptee"
            })
            Notifs("Invitation acceptée !", "Vous faites maintenant partie de la classe #" + classe, "success");
        }
        catch (err) {
            console.log(err)
        }
    }

    const refuseInvite = async () => {
        try {
            await axios.post("/refuseInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            await setAuth({
                ...auth,
                invitation: "aucune"
            })
            Notifs("Invitation refusée", "", "info");
        }
        catch (err) {
            console.log(err)
        }
    }

    const quitClass = async () => {
        try {
            await axios.post("/quitClass", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            Notifs("Classe quittée", "", "info");
            await setAuth({
                ...auth,
                invitation:"aucune"
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        auth?.invitation == "aucune" ? (
            <div style={{ backgroundColor: "#C05946", color: "#F2E3D5" }} className="membreMsg">
                <p>Aucune invitation de classe en attente</p>
            </div>)
            : auth?.invitation == "en attente" ? (
                <div style={{ backgroundColor: "#F2C12E", color: "black", border: "0.1rem dashed #012E40" }} className="membreMsg">
                    <p>La classe #{classe} vous a invité !</p>
                    <span>
                        <button onClick={acceptInvite} className="acceptInvite">
                            <FontAwesomeIcon className="inviteIcons" icon={faCheck} />
                        </button>
                        <button onClick={refuseInvite} className="refuseInvite">
                            <FontAwesomeIcon className="inviteIcons" icon={faXmark} />
                        </button>
                    </span>
                </div>)
                : auth?.invitation == "acceptee" ? (
                    <div style={{ backgroundColor: "#258A54", color: "black" }} className="membreMsg">
                        <p>Vous êtes membre de la classe #{classe}</p>
                        <button onClick={quitClass} className="quitClass">
                            <FontAwesomeIcon icon={faDoorOpen} />
                        </button>
                    </div>) : <></>);
}

export default Invitations;