import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import Notifs from "./Notifs"
import axios from "../api/axios";

const Invitations = () => {
    const { auth, setAuth } = useAuth();
    const classe = "";
    const user = auth?.user;

    const acceptInvite = async () => {
        try {
            await axios.post("/acceptInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            Notifs("Invitation acceptée !", "Vous faites maintenant partie de la " + classe, "success");
        }
        catch (err) {
            console.log(err)
        }
    }

    const refuseInvite = async () => {
        try {
            await axios.post("/refuseInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
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
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        auth?.invitation == "none" ? (
            <div style={{ backgroundColor: "#C05946", color: "#F2E3D5" }} className="membreMsg">
                <p>Aucune invitation de classe en attente</p>
            </div>)
            : auth?.invitation == "pending" ? (
                <div style={{ backgroundColor: "#F2C12E", color: "black", border: "0.1rem dashed #012E40" }} className="membreMsg">
                    <p>{auth?.classe} vous a invité !</p>
                    <span>
                        <button onClick={acceptInvite} className="acceptInvite">
                            <FontAwesomeIcon className="inviteIcons" icon={faCheck} />
                        </button>
                        <button onClick={refuseInvite} className="refuseInvite">
                            <FontAwesomeIcon className="inviteIcons" icon={faXmark} />
                        </button>
                    </span>
                </div>)
                : auth?.invitation == "accepted" ? (
                    <div style={{ backgroundColor: "#258A54", color: "black" }} className="membreMsg">
                        <p>Vous êtes membre de la {auth?.classe}</p>
                        <button onClick={quitClass} className="quitClass">
                            <FontAwesomeIcon icon={faDoorOpen} />
                        </button>
                    </div>) : <></>);
}

export default Invitations;