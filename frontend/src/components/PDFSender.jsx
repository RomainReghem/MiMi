import { useState } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Notifs from "./Notifs"

const PDFSender = (props) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileWaitingToBeSent, setFileWaitingToBeSent] = useState(false);
    const { auth } = useAuth();
    let saveFileURL = (auth?.role == "classe" ? "/saveFileClass" : "/saveFile");

    const handleSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData();
        // PDF only
        if (selectedFile.type != "application/pdf") {
            Notifs("Erreur type de fichier", "Les seuls fichier acceptés sont les PDF", "warning")
            return;
        }
        // Fichiers < 10 Mo
        if (selectedFile.size > 10_000_000) {
            Notifs("Erreur taille de fichier", "Le fichier séléctionné doit faire moins de 10Mo", "warning")
            return;
        }
        formData.append("file", selectedFile);
        formData.append("filename", selectedFile.name);
        formData.append("cours", "maths");
        formData.append("mail", auth?.user)
        console.log(selectedFile.name);
        try {
            const response = await axios.post(saveFileURL, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            Notifs("Fichier ajouté !", "", "success")

            // Pour l'UI on remet fileWaitingToBeSent à false
            setFileWaitingToBeSent(false);

            // On appelle LoadFiles pour actualiser les fichiers dans l'UI
            props.reload();

        } catch (error) {
            console.log(error)
        }
    }

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileWaitingToBeSent(true);
    }

    return (
        <form onSubmit={handleSubmit} className="fileForm">
            <input type="file" id="file" className="fileInput" onChange={handleFileSelect} />
            <label htmlFor="file" className="fileLabel">
                <FontAwesomeIcon icon={faUpload} />
                {/* Si un fichier est en attente, on joue les animations d'UI, et on change la valeur du label*/}
                <p>{fileWaitingToBeSent ? (selectedFile?.name).substring(0, 10) + "..." : "Choisir un fichier"}</p>
            </label>
            <button className="fileSendButton" disabled={fileWaitingToBeSent ? false : true}>
                <FontAwesomeIcon icon={faPaperPlane} bounce={fileWaitingToBeSent ? true : false} />
                <p>Envoyer</p>
            </button>

        </form>
    )
};

export default PDFSender;