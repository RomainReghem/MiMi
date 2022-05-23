import PDFSender from "../components/PDFSender"
import FileList from "../components/FileList"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import PDFViewer from "../components/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";

const Documents = () => {

    const { auth } = useAuth();

    // Tableau de tous les noms des fichiers 
    const [myFiles, setMyFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);

    const [menuSelection, setMenuSelection] = useState(myFiles);
    const [selectedUI, setSelectedUI] = useState("my");

    // Le fichier actuellement séléctionné dans la liste. On le passera à PDFViewer.
    const [file, setFile] = useState(null);

    const [loadingFiles, setLoadingFiles] = useState(false);

    let myFilesURL = (auth?.role == "classe" ? "/getCoursClass" : "/getCours");
    let sharedFilesURL = (auth?.role == "classe" ? "/getCours" : "/getCoursClass");
    let myFilesParams = (auth?.role == "classe" ? { id: auth?.idclasse, cours: "maths" } : { mail: auth?.user, cours: "maths" })
    let sharedFilesParams = (auth?.role == "classe" ? { mail: localStorage.getItem("mailEleve"), cours: "maths" } : { id: auth?.idclasse, cours: "maths" })
    let deleteParams;
    let deleteFileURL;

    if (auth?.role == "classe") {
        deleteFileURL = "/coursClasse";
        deleteParams = { id: auth?.idclasse, matiere: "maths" }

    } else if (auth?.role == "eleve") {
        deleteFileURL = "/coursEleve";
        deleteParams = { mail: auth?.user, matiere: "maths" }
    }


    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const myFilesResponse = await axios.get(myFilesURL, {
                params: { ...myFilesParams },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setMyFiles(myFilesResponse.data.files)
            if (selectedUI == "my")
                setMenuSelection(myFilesResponse.data.files)

            const sharedFilesResponse = await axios.get(sharedFilesURL, {
                params: { ...sharedFilesParams },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setSharedFiles(sharedFilesResponse.data.files)
            if (selectedUI == "shared")
                setMenuSelection(sharedFilesResponse.data.files)
        }

        catch (error) {
            console.log(error)

        }

        setLoadingFiles(false);
    }

    const deleteFile = async (f) => {
        try {
            const myFilesResponse = await axios.delete(deleteFileURL, {
                headers: { 'Content-Type': 'application/json' },
                data : {...deleteParams, cours: f },
                withCredentials: true
            });
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="fileMain">
            <section className="fileManager">
                <div className="fileManagerMenu">
                    <Tooltip title="Refresh" placement="right">
                        <IconButton size="small" onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></IconButton>
                    </Tooltip>
                    <h4 onClick={() => { setMenuSelection(myFiles); setSelectedUI("my") }} style={selectedUI == "my" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}>Mes documents partagés</h4>
                    <h4 onClick={() => { setMenuSelection(sharedFiles); setSelectedUI("shared") }} style={selectedUI == "shared" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}>Partagés avec moi</h4>
                </div>
                <div className="fileList">
                    {Array.from(Array(menuSelection?.length), (e, i) => {
                        return <div key={i} onClick={() => setFile(menuSelection[i])} className="file">{menuSelection[i]}
                        {selectedUI == "my" ? <IconButton size="small" style={{ color: "white", borderRadius: 0, padding: "0.5rem, 0.5rem" }} onClick={() => deleteFile(menuSelection[i])}><FontAwesomeIcon icon={faXmark} /></IconButton>:<></>}</div>
                    })}
                </div>
                <div className="fileUploadFormContainer">
                    <PDFSender />
                </div>
            </section>
            <section className="fileViewer">
                <PDFViewer clickedFile={file} selected={selectedUI} />
            </section>
        </div>

    )
}

export default Documents;