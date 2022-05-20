import PDFSender from "../components/PDFSender"
import FileList from "../components/FileList"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import PDFViewer from "../components/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
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
    let sharedFilesURL = (auth?.role == "classe" ? "/getCours" : "/getCoursClasse")

    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const myFilesResponse = await axios.get(myFilesURL, {
                params: { mail: auth?.user, cours: "maths" },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setMyFiles(myFilesResponse.data.files)

            const sharedFilesResponse = await axios.get(sharedFilesURL, {
                params: { id: auth?.idclasse, cours: "maths" },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setSharedFiles(sharedFilesResponse.data.files)
            
        } catch (error) {
            console.log(error)

        }
        setLoadingFiles(false);
    }

    return (
        <div className="fileMain">
            <section className="fileManager">
                <div className="fileManagerMenu">
                <Tooltip title="Refresh" placement="right">                
                    <IconButton size="small" onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></IconButton>
                </Tooltip>
                <h4 onClick={() => {setMenuSelection(myFiles);setSelectedUI("my")}} style={selectedUI == "my" ? ({textDecoration : "underline"}) : ({textDecoration : "none"})}>Mes documents partagés</h4>
                <h4 onClick={() => {setMenuSelection(sharedFiles);setSelectedUI("shared")}} style={selectedUI == "shared" ? ({textDecoration : "underline"}) : ({textDecoration : "none"})}>Partagés avec moi</h4>
                </div>
                <div className="fileList">
                    {Array.from(Array(menuSelection?.length), (e, i) => {
                        return <div key={i} onClick={() => setFile(menuSelection[i])} className="file">{menuSelection[i]}</div>
                    })}
                </div>
                <div className="fileUploadFormContainer">
                    <PDFSender />
                </div>
            </section>
            <section className="fileViewer">
                <PDFViewer clickedFile={file} />
            </section>
        </div>

    )
}

export default Documents;