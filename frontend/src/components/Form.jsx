import { useState } from "react";
import axios from "../api/axios";
import { BiUpload, BiRocket } from "react-icons/bi"
import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Notifs from "../components/Notifs"

const Form = () => {
    // a local state to store the currently selected file.
    const [selectedFile, setSelectedFile] = useState(null);
    const { auth } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData();
        if (selectedFile.type != "application/pdf") {
            Notifs("Erreur fichier", "Les seuls fichier acceptés sont les PDF", "warning")
            return;
        }
        formData.append("selectedFile", selectedFile);
        try {
            const response = await axios.post("/saveFile", JSON.stringify({ mail: auth?.user, cours: "maths" }),
                {
                    data: formData,
                    headers: { "Content-Type": "multipart/form-data" },
                });
            Notifs("Fichier ajouté !", "", "success")
        } catch (error) {
            console.log(error)
        }
    }

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0])
    }

    return (
        <form onSubmit={handleSubmit} className="fileForm">
            <input type="file" id="file" className="fileInput" onChange={handleFileSelect} />
            <label htmlFor="file" className="fileLabel"><FontAwesomeIcon icon={faUpload} /><p>{selectedFile ? (selectedFile?.name).substring(0, 10) + "..." : "Choisir un fichier"}</p></label>
            <button className="fileSendButton" disabled={selectedFile ? false : true}><FontAwesomeIcon icon={faPaperPlane} bounce={selectedFile ? true : false} /><p>Envoyer</p></button>

        </form>
    )
};

export default Form;