import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import { useEffect, useState } from "react"
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = (props) => {

    const { auth } = useAuth();

    const [numPages, setNumPages] = useState(null);
    const [file, setFile] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log("success")
        setNumPages(numPages);
    }

    useEffect(() => {
        async function convertingFile() {
            console.log(props.clickedFile)
            let data = await getFile()
            let binary = '';
            let bytes = new Uint8Array(data)
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            let b64 = window.btoa(binary)
            let byteChar = window.atob(b64)
            const byteNumbers = new Array(byteChar.length);
            for (let i = 0; i < byteChar.length; i++) {
                byteNumbers[i] = byteChar.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {type: "pdf"});

            setFile(URL.createObjectURL(blob))
        }
        convertingFile();
        console.log(file)

    }, [props.clickedFile])

    const getFile = async () => {
        try {
            const response = await axios.get("/getFile", {
                params: { mail: auth?.user, cours: "maths", name: props.clickedFile },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            return response.data.file.data;

        } catch (error) {
            console.log(error)
        }
    }


    return (
        <>
            {file ?
                (<Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(Array(numPages), (e, i) => {
                        return <Page width={600} key={i} pageNumber={i + 1} />
                    })}
                </Document>)
                : <p>Séléctionnez un document pour l'afficher...</p>}

        </>
    );
}

export default PDFViewer;