import Form from "../components/Form"
import FileList from "../components/FileList"
import PDFViewer from "../components/PDFViewer";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";

const Documents = () => {

    const { auth } = useAuth();
    const [files, setFiles] = useState([]);
    console.log(files?.length)
    const [file, setFile] = useState(null);

    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {            
            const response = await axios.get("/getCours", {
                params: { mail: auth?.user, cours: "maths" },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            console.log("↓ Réponse fichiers ↓")
            console.log(response)
            
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="fileMain">
            <section className="fileManager">
                <div className="fileList">
                    <div onClick={() => setFile("https://curve.fi/files/stableswap-paper.pdf")} className="file">Cours 1</div>
                    <div onClick={() => setFile("https://uniswap.org/whitepaper.pdf")} className="file">Cours 2</div>
                    {/* {Array.from(Array(files?.length), (e, i) => {
                        return <div onClick={() => setFile(URL.createObjectURL(files[i]))} className="file">{files[i].name}</div>
                    })} */}
                </div>
                <div className="fileUploadFormContainer">
                    <Form />
                </div>
            </section>
            <section className="fileViewer">
                <PDFViewer clickedFile={file} />
            </section>
        </div>

    )
}

export default Documents;