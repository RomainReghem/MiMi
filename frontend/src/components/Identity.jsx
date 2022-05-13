import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from '../api/axios';
import Notifs from '../components/Notifs';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCheck } from "@fortawesome/free-solid-svg-icons";

const CHANGEPSEUDO_URL = '/changePseudo';
const PSEUDO_REGEX = /^[A-z0-9-_]{3,24}$/;


const Identity = () => {

    const { auth } = useAuth();

    const [mail, setMail] = useState(auth?.user);
    const [newPseudo, setNewPseudo] = useState('');
    const [validNewPseudo, setValidNewPseudo] = useState(false);
    const [selectedPicture, setSelectedPicture] = useState();

    useEffect(() => {
        setValidNewPseudo(PSEUDO_REGEX.test(newPseudo));
    }, [newPseudo])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);

        if (!PSEUDO_REGEX.test(newPseudo)) {
            return;
        }

        try {
            console.log(JSON.stringify({ mail, newPseudo }))
            const response = await axios.post(CHANGEPSEUDO_URL,
                JSON.stringify({ mail, newPseudo }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            Notifs('Pseudo modifié', 'Votre nouveau pseudo est : ' + newPseudo, 'Success');

        } catch (err) {
            if (!err?.response) {
                Notifs('Erreur', 'Pas de réponse du serveur', 'Danger')
            } else if (err.response?.status === 406 || err.response?.status === 407) {
                Notifs('Erreur', 'Mauvais format de mail', 'Danger')
            }
            else if (err.response?.status === 400) {
                Notifs('Erreur', 'Mauvais mot de passe', 'Danger')
            } else {
                Notifs('Erreur', 'Veuillez réessayer', 'Danger')
            }
            return;
        }
    }

    const handlePictureSelect = (event) => {
        setSelectedPicture(event.target.files[0])
    }

    return (
        <div className="identity">
            <h3>Préférences</h3>
            
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="newPseudo"
                    autoComplete="off"
                    onChange={(e) => setNewPseudo(e.target.value)}
                    required
                    placeholder="Nouveau pseudo"
                />
                <button className="pseudoSubmit"><FontAwesomeIcon icon={faCheck}/></button>
            </form>
            
            <div className="importProfilePic">
                    <input type="file" id="picture" className="pictureInput" onChange={handlePictureSelect} />
                    <label htmlFor="picture" className="pictureLabel"><FontAwesomeIcon icon={faUpload} /><p>Importer une image de profil</p></label></div>
            <div className="preferences">
                <button className="chooseImage">Choisir l'image</button>
                <button className="chooseAvatar">Choisir l'avatar</button>
            </div>
        </div>


    );

}

export default Identity;