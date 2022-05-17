import PDFSender from "../components/PDFSender"
import FileList from "../components/FileList"
import PDFViewer from "../components/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";

const Documents = () => {

    const { auth } = useAuth();

    // Tableau de tous les noms des fichiers 
    const [files, setFiles] = useState([]);

    // Le fichier actuellement séléctionné dans la liste. On le passera à PDFViewer.
    const [file, setFile] = useState(null);

    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {         
            setLoadingFiles(true);   
            const response = await axios.get("/getCours", {
                params: { mail: auth?.user, cours: "maths" },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });            
            setFiles(response.data.files)            
        } catch (error) {
            console.log(error)
            
        }
        setLoadingFiles(false);
    }

    return (
        <div className="fileMain">
            <section className="fileManager">
                <div onClick={loadFiles} style={{alignSelf:"flex-start", marginBottom:"0.5rem"}}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles}/></div>
                <div className="fileList">
                    {Array.from(Array(files?.length), (e, i) => {
                        return <div key={i} onClick={() => setFile(files[i])} className="file">{files[i]}</div>
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