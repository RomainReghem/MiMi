import Form from "../components/Form"
import FileList from "../components/FileList"
import PDFViewer from "../components/PDFViewer";

import useAuth from "../hooks/useAuth";
import { useState } from "react";

const Documents = () => {

    const { auth } = useAuth();
    const [file, setFile] = useState(null);

    /*useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            const response = await axios.get("/getFiles", {
                params: { mail: auth.mail }
            });
            console.log("Réponse loadFiles : " + response.data)
        } catch (error) {
            console.log(error)
        }
    }*/

    return (
        <div className="fileMain">
            <section className="fileManager">
            <div className="fileList">
                <div onClick={() => setFile("https://curve.fi/files/stableswap-paper.pdf")} className="file">Cours 1</div>
                <div onClick={() => setFile("https://uniswap.org/whitepaper.pdf")} className="file">Cours 2</div>
                <div className="file">Cours 3</div>
                <div className="file">Cours 4</div>
            </div>
                <div className="fileUploadFormContainer">
                    <Form />
                </div>
            </section>
            <section className="fileViewer">                
            <PDFViewer clickedFile = {file}/>
            </section>
        </div>

    )
}

export default Documents;