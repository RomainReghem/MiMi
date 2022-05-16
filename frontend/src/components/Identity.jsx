import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from '../api/axios';
import Notifs from '../components/Notifs';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCheck } from "@fortawesome/free-solid-svg-icons";
import Avatar from 'react-nice-avatar'

const CHANGEPSEUDO_URL = '/changePseudo';
const PSEUDO_REGEX = /^[A-z0-9-_]{3,24}$/;


const Identity = () => {

    const { auth, setAuth } = useAuth();
    
    const [mail, setMail] = useState(auth?.user);
    const [newPseudo, setNewPseudo] = useState('');
    const [selectedPicture, setSelectedPicture] = useState({preview:"https://img-19.commentcamarche.net/cI8qqj-finfDcmx6jMK6Vr-krEw=/1500x/smart/b829396acc244fd484c5ddcdcb2b08f3/ccmcms-commentcamarche/20494859.jpg", data:""});
    let avatar_base = {
        bgColor: "#E0DDFF",
        earSize: "small",
        eyeBrowStyle: "up",
        eyeStyle: "oval",
        faceColor: "#AC6651",
        glassesStyle: "none",
        hairColor: "#000",
        hairStyle: "thick",
        hatColor: "#000",
        hatStyle: "none",
        mouthStyle: "laugh",
        noseStyle: "round",
        shirtColor: "#6BD9E9",
        shirtStyle: "polo",
        shape: "square"
    };
    const [avatar, setAvatar] = useState(avatar_base);

    const getAvatar = async (e) => {
        try {
            const response = await axios.get("/avatar",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            setAvatar(JSON.parse(response.data.avatar));
        } catch (err) { console.log("Erreur du chargement de l'avatar"); }
    }

    // On ne récupère l'avatar que s'il y a eu un changement, ou une connexion. Pour ne pas spammer les requetes
    useEffect(() => {
        if (auth?.user != undefined)
            getAvatar()
    }, [auth?.user, auth?.avatarconfig])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);

        if (!PSEUDO_REGEX.test(newPseudo)) {
            Notifs('Erreur', 'Le pseudo doit comporter entre 4 et 24 caractères alphanumériques ', 'Danger');
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
            } else if (err.response?.status === 407 || err.response?.status === 401) {
                Notifs('Erreur', "Problème d'authentification, reconnectez-vous", 'Danger')
            }
            else if (err.response?.status === 405) {
                Notifs('Erreur', 'Pseudo incorrect', 'Danger')
            } else {
                Notifs('Erreur', 'Veuillez réessayer', 'Danger')
            }
            return;
        }
    }

    const handlePictureSelect = (event) => {
        const img = {
            preview: URL.createObjectURL(event.target.files[0]),
            data: event.target.files[0],
        }
        // PNG / JPEG only
        console.log(img)
        if (img.data.type != "image/png" && img.data.type != "image/jpeg" && img.data.type != "image/jpg") {
            Notifs("Erreur type de fichier", "Les seules images acceptées sont les PNG et JPEG", "warning")
            return;
        }
        // Fichiers < 10 Mo
        if(img.data.size > 10_000_000){
            Notifs("Erreur taille de fichier", "L'image séléctionnée doit faire moins de 10Mo", "warning")
            return;
        }
        setSelectedPicture(img);
    }

    useEffect(() => {
        if (selectedPicture) {
            pictureSubmit();
        }
    }, [selectedPicture])

    const pictureSubmit = async () => {
        let formData = new FormData()
        formData.append('file', selectedPicture.data);        
        formData.append("filename", selectedPicture.data.name);
        formData.append("mail", auth?.user);
        try {
            const response = await axios.post("/saveImage", formData,
                {
                    headers: { "Content-Type": "image/*" },
                });
            Notifs("Image de profil sauvegardée !", "", "success")
            console.log(response)
        } catch (error) {
            console.log(error)
        }
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
                <button className="pseudoSubmit"><FontAwesomeIcon icon={faCheck} /></button>
            </form>

            <div className="importProfilePic">
                <input type="file" id="picture" className="pictureInput" onChange={handlePictureSelect} />
                <label htmlFor="picture" className="pictureLabel"><FontAwesomeIcon icon={faUpload} /><p>Importer une image de profil</p></label>
            </div>
            <div className="preferences">
                <div>
                <img className="previewImage" src={selectedPicture?.preview}></img>
                    <button onClick={() => {setAuth({...auth, preference:"image"}); localStorage.setItem("preference"+auth?.user, JSON.stringify("image"))}} className="chooseImage">Choisir l'image</button>
                </div>
                <div>
                    <Avatar className="previewAvatar"  {...avatar} />
                    <button onClick={() => {setAuth({...auth, preference:"avatar"}); localStorage.setItem("preference"+auth?.user, JSON.stringify("avatar"))}} className="chooseAvatar">Choisir l'avatar</button>
                </div>
            </div>
        </div>


    );

}

export default Identity;